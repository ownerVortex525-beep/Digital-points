# CYBER-FORCE OSINT Deep-Dive — Build Plan

## Vision
A professional, neumorphic graph visualization tool for OSINT investigations. Works fully client-side via vis-network. Responsive design for desktop and mobile. Multi-theme with neon glow effects.

## Architecture

```
cyber-force/
├── reference/           # Reference files (videos, zodiacgraph.html) — NOT committed
├── index.html           # Single HTML entry point
├── css/
│   ├── themes.css       # Theme variables (day/night/cyber/forest/ocean/auto)
│   ├── styles.css       # Core layout + responsive + neumorphism
│   └── animations.css   # Animations & transitions
├── js/
│   ├── app.js           # Main orchestrator (graph init, events, export)
│   ├── icons.js         # SVG icon system
│   ├── ui.js            # Modal, toast, confirm dialogs
│   ├── osint-data.js    # Seed intelligence + entity types
│   └── storage.js       # LocalStorage persistence
├── assets/
│   └── icons.svg        # Icon sprite definitions
├── reference/           # Reference files (ignored by git)
└── README.md
```

## Design System

### Themes
| Theme | Primary | Background | Surface | Accent |
|-------|---------|------------|---------|--------|
| Day | #0a0a0a | #f5f6fa | #ffffff | #0d6efd |
| Night | #0d6efd | #0a0a0a | #171717 | #38bdf8 |
| Cyber | #00ff88 | #000510 | #001020 | #00d4ff |
| Forest | #22c55e | #0c1a1a | #112d2a | #4ade80 |
| Ocean | #0ea5e9 | #0b1120 | #1e293b | #38bdf8 |
| Auto | Follows system preference |

### Color Palette
- **Accent**: #38bdfsky (cyan) — primary UI actions
- **Entity Types**:
  - Person: #4f46e5 (indigo)
  - Phone: #16a34a (green)
  - Email: #ca8a04 (amber)
  - Website: #0891b2 (teal)
  - Location: #c026d3 (fuchsia)
  - Company: #6d28d9 (purple)
  - Image: #be123c (red)
  - Wallet: #dc2626 (red-600)
  - Telegram: #0088cc (blue)
  - DarkWeb: #6f42c1 (purple)
  - DeepWeb: #17a2b8 (teal)
  - PGP: #a855f7 (purple-400)

### Neumorphism Style
- Glass panels: `background: rgba(255,255,255,0.05); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.1);`
- Inner shadow: `inset 0 2px 4px rgba(0,0,0,0.3);`
- Outer glow: `box-shadow: 0 8px 32px 0 rgba(0,0,0,0.37);`
- Button hover: subtle opacity shift + glow

## Components

### 1. Header Bar (Top)
- Logo + title (CYBER-FORCE)
- Global action buttons: Save JSON, Save PNG, Load JSON, Center View, Clear Canvas, Theme Switcher
- Responsive: collapses to icons on mobile

### 2. Graph Canvas (Center)
- vis-network instance with:
  - Interactive zoom (mouse wheel / pinch)
  - Pan (drag)
  - Node shapes (SVG icons)
  - Smooth cubic bezier edges with arrows
  - Hover tooltips
  - Selection highlights

### 3. Entity Palette (Bottom)
- Horizontal scrollable buttons for entity types
- Touch-friendly sizing (min 44px tap targets)
- Icons + labels

### 4. Edit Panel (Right Sidebar, Slide-in)
- When a node is selected:
  - Label edit field
  - Entity type display
  - Connect button
  - Delete node button
- When an edge is selected:
  - Delete edge button
- Slides in/out with CSS transition

### 5. Context Menu (Right-click)
- Dynamic based on target (canvas/node)
- Actions: Add entity, Connect, Delete, Center

### 6. Modal System
- Confirmation dialogs
- Help/instructions
- Label editing
- File load confirmation

### 7. Toast Notifications
- 3-second auto-dismiss
- Types: info (blue), success (green), warning (yellow), error (red)
- Stack vertically in fixed position

### 8. Size Slider (Hover over node)
- Appears when dragging nodes
- Adjusts node icon size
- Auto-hides on drag

## Build Phases

### Phase 1: Foundation (COMPLETE)
- [x] Reference analysis (zodiacgraph.html, videos)
- [x] Project structure
- [x] Theme system with CSS variables
- [x] .gitignore

### Phase 2: Core Components (COMPLETE)
- [x] index.html with vis-network integration
- [x] themes.css with all theme variables
- [x] styles.css with neumorphic design
- [x] animations.css

### Phase 3: JavaScript System (IN PROGRESS)
- [ ] icons.js — SVG icon definitions
- [ ] ui.js — Modal, toast, confirm
- [ ] osint-data.js — Entity types, seed data
- [ ] storage.js — Persistence logic
- [ ] app.js — Network graph, events, export

### Phase 4: Polish & Test (PENDING)
- [ ] Mobile responsiveness testing
- [ ] Touch interaction optimization
- [ ] Performance with large graphs
- [ ] Syntax validation all JS files

### Phase 5: Documentation (PENDING)
- [ ] README.md with usage guide
- [ ] Images guidance section
- [ ] GitHub Pages deployment instructions

### Phase 6: Deploy (PENDING)
- [ ] Final commit
- [ ] Push to GitHub
- [ ] Enable GitHub Pages

## Mobile Responsiveness

### Breakpoints
- **Mobile**: < 768px
  - Header buttons stack vertically
  - Entity palette becomes swipeable carousel
  - Edit panel becomes full-width slide-up
  - Touch targets min 44x44px
  - Pinch-to-zoom enabled

- **Tablet**: 768px - 1024px
  - Header condensed
  - Palette wraps to 2 rows
  - Edit panel narrower

- **Desktop**: > 1024px
  - Full header layout
  - Palette in single row
  - Edit panel fixed width 288px

### Touch Gestures
- Pinch to zoom
- Two-finger drag to pan
- Tap to select
- Long press for context menu
- Swipe palette horizontally on mobile

## Workflow

### Development
1. Run in browser directly (no server needed)
2. Files served from `/cyber-force/` root
3. vis-network loaded from CDN (unpkg)

### Data Flow
```
User Action → JS Handler → vis-network DataSet → Graph Update
                    ↓
            localStorage (auto-save on change)
                    ↓
          Export (JSON/PNG) on demand
```

### Persistence
- Graph state saved on every change event
- LocalStorage key: `CFGraph`
- Format: `{ nodes: [...], edges: [...], theme: "night" }`

### Export
- **JSON**: Raw graph data for re-import
- **PNG**: Canvas screenshot with watermark

## Testing Checklist
- [ ] Loads in Chrome/Firefox/Safari
- [ ] Graph canvas renders
- [ ] Entity palette buttons work
- [ ] Nodes can be added and connected
- [ ] Context menu works (desktop + mobile)
- [ ] Edit panel slides in/out
- [ ] Export JSON works
- [ ] Export PNG works
- [ ] Theme switching works
- [ ] Persists data on reload
- [ ] Mobile layout responsive
- [ ] All JS files syntax valid
