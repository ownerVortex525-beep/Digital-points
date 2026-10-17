# CYBER-FORCE OSINT Deep-Dive

A professional network-graph visualization tool for OSINT investigations across Telegram, Dark Web, and Deep Web networks.

## Demo
[Live Demo](https://Vortex525-beep.github.io/Digital-points/) (GitHub Pages)

## Features
- **Graph Visualization** using [vis-network](https://visjs.github.io/vis-network/)
- **Drag-and-drop** node placement
- **Context menus** for quick actions
- **JSON/PNG export** of investigations
- **Dark/Light themes**
- **Persistent storage** via localStorage

![Screenshot](assets/screenshot.png)

## Quick Start
1. Open `index.html` in Chrome/Firefox/Edge
2. Use the palette at the bottom to add entity nodes
3. Right-click for context menu
4. Export via header buttons

## Project Structure
```
cyber-force/
├── index.html          # Application entry point
├── css/
│   ├── styles.css      # Core + glass morphism UI styles
│   ├── themes.css      # Theme variables (day/night)
│   └── animations.css  # CSS animations
├── js/
│   ├── storage.js      # LocalStorage management
│   ├── osint-data.js   # Seed intelligence data
│   ├── icons.js        # Inline SVG icon system
│   ├── ui.js           # Modal, toast, confirm dialogs
│   ├── osint-deepdive.js # Deep-dive controller
│   ├── telegram-view.js  # Telegram data view
│   ├── darkweb-view.js   # Dark web data view
│   ├── deepweb-view.js   # Deep web data view
│   ├── tracechain.js     # Trace-chain rail UI
│   └── app.js            # Main app: graph init, events, export
├── assets/
│   ├── icons.svg       # Icon definitions
│   └── images/         # Static images (add your own screenshots here)
├── reference/
│   └── zodiacgraph.html # Reference implementation (zodiacgraph)
└── README.md
```

## Adding Images
Place images in `assets/images/`. Use them for:
- `screenshot.png` — README preview
- Custom node icons (referenced via file input)
- Logo graphics

## Images for `assets/images/`

Add these images to make the project complete:

| File | Purpose | Size |
|------|---------|------|
| `logo.png` | App logo in header/toolbars | 64x64px |
| `screenshot.png` | README preview screenshot | 1200x800px |
| `favicon.ico` | Browser tab icon | 32x32px |
| `pattern-bg.svg` | Background pattern texture | Tileable |

Use the file picker in the app's context menu to load custom images as graph nodes.

## Development
No build tools or server required. All vanilla JS/HTML/CSS with CDN dependency for `vis-network`.

## License
OSINT training tool — not for production use. All data is simulated.
