# Muse — a personal stylist you can talk to

A buildathon web app that turns “I have nothing to wear” into two outfits for your style and your day. Includes a seven-slide browser presentation with speaker notes.

## Run the demo

Requires Node.js 22+ (Node 22.9+ recommended). No dependencies to install.

```sh
git clone https://github.com/jj-stuff/muse-stylist.git
cd muse-stylist
cp .env.example .env
npm start
```

Open **http://localhost:3000**. Presentation: **http://localhost:3000/presentation.html**. Use arrow keys to advance and the Speaker notes button for the pitch script. Browser Print → Save as PDF exports all seven slides.

## Enable Gemini

Edit `.env` locally:

```dotenv
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.5-flash
GOOGLE_CLIENT_ID=   # optional: Google Calendar sign-in (OAuth web client; add your demo URL as an authorised origin)
```

Catalog pictures: with the key set, run `npm run pictures` once (macOS) to generate `public/assets/*.jpg`. Until then the app shows colour tiles.

Restart `npm start`. The badge should read **Gemini connected** (configuration present; the first successful styling request verifies API access). Get a key from [Google AI Studio](https://aistudio.google.com/apikey). Never commit `.env` or paste the key into browser code. You can change GEMINI_MODEL if your account uses a different supported model.

The server sends text and resized images using the [Gemini generateContent API](https://ai.google.dev/api/generate-content). It validates JSON responses against known clothing IDs and requires complete outfits. Gemini errors are shown to the user; they are not silently replaced by sample responses.

Without a key, **Sample demo** mode uses clothing names/categories, weather, preferences and a few supported refinement phrases. It does not interpret images or offer unrestricted AI conversation.

## 90-second demo script

1. Select Minimal, up to $100, Comfort first. Click **That sounds like me**.
2. Open **Your wardrobe**. Add three demo pieces, or upload photos and check each name/category.
3. Click **Style these pieces**. Choose **Class, then a date**. Set 18°C, Cloudy.
4. Submit. Show the two complete outfit options and short explanations.
5. Click **Something warmer**, then **My black sneakers**. Show the updated pieces.
6. Download a look, then open **The story** for the presentation.

## Scope and privacy

- Ten illustrative catalog items and sample prices; no real purchase links or live inventory.
- Manual weather, not a weather API.
- Photos remain in browser memory until the tab closes/reloads. No database or upload storage.
- In live mode, submitting a styling request sends photos and preferences to Google. Google's API data terms apply.
- The API key stays on the server. The sample demo works without one.
- This prototype has no accounts, persistent wardrobe, production rate limiting or billing controls. Keep a key-enabled deployment private until those controls exist. The public source contains no API credentials.
- Styling suggestions are illustrative and may need adjustment to actual fit, dress codes and conditions.

## Checks and deploy

```sh
npm test
npm run build
```

`build.mjs` produces a dependency-free Cloudflare Worker at `dist/server/index.js` with embedded frontend assets. Set `GEMINI_API_KEY` and optionally `GEMINI_MODEL` as runtime secrets on a private deployment. The built-in Node server binds to loopback for local demos.

## Files

- `public/` — app, catalog, styling and pitch deck
- `stylist.mjs` — input validation, sample recommendations and Gemini adapter
- `handler.mjs` — shared HTTP API
- `server.mjs` — local Node server
- `build.mjs` — self-contained Worker build
- `test/` — API and recommendation checks

Photo: [Unsplash clothing rail](https://images.unsplash.com/photo-1445205170230-053b83016050). Fonts: Instrument Serif and DM Sans via Google Fonts; local serif/sans fallbacks work offline.
