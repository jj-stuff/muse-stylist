---
name: Muse
description: A personal stylist you text. One Apple-style chat thread.
colors:
  bg: "#ffffff / dark #000000"
  ink: "#000000 / dark #ffffff"
  grey: "#6e6e73 / dark #98989f"
  bubble: "#e9e9eb / dark #262628"
  fill: "#f2f2f7 / dark #1c1c1e"
  sep: "#e5e5ea / dark #38383a"
  blue: "#007aff / dark #0a84ff"
  red: "#d70015 / dark #ff6961"
typography:
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Helvetica Neue, system-ui, sans-serif"
    fontSize: "17px"
    lineHeight: 1.35
  title:
    fontSize: "17px"
    fontWeight: 600
  card-title:
    fontSize: "19px"
    fontWeight: 600
  secondary:
    fontSize: "15px"
rounded:
  bubble: "20px (6px on the tail corner)"
  card: "22px"
  pictures: "16px"
  chip: "999px"
  sheet: "14px"
---

# Design System: Muse

## Overview

Muse looks and behaves like a text conversation. One thread, one composer, tap-to-reply chips. No headings, labels, step counters or taglines on the screen: everything Muse needs to say, it says as a message.

Source: `public/style.css`, `public/index.html`, `public/app.js`. The presentation (`presentation.html`) keeps its own look.

## Colours

iOS system colours, light and dark from `prefers-color-scheme`. Blue is the only accent: your messages, chips, links, the send button and the outfit numbers. Muse's messages are grey bubbles. Red only for errors and Remove.

## Type

The system face only (SF on Apple devices). 17px for messages and inputs (never under 16px on inputs, so iOS doesn't zoom), 15px for card detail and secondary text, 600 weight for titles.

## Layout

- Top bar: "Muse" centred, "Closet" with a count on the right.
- Thread: centred column up to 800px, messages anchored to the bottom like a chat.
- Dock: chips row that scrolls sideways, then + (photos), the message field and the send button.
- Outfit cards: picture grid first (2×2, adapting to 2 or 3 pieces), a blue number, the title, the pieces with brand and price in grey, then the reasoning. Three across on wide screens, swiped on phones.
- Closet: a native `<dialog>` sheet with inset grouped lists (your pieces, brands Muse knows).

## Motion

Messages, cards and chips rise 12px and fade in over about 0.3s. Buttons scale down on press. The typing dots pulse only while a request is running. Everything collapses under `prefers-reduced-motion`.

## Rules

- No small uppercase labels, step counters ("1/3") or taglines.
- No gradients, glass or shadows on resting things.
- Pictures of catalog pieces are generated illustrations (`npm run pictures`), never presented as the brand's own product photos.
