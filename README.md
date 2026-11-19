# Coy Discover

A small, mobile-first discovery app inspired by Coy's focus on mutual interest and privacy. Browse one profile at a time, like or pass, and see a match only when the interest goes both ways.

## Run it locally

You’ll need Node.js 20 or newer and npm.

```bash
npm install
npm run dev
```

The client is available at [http://localhost:5173](http://localhost:5173). Vite proxies `/feed`, `/swipe`, and `/matches` to the Express API on port `3001`.

To build and run the production version:

```bash
npm run build
npm start
```

Express serves the built client and API together on port `3001`. Set `PORT` to use another port.

## What the app does

- **Discover:** Browse 30 seeded profiles with a name, age, photo, short bio, location, and interests. The card supports touch or mouse dragging, keyboard arrow keys when focused, and visible Like and Pass buttons.
- **Matches:** See mutual matches. Several profiles are seeded as having already liked the demo user so a match can happen during a walkthrough.
- **Home:** A landing page with a short explanation, discovery and match counts, and a link into Discover.
- **Privacy:** The feed response never includes whether a profile has liked the user. That information stays on the server and is only used to decide whether a Like creates a mutual match.
- **Persistence:** Swipes and matches are saved in `data/db.json`, so they remain after refreshes and app restarts.

The app uses a single demo user named `demo`; it does not include authentication or a live-user database. Profile photos are loaded from Random User and need an internet connection. The profiles and interactions are mock data for demonstration purposes.

## Deploy to Vercel

The project is set up for Vercel's Express runtime. The build copies Vite's output to `public/` so Vercel can serve the client from its CDN, while the root `index.js` exposes the Express API. `public/` is generated during the build and is not committed.

On Vercel, swipe and match state is held in the running function's memory. It can reset when Vercel replaces or restarts that function. Local runs continue to save state in `data/db.json`.

## API

### `GET /feed`

Returns profiles the demo user has not swiped on yet, along with the number remaining. The response intentionally omits each profile’s inbound-like status.

```json
{
  "profiles": [
    {
      "id": "profile-01",
      "name": "Ananya",
      "age": 24,
      "city": "Bengaluru",
      "bio": "Part-time cafe hopper, full-time playlist curator.",
      "interests": ["Live music", "Coffee", "Design"],
      "photo": "https://..."
    }
  ],
  "remaining": 30
}
```

### `POST /swipe`

Records one swipe. Send `profileId` and `direction` (`like` or `pass`) as JSON. The response includes `match: null` unless this Like completes a mutual match. Repeating a swipe returns `409`; an unknown profile returns `404`; an unsupported direction returns `400`.

```json
{
  "profileId": "profile-01",
  "direction": "like"
}
```

### `GET /matches`

Returns mutual matches for the demo user. A profile appears here only after the demo user has liked someone who was seeded as already liking them.

## Project layout

```text
src/
  main.jsx           React entry point
  ui/App.jsx         Screens, navigation, cards, and swipe interactions
  ui/styles.css      Responsive layout and visual styles
server/
  index.js           Express API and JSON persistence
  profiles.js        Seed profile data
vite.config.js       Development server and API proxy
```

## Reset the demo

Stop the app, then remove `data/db.json`. It will be recreated with an empty swipe and match history the next time the API starts.
