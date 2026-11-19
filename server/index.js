import express from 'express';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { profiles } from './profiles.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3001;
const dataDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dataDir, 'db.json');
const clientDir = path.join(__dirname, '..', 'dist');
const onVercel = process.env.VERCEL === '1';
let serverlessDb = { swipes: {}, matches: [] };

app.use(express.json());

async function readDb() {
  if (onVercel) return serverlessDb;
  try {
    return JSON.parse(await readFile(dbPath, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    const fresh = { swipes: {}, matches: [] };
    await saveDb(fresh);
    return fresh;
  }
}

async function saveDb(db) {
  if (onVercel) {
    serverlessDb = db;
    return;
  }
  await mkdir(dataDir, { recursive: true });
  await writeFile(dbPath, `${JSON.stringify(db, null, 2)}\n`);
}

function publicProfile(profile) {
  const { likedMe, ...visible } = profile;
  return visible;
}

app.get('/feed', async (_req, res, next) => {
  try {
    const db = await readDb();
    const userSwipes = db.swipes.demo || {};
    const feed = profiles.filter(({ id }) => !userSwipes[id]).map(publicProfile);
    res.json({ profiles: feed, remaining: feed.length });
  } catch (error) { next(error); }
});

app.post('/swipe', async (req, res, next) => {
  try {
    const { profileId, direction } = req.body || {};
    const profile = profiles.find(({ id }) => id === profileId);
    if (!profile) return res.status(404).json({ error: 'Profile not found.' });
    if (!['like', 'pass'].includes(direction)) return res.status(400).json({ error: 'Direction must be like or pass.' });

    const db = await readDb();
    db.swipes.demo ||= {};
    if (db.swipes.demo[profileId]) return res.status(409).json({ error: 'This profile has already been swiped on.' });
    db.swipes.demo[profileId] = { direction, createdAt: new Date().toISOString() };

    let match = null;
    if (direction === 'like' && profile.likedMe) {
      if (!db.matches.some(({ id }) => id === profileId)) {
        match = publicProfile(profile);
        db.matches.push({ id: profileId, createdAt: new Date().toISOString() });
      }
    }
    await saveDb(db);
    res.json({ ok: true, match, remaining: profiles.length - Object.keys(db.swipes.demo).length });
  } catch (error) { next(error); }
});

app.get('/matches', async (_req, res, next) => {
  try {
    const db = await readDb();
    const matches = (db.matches || []).map(({ id, createdAt }) => {
      const profile = profiles.find((entry) => entry.id === id);
      return profile ? { ...publicProfile(profile), matchedAt: createdAt } : null;
    }).filter(Boolean);
    res.json({ matches });
  } catch (error) { next(error); }
});

if (existsSync(path.join(clientDir, 'index.html'))) {
  if (onVercel) {
    app.get('/', (_req, res, next) => res.sendFile(path.join(clientDir, 'index.html'), (error) => error && next(error)));
  } else {
    app.use(express.static(clientDir));
    app.get('*', (_req, res) => res.sendFile(path.join(clientDir, 'index.html')));
  }
}
app.use((_req, res) => res.status(404).json({ error: 'Route not found.' }));
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'Something went wrong.' });
});

if (!onVercel) app.listen(port, () => console.log(`Coy Discover API running on http://localhost:${port}`));

export default app;
