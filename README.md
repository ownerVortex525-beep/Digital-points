# CYBER-FORCE — OSINT Deep-Dive Module

A professional OSINT investigation visualization tool for tracing digital footprints across Telegram, Dark Web, and Deep Web networks.

## Features

- **Multi-source Intelligence**: Visualize relationships across Telegram channels, dark web marketplaces, and deep web nodes
- **Trace Chain**: Build and visualize investigation chains with confidence scoring
- **Interactive Views**: Zoomable graph views with filtering and search capabilities
- **Export Tools**: Export investigations as JSON or PNG images
- **Dark Mode Support**: Built-in night/day theme switching
- **Persistent Storage**: Save investigation states and cases locally

## Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/ownerVortex525-beep/Digital-points.git
   ```

2. Open `index.html` in a modern web browser (Chrome, Firefox, Edge, or Safari)

3. No server or build tools required — runs entirely in the browser

## Project Structure

```
cyber-force/
├── index.html          # Main application entry point
├── css/
│   ├── styles.css      # Core styling
│   ├── themes.css      # Theme variables (light/dark modes)
│   └── animations.css  # CSS animations and transitions
├── js/
│   ├── app.js          # Application bootstrap
│   ├── storage.js      # Local storage management
│   ├── osint-data.js   # Seed data and mock intelligence
│   ├── icons.js        # Icon system and utilities
│   ├── ui.js           # UI components and helpers
│   ├── osint-deepdive.js  # Deep-dive controller
│   ├── deepdive-init.js   # Initialization routines
│   ├── telegram-view.js   # Telegram intelligence view
│   ├── darkweb-view.js    # Dark web visualization view
│   ├── deepweb-view.js    # Deep web mapping view
│   └── tracechain.js      # Trace chain rail UI
└── assets/
    ├── icons.svg       # Inline SVG icon definitions
    └── images/         # Static image assets
```

## Usage

### Starting an Investigation

1. Select a module from the sidebar: **Telegram**, **Dark Web**, or **Deep Web**
2. Click on any node to expand related connections
3. Use the **Trace Chain** rail (right sidebar) to build your investigation path

### Building a Trace Chain

- Click the **"Add to Chain"** button on any node to append it to your trace chain
- Reorder hops using the move up/down buttons
- Remove hops with the remove button
- Chain confidence is calculated as the product of all hop confidences

### Saving Cases

1. Build your investigation chain
2. Click **"Save as Case"** in the trace chain rail
3. Enter a case name and confirm
4. Saved cases appear in the cases list at the bottom of the rail

### Exporting

- **Export JSON**: Download investigation data as structured JSON
- **Export PNG**: Download a canvas-rendered timeline image

## Browser Requirements

- **Modern browsers**: Chrome 70+, Firefox 65+, Safari 12+, Edge 79+
- **JavaScript**: ES6+ support required
- **Storage**: localStorage enabled (for saving cases and drafts)

## Data Privacy

All investigation data is stored locally in your browser. No data is transmitted to external servers. The application contains simulated/synthetic training data for demonstration purposes.

## License

This project is provided for OSINT training and investigation visualization purposes.

## Acknowledgements

Built with vanilla JavaScript, CSS Grid/Flexbox, and SVG for high-performance visualization without external dependencies.
