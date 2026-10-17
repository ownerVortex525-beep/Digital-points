# CYBER-FORCE OSINT Deep-Dive

A professional network-graph visualization tool for OSINT investigations across Telegram, Dark Web, and Deep Web networks.

## Demo
View the live app by opening `index.html` in any modern browser.

## Screenshots
Add screenshots in `assets/images/screenshot.png` and update the references below:

![Day Theme](assets/images/screenshot.png)

## Features

- **Graph Visualization** — powered by [vis-network](https://visjs.github.io/vis-network/)
- **Drag-and-drop** node placement on canvas
- **Context menus** for quick actions (desktop right-click, mobile long-press)
- **Export** investigations as JSON or PNG
- **Multi-theme** support: Night, Day, Cyber, Forest, Ocean, Midnight, Auto
- **Neumorphic UI** with glass-morphism panels and neon glow accents
- **Responsive design** — optimized for desktop, tablet, and mobile
- **Persistent storage** via localStorage (auto-saves every change)
- **Keyboard shortcuts** (Ctrl/Cmd + shortcuts)
- **Touch-friendly** interface with appropriate tap targets

## Quick Start

No build tools or server required. Simply open `index.html` in Chrome, Firefox, Safari, or Edge.

## Project Structure

```
cyber-force/
├── index.html              # Application entry point (HTML + layout)
├── plan.md                 # Build plan & architecture documentation
├── css/
│   ├── styles.css          # Core styles, neumorphism, responsive layout
│   ├── themes.css          # Theme variables (7 themes + auto)
│   └── animations.css      # CSS animations & transitions
├── js/
│   ├── app.js              # Main orchestrator (graph, events, export)
│   ├── icons.js            # Inline SVG icon system
│   ├── ui.js               # Modal, toast, confirm dialogs
│   ├── osint-data.js       # Entity types, seed data, edge types
│   ├── storage.js          # LocalStorage management & themes
│   ├── osint-deepdive.js   # Deep-dive controller (legacy compatibility)
│   ├── telegram-view.js    # Telegram data view (legacy compatibility)
│   ├── darkweb-view.js     # Dark web data view (legacy compatibility)
│   ├── deepweb-view.js     # Deep web data view (legacy compatibility)
│   └── tracechain.js       # Trace-chain rail UI (legacy compatibility)
├── assets/
│   ├── icons.svg           # SVG icon sprite definitions
│   └── images/             # Static images (screenshots, logos, favicons)
├── reference/              # Reference files (NOT committed to git)
│   ├── zodiacgraph.html    # Reference implementation
│   └── *.mp4               # Reference videos (NOT committed)
└── README.md
```

## Images Guide

Place images in `assets/images/`. Here's what each should be:

| File | Purpose | Recommended Size | Notes |
|------|---------|------------------|-------|
| `logo.png` | App logo in header/toolbars | 64×64px | Transparent background |
| `screenshot.png` | README preview image | 1200×800px | Full app screenshot |
| `favicon.ico` | Browser tab icon | 32×32px | 16x16 also accepted |
| `pattern-bg.svg` | Subtle background texture | Tileable | Optional SVG pattern |

### Loading Custom Node Images
1. Right-click any entity node → "Load Image" (via context menu)
2. Or use the file input at bottom-right of the app
3. Selected images become node icons on the canvas

## Themes

| Theme | Mode | Primary | Background |
|-------|------|---------|------------|
| **Night** (default) | Dark | #38bdf8 (cyan) | #0a0a0a (black) |
| **Day** | Light | #0d6efd (blue) | #f5f6fa (light gray) |
| **Cyber** | Dark | #00ff88 (neon green) | #000510 (deep dark) |
| **Forest** | Dark | #4ade80 (green) | #0c1a1a (dark green) |
| **Ocean** | Dark | #0ea5e9 (blue) | #0b1120 (navy) |
| **Midnight** | Dark | #5132f5 (purple) | #02040e (near black) |
| **Auto** | Dynamic | Follows system | Uses `prefers-color-scheme` |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + D` | Toggle Day/Night theme |
| `Ctrl/Cmd + E` | Export JSON |
| `Ctrl/Cmd + P` | Export PNG |
| `Ctrl/Cmd + O` | Load JSON |
| `Ctrl/Cmd + N` | Clear canvas |
| `Ctrl/Cmd + H` | Show help |
| `+` / `-` | Zoom in/out |
| `Delete` | Delete selected node/edge |
| `Escape` | Cancel connection mode |
| Double-click | Edit node label |

## Entity Types

| Type | Color | Category |
|------|-------|----------|
| Person | 🟣 Indigo | Identity |
| Phone | 🟢 Green | Identity |
| Email | 🟡 Amber | Identity |
| Website | 🔵 Teal | Digital |
| Location | 🟣 Fuchsia | Physical |
| Company | 🟣 Purple | Organization |
| Wallet | 🔴 Red | Financial |
| Telegram | 🔵 Cyan | Communication |
| Channel | 🔵 Blue | Communication |
| Bot | 🟢 Emerald | Automation |
| IP Address | 🟠 Orange | Network |
| Domain | 🔵 Sky | Network |
| PGP Key | 🟣 Violet | Security |
| Document | 🟡 Gold | Evidence |
| Portal | 🔴 Red | Dark Web |
| Marketplace | 🟠 Burnt Orange | Dark Web |
| Database | 🔵 Blue | Deep Web |
| Record | 🟠 Orange | Deep Web |
| Archive | ⚫ Gray | Deep Web |

## Development

No build tools or server required. All vanilla JS with CDN dependencies.

```bash
# Start developing
open index.html

# Run syntax checks
for f in js/*.js; do node -c "$f"; done
```

## License

OSINT training tool — not for production use. All data is simulated/synthetic.

## Acknowledgements

- [vis-network](https://visjs.github.io/vis-network/) — Graph visualization engine
- [Simple Icons](https://simpleicons.org/) — Some icon references
- Reference implementation: Zodiac Graph (included in `reference/`)
