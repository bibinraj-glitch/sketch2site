# Sketch2Site

Sketch2Site is an AI-assisted visual website builder: draw a layout on a Paint-inspired canvas, convert it into a responsive website, preview the result, inspect generated code, and export it.

## What works

- Landing page and editor workflow
- Object-based SVG canvas with selection, dragging, resizing, grid, snap, zoom, and website element tools
- Local structured conversion from sketch objects to semantic website blocks
- Live desktop, tablet, and mobile preview
- Local AI-style improvements and style presets without an API key
- Undo/redo, keyboard shortcuts, local save/open, code viewer, and downloads

## Run locally

Install dependencies with pnpm, then run the Sketch2Site web package:

    pnpm install
    pnpm --filter @workspace/sketch2site run dev

The first build works without external credentials. Copy artifacts/sketch2site/.env.example to .env only when wiring a vision-capable AI provider.
