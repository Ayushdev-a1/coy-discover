import { profiles } from '../server/profiles.js';

const db = { swipes: { demo: {} }, matches: [] };

function publicProfile(profile) {
  const { likedMe, ...visible } = profile;
  return visible;
}

export default function handler(req, res) {
  const route = req.query?.path || new URL(req.url, 'http://localhost').searchParams.get('path');

  if (route === '/feed' && req.method === 'GET') {
    const swipes = db.swipes.demo;
    const feed = profiles.filter(({ id }) => !swipes[id]).map(publicProfile);
    return res.status(200).json({ profiles: feed, remaining: feed.length });
  }

  if (route === '/matches' && req.method === 'GET') {
    const matches = db.matches.map(({ id, createdAt }) => {
      const profile = profiles.find((entry) => entry.id === id);
      return profile ? { ...publicProfile(profile), matchedAt: createdAt } : null;
    }).filter(Boolean);
    return res.status(200).json({ matches });
  }

  if (route === '/swipe' && req.method === 'POST') {
    const { profileId, direction } = req.body || {};
    const profile = profiles.find(({ id }) => id === profileId);
    if (!profile) return res.status(404).json({ error: 'Profile not found.' });
    if (!['like', 'pass'].includes(direction)) {
      return res.status(400).json({ error: 'Direction must be like or pass.' });
    }
    if (db.swipes.demo[profileId]) {
      return res.status(409).json({ error: 'This profile has already been swiped on.' });
    }

    db.swipes.demo[profileId] = { direction, createdAt: new Date().toISOString() };
    let match = null;
    if (direction === 'like' && profile.likedMe) {
      match = publicProfile(profile);
      db.matches.push({ id: profileId, createdAt: new Date().toISOString() });
    }
    return res.status(200).json({
      ok: true,
      match,
      remaining: profiles.length - Object.keys(db.swipes.demo).length,
    });
  }

  return res.status(404).json({ error: 'Route not found.' });
}
