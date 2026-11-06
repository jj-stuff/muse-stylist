# Muse
## Platform
Web prototype for a buildathon.
## Audience and job
People deciding what to wear for their plans, including students moving from class to a date.
## Core flow
Answer three style questions (aesthetic, budget, comfort), upload clothes, enter weather and occasion, see two complete outfits, request a change.
## Constraints
Small illustrative clothing catalog; manual weather input. Gemini interprets photos and preferences when a server API key is configured. Sample mode is explicit and works without credentials. Photos remain in session memory and are sent to Gemini only for an explicit styling request in live mode.
## Stack
Implementation assumption: dependency-free browser app and Node server, with a Cloudflare Worker build. Browser-based pitch presentation. Public GitHub requested by user.
