# Muse
## Platform
Web prototype for a buildathon.
## Audience and job
People deciding what to wear for their plans, including students moving from class to a date.
## Core flow
A chat with Muse. Show what you own (photos, typed pieces like "black jeans, white tee", or pieces from brands Muse knows, or skip). Pick example look 1, 2 or 3 for your style, then budget and comfort. Muse reads the weather from your location (asks if denied) and offers your Google Calendar or a demo calendar. Three numbered outfits come back; reply "Wear 2" or ask for a change.
## Constraints
Small illustrative clothing catalog; manual weather input. Gemini interprets photos and preferences when a server API key is configured. Sample mode is explicit and works without credentials. Photos remain in session memory and are sent to Gemini only for an explicit styling request in live mode.
## Stack
Implementation assumption: dependency-free browser app and Node server, with a Cloudflare Worker build. Browser-based pitch presentation. Public GitHub requested by user.

## Decisions (Nov 2026)
- Audience: a judged live demo on one machine, with a private deployed link as backup.
- Calendar: real Google sign-in when GOOGLE_CLIENT_ID is set, plus an always-available demo calendar for the stage.
- Brands: real brand names on the ten catalog pieces; each price must be checked against a real product before it is shown as fact.
- Outfits: always three, numbered, so replies match the example looks.
- Pictures: catalog pieces use flat-lay illustrations generated once with Gemini (`npm run pictures`), stored in public/assets. Typed pieces show a colour from their colour word. No per-request image generation.
- The presentation is not linked from the app; open /presentation.html directly.
- Pushes go straight to main, only when asked, until the buildathon ends.
