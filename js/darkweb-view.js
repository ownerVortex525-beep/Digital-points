window.CF = window.CF || {};
window.CF.Views = window.CF.Views || {};

CF.Views.darkweb = (function () {
  'use strict';

  let container;
  let svg;
  let canvas;
  let animationFrame = null;
  let markets = [];
  let vendors = [];
  let listings = [];
  let wallets = [];
  let mirrors = [];
  let forums = [];
  let flows = [];
  let timeline = [];
  let overlayMode = 'default';
  let selectedNode = null;
  let identitySearchText = '';
  let identityMatches = [];

  const CLUSTER_POS = {
    'dw-mkt-01': { cx: 250, cy: 250, r: 90 },
    'dw-mkt-02': { cx: 550, cy: 320, r: 80 }
  };

  function mount(el) {
    container = el;
    if (container.dataset.mounted === 'darkweb') return;
    container.dataset.mounted = 'darkweb';

    loadData();
    render();

    CF.DeepDive.bus.on('node:select', onNodeSelect);
    CF.DeepDive.bus.on('identity:search', onIdentitySearch);
  }

  function unmount() {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
  }

  function loadData() {
    markets = CF.Storage.getAll('darkwebMarkets');
    vendors = CF.Storage.getAll('darkwebVendors');
    listings = CF.Storage.getAll('darkwebListings');
    wallets = CF.Storage.getAll('darkwebWallets');
    mirrors = CF.Storage.getAll('darkwebMirrors');
    forums = CF.Storage.getAll('darkwebForums');
    flows = CF.Storage.getAll('darkwebFlows');
    timeline = CF.Storage.getAll('darkwebTimeline');

    overlayMode = localStorage.getItem('cf.dd.overlay.darkweb') || 'default';
  }

  function render() {
    if (!container) return;
    container.innerHTML = '';

    renderHeader();
    renderLegalCard();
    renderOverlayToggle();
    renderConstellation();
    renderSankey();
    renderOnionTimeline();
    renderIdentityFinder();
  }

  function renderHeader() {
    const header = CF.UI.createEl('div', { class: 'deepdive__header' });
    header.innerHTML = `
      <div class="deepdive__header-title">
        ${CF.Icons.get('onion', { size: 'lg' })}
        <h2>Dark Web Investigations</h2>
      </div>
      ${CF.DeepDive.components.simBadge()}
    `;
    container.appendChild(header);
  }

  function renderLegalCard() {
    const card = CF.UI.createEl('div', {
      class: 'dw-legal-card',
      'aria-live': 'polite'
    });
    card.innerHTML = `
      <div class="dw-legal-icon">${CF.Icons.get('ethics', { size: 'md' })}</div>
      <div class="dw-legal-text">
        <strong>Legal / Ethics Notice</strong>
        <p>Simulated data for authorized investigation and training. Accessing real darknet markets requires legal authorization.</p>
      </div>
    `;
    container.appendChild(card);
  }

  function renderOverlayToggle() {
    const toggle = CF.UI.createEl('div', { class: 'dw-overlay-toggle' });
    toggle.innerHTML = `
      <span>Overlay:</span>
      <button type="button" class="dw-overlay-btn ${overlayMode === 'default' ? 'active' : ''}" data-mode="default">Default</button>
      <button type="button" class="dw-overlay-btn ${overlayMode === 'risk' ? 'active' : ''}" data-mode="risk">Risk</button>
      <button type="button" class="dw-overlay-btn ${overlayMode === 'trust' ? 'active' : ''}" data-mode="trust">Trust</button>
      <button type="button" class="dw-overlay-btn dw-overlay-legend" aria-label="Toggle legend">Legend</button>
    `;

    qsa('.dw-overlay-btn[data-mode]', toggle).forEach(btn => {
      btn.addEventListener('click', () => {
        overlayMode = btn.getAttribute('data-mode');
        localStorage.setItem('cf.dd.overlay.darkweb', overlayMode);
        toggle.classList.toggle('show-legend', btn.classList.contains('dw-overlay-legend'));
        refreshConstellation();
      });
    });

    container.appendChild(toggle);

    const legend = CF.UI.createEl('div', { class: 'dw-legend' });
    legend.innerHTML = `
      <div class="dw-legend-item"><span class="dw-legend-dot" style="background:var(--dw-accent)"></span> Market</div>
      <div class="dw-legend-item"><span class="dw-legend-dot" style="background:#6f42c1"></span> Vendor</div>
      <div class="dw-legend-item"><span class="dw-legend-dot" style="background:#fd7e14"></span> Listing</div>
      <div class="dw-legend-item"><span class="dw-legend-dot" style="background:var(--color-danger)"></span> Exit scam / seized</div>
      <div class="dw-legend-item"><span class="dw-legend-dot" style="background:var(--color-warning)"></span> Flagged</div>
    `;
    toggle.appendChild(legend);
  }

  function renderConstellation() {
    const width = 800;
    const height = 560;

    const canvasWrapper = CF.UI.createEl('div', { class: 'dw-constellation-wrapper' });

    canvas = CF.UI.createEl('canvas', {
      class: 'dw-ambient-canvas',
      width, height,
      'aria-hidden': 'true'
    }, [canvasWrapper]);
    canvasWrapper.appendChild(canvas);

    svg = CF.UI.createEl('svg', {
      class: 'dw-constellation-svg',
      width, height,
      'viewBox': `0 0 ${width} ${height}`,
      'role': 'img',
      'aria-label': 'Dark web marketplace constellation showing markets, vendors, listings, and wallets',
      tabindex: '0'
    }, [canvasWrapper]);

    container.appendChild(canvasWrapper);
    animateAmbient();

    drawClusters();
    drawNodes();
    drawEdges();
    drawPulses();
    defineMarkers();
  }

  function drawClusters() {
    markets.forEach(market => {
      const pos = CLUSTER_POS[market.id];
      if (!pos) return;

      const halo = CF.UI.createEl('circle', {
        class: 'dw-cluster-halo',
        cx: pos.cx, cy: pos.cy, r: pos.r + 40,
        fill: overlayMode === 'risk' ? 'rgba(220,53,69,0.08)' :
              overlayMode === 'trust' ? 'rgba(40,167,69,0.08)' :
              'rgba(13,13,13,0.15)'
      });
      svg.appendChild(halo);

      const label = CF.UI.createEl('text', {
        class: 'dw-cluster-label',
        x: pos.cx, y: pos.cy - pos.r - 15,
        'text-anchor': 'middle',
        'font-size': '11',
        html: market.name
      });
      svg.appendChild(label);
    });
  }

  function nodePosition(nodeId) {
    const node = vendors.find(v => v.id === nodeId) ||
                 listings.find(l => l.id === nodeId) ||
                 wallets.find(w => w.id === nodeId) ||
                 mirrors.find(m => m.id === nodeId) ||
                 forums.find(f => f.id === nodeId);

    if (!node) return null;

    let marketId;
    if (node.market) marketId = node.market;
    else if (node.vendor) {
      const v = vendors.find(vv => vv.id === node.vendor);
      marketId = v ? v.market : 'dw-mkt-01';
    }
    else if (node.wallet && node.wallet.startsWith('dw-w')) {
      const w = wallets.find(wt => wt.id === node.id);
      marketId = w ? w.market : 'dw-mkt-01';
    }

    const cluster = CLUSTER_POS[marketId] || CLUSTER_POS['dw-mkt-01'];
    const angle = (nodeId.charCodeAt(0) * 7 + nodeId.length * 13) % 360;
    const rad = angle * Math.PI / 180;
    const dist = cluster.r - 30;

    const offsetSeed = parseInt(nodeId.slice(-2), 36) || 0;
    const offset = 20 + (offsetSeed % 30);

    return {
      x: cluster.cx + Math.cos(rad) * (dist + offset * 0.3),
      y: cluster.cy + Math.sin(rad) * (dist + offset * 0.3)
    };
  }

  function drawNodes() {
    const allNodes = [...vendors, ...listings, ...wallets, ...mirrors, ...(forums || [])];

    allNodes.forEach(node => {
      const pos = nodePosition(node.id);
      if (!pos) return;

      const type = node.type || (node.address ? 'wallet' :
              (node.onion ? 'mirror' :
              (node.vendor ? 'listing' :
              (node.forum ? 'forum' :
              (node.title ? 'listing' :
              (node.address ? 'wallet' : 'vendor'))))));

      let nodeClass = '';
      let icon = '';
      let size = 36;

      switch (true) {
        case node.id.startsWith('dw-mkt'):
          nodeClass = 'dw-node-market';
          icon = CF.Icons.get('market', { size: 'md' });
          size = 44;
          break;
        case node.id.startsWith('dw-vendor'):
          nodeClass = 'dw-node-vendor';
          icon = CF.Icons.get('vendor', { size: 'md' });
          size = 40;
          if (node.trust) {
            const trustColor = node.trust > 0.8 ? '#28a745' : node.trust > 0.5 ? '#ffc107' : '#dc3545';
            svg.insertAdjacentHTML('beforeend', `<text class="dw-vendor-trust" x="${pos.x + size/2 + 5}" y="${pos.y - 8}" font-size="9" fill="${trustColor}">${Math.round(node.trust * 100)}%</text>`);
          }
          break;
        case node.id.startsWith('dw-list'):
          nodeClass = 'dw-node-listing';
          icon = CF.Icons.get('listing', { size: 'md' });
          size = 36;
          break;
        case node.id.startsWith('dw-wallet'):
          nodeClass = 'dw-node-wallet';
          icon = CF.Icons.get('wallet', { size: 'md' });
          size = 36;
          break;
        case node.id.startsWith('dw-mir'):
          nodeClass = 'dw-node-mirror';
          icon = CF.Icons.get('mirror', { size: 'md' });
          size = 34;
          break;
        case node.id.startsWith('dw-for'):
          nodeClass = 'dw-node-forum';
          icon = CF.Icons.get('forum', { size: 'md' });
          size = 38;
          break;
      }

      if (overlayMode === 'risk') {
        const riskColor = (node.risk || 0) > 80 ? 'var(--color-danger)' :
                         (node.risk || 0) > 50 ? 'var(--color-warning)' :
                         (node.risk || 0) > 30 ? '#ffc107' : '#28a745';
        icon = icon.replace(/fill="currentColor"/, `fill="${riskColor}"`).replace(/stroke="currentColor"/, `stroke="${riskColor}"`);
      }

      if (node.exitScam || node.seized) {
        const ring = CF.UI.createEl('circle', {
          class: 'dw-pulse-ring',
          cx: pos.x, cy: pos.y, r: size / 2 + 6,
          fill: 'none',
          stroke: 'var(--color-danger)',
          'stroke-width': 2,
          'stroke-dasharray': '4,4',
          style: 'animation: radar-sweep 3s linear infinite'
        });
        svg.appendChild(ring);
      }

      const g = CF.UI.createEl('g', {
        class: `dw-node ${nodeClass}`,
        'data-node-id': node.id,
        'data-node-type': type,
        tabindex: '0',
        role: 'button',
        'aria-label': node.name || node.title || node.address || node.id,
        'aria-describedby': node.seized ? `${node.id}-seized-flag` : undefined,
        transform: `translate(${pos.x}, ${pos.y})`,
        onclick: () => selectNode(node)
      });

      const bg = CF.UI.createEl('circle', {
        cx: 0, cy: 0, r: size / 2,
        class: 'dw-node-bg'
      }, [g]);

      if (node.category) {
        const catColors = {
          drugs: '#e74c3c', weapons: '#9b59b6', data: '#3498db',
          'forged-docs': '#f39c12', cards: '#1abc9c', accounts: '#9b59b6'
        };
        bg.setAttribute('fill', catColors[node.category] || '#3498db');
        bg.setAttribute('fill-opacity', '0.2');
      }

      const fo = CF.UI.createEl('foreignObject', {
        x: -size / 2, y: -size / 2, width: size, height: size
      }, [g]);
      fo.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%">${icon}</div>`;

      svg.appendChild(g);
    });
  }

  function drawEdges() {
    const edgeGroup = CF.UI.createEl('g', { class: 'dw-edges' }, [svg]);

    listings.forEach(listing => {
      const vendor = vendors.find(v => v.id === listing.vendor);
      const vPos = vendor ? nodePosition(vendor.id) : null;
      const lPos = nodePosition(listing.id);
      if (!vPos || !lPos) return;

      CF.UI.createEl('line', {
        class: 'dw-edge dw-edge--lists',
        x1: vPos.x, y1: vPos.y, x2: lPos.x, y2: lPos.y,
        'stroke-width': 1 + (listing.risk / 100) * 2,
        stroke: overlayMode === 'risk' ? 'var(--color-danger)' : '#6c757d'
      }, [edgeGroup]);
    });

    mirrors.forEach(mirror => {
      const market = markets.find(m => m.id === mirror.market);
      if (!market) return;
      const mPos = nodePosition(market.id);
      const mirPos = nodePosition(mirror.id);
      if (!mPos || !mirPos) return;

      CF.UI.createEl('line', {
        class: 'dw-edge dw-edge--mirror-of',
        x1: mPos.x, y1: mPos.y, x2: mirPos.x, y2: mirPos.y,
        'stroke-width': 2,
        stroke: '#6c757d',
        'stroke-dasharray': '4,4',
        'marker-end': 'url(#dw-arrow-mirror)'
      }, [edgeGroup]);
    });

    flows.forEach(flow => {
      const fromW = wallets.find(w => w.id === flow.from);
      const toW = flow.to ? wallets.find(w => w.id === flow.to) : null;
      if (!fromW) return;
      const fromPos = nodePosition(fromW.id);
      if (!fromPos) return;

      if (toW) {
        const toPos = nodePosition(toW.id);
        if (toPos) {
          const flowLine = CF.UI.createEl('path', {
            class: 'dw-flow-path',
            d: `M ${fromPos.x} ${fromPos.y} C ${(fromPos.x + toPos.x)/2} ${fromPos.y + 50} ${toPos.x} ${toPos.y}`,
            fill: 'none',
            stroke: '#17a2b8',
            'stroke-width': 2 + (parseFloat(flow.amount) || 0.5) * 3,
            'stroke-opacity': 0.6,
            'marker-end': 'url(#dw-arrow-flow)'
          }, [edgeGroup]);

          const midX = (fromPos.x + toPos.x) / 2;
          const midY = (fromPos.y + toPos.y) / 2;
          CF.UI.createEl('text', {
            class: 'dw-flow-label',
            x: midX, y: midY - 5,
            'text-anchor': 'middle',
            'font-size': '9',
            fill: '#17a2b8',
            html: flow.amount
          }, [edgeGroup]);
        }
      } else {
        const endX = fromPos.x + 100;
        const endY = fromPos.y + 50;
        CF.UI.createEl('path', {
          class: 'dw-flow-path dw-flow-path--drained',
          d: `M ${fromPos.x} ${fromPos.y} C ${endX} ${endY} ${endX} ${endY} ${endX} ${endY}`,
          fill: 'none',
          stroke: 'var(--color-danger)',
          'stroke-width': 3,
          'stroke-dasharray': '6,3'
        }, [edgeGroup]);

        CF.UI.createEl('text', {
          class: 'dw-flow-label dw-flow-label--drained',
          x: endX, y: endY,
          'text-anchor': 'middle',
          'font-size': '10',
          fill: 'var(--color-danger)',
          html: 'DRAINED'
        }, [edgeGroup]);
      }
    });
  }

  function drawPulses() {
    markets.forEach(market => {
      if (market.flag || market.exitScam || market.seized) {
        const pos = CLUSTER_POS[market.id];
        if (!pos) return;

        const pulse = CF.UI.createEl('circle', {
          class: 'dw-pulse-ring',
          cx: pos.cx, cy: pos.cy,
          r: 5,
          fill: 'none',
          stroke: 'var(--color-danger)',
          'stroke-width': 2
        });
        svg.appendChild(pulse);
      }
    });
  }

  function animateAmbient() {
    if (CF.UI.isReducedMotion() || !canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const relays = [];
    for (let i = 0; i < 20; i++) {
      relays.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: 2 + Math.random() * 3
      });
    }

    function renderAmbient() {
      if (!ctx) return;
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = 'rgba(0, 200, 255, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i < relays.length; i++) {
        for (let j = i + 1; j < relays.length; j++) {
          const dx = relays[j].x - relays[i].x;
          const dy = relays[j].y - relays[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.globalAlpha = Math.max(0, 0.2 - dist / 600);
            ctx.beginPath();
            ctx.moveTo(relays[i].x, relays[i].y);
            ctx.lineTo(relays[j].x, relays[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;

      const time = Date.now() * 0.0003;
      markets.forEach((market, idx) => {
        const pos = CLUSTER_POS[market.id];
        if (!pos) return;
        const sweepRadius = 30 + Math.sin(time * 2 + idx) * 20;
        ctx.strokeStyle = `rgba(0, 255, 100, ${0.1 + Math.sin(time + idx) * 0.05})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(pos.cx, pos.cy, sweepRadius, 0, 2 * Math.PI);
        ctx.stroke();
      });

      relays.forEach(r => {
        r.x += r.vx;
        r.y += r.vy;
        if (r.x < 0 || r.x > width) r.vx *= -1;
        if (r.y < 0 || r.y > height) r.vy *= -1;
        ctx.fillStyle = 'rgba(0, 200, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrame = requestAnimationFrame(renderAmbient);
    }
    animationFrame = requestAnimationFrame(renderAmbient);
  }

  function selectNode(node) {
    selectedNode = node;
    CF.DeepDive.bus.emit('node:select', node);
    refreshSankey();
  }

  function refreshConstellation() {
    qsa('.dw-node').forEach(n => n.remove());
    qsa('.dw-edge').forEach(e => e.remove());
    qsa('.dw-cluster-halo').forEach(h => h.remove());
    drawNodes();
    drawEdges();
    drawPulses();
  }

  function renderSankey() {
    const section = CF.UI.createEl('section', { class: 'dw-sankey-section' });
    section.innerHTML = '<h3>Wallet Flow Sankey</h3>';

    const width = 800;
    const height = 300;

    const svgEl = CF.UI.createEl('svg', {
      class: 'dw-sankey-svg',
      width, height,
      'viewBox': `0 0 ${width} ${height}`,
      'role': 'img',
      'aria-label': 'Wallet flow Sankey diagram from vendors through mixers to exchanges'
    });

    const nodeWidth = 20;
    const nodePositions = {
      'dw-wallet-03': { x: 50, y: height / 2 },
      'dw-wallet-04': { x: 300, y: height / 2 },
      'dw-wallet-05': { x: 550, y: height / 2 },
      'offshore': { x: 720, y: height / 2 }
    };

    const nodeLabels = {
      'dw-wallet-03': 'Vendor Escrow (12.8 BTC)',
      'dw-wallet-04': 'Mixer (5.4 BTC)',
      'dw-wallet-05': 'Exchange (0.028 BTC)',
      'offshore': 'Offshore Wallet'
    };

    flows.forEach((flow) => {
      const fromKey = flow.from in nodePositions ? flow.from :
                      flow.from && nodePositions['dw-wallet-03'] ? 'dw-wallet-03' : null;
      let toKey = flow.to in nodePositions ? flow.to :
                  flow.to && nodePositions[flow.to] ? flow.to :
                  'offshore';

      if (flow.to === null && flow.label.includes('Drained')) toKey = null;

      const fromPos = nodePositions[flow.from];
      const toPos = toKey ? nodePositions[toKey] : { x: 720, y: height * 0.7 };

      if (!fromPos) return;

      const amount = parseFloat(flow.amount) || 1;

      const midX = (fromPos.x + toPos.x) / 2;
      const path = `M ${fromPos.x + nodeWidth/2} ${fromPos.y} C ${midX} ${fromPos.y} ${midX} ${toPos.y} ${toPos.x - nodeWidth/2} ${toPos.y}`;

      const link = CF.UI.createEl('path', {
        class: 'dw-sankey-link',
        d: path,
        fill: 'none',
        stroke: '#17a2b8',
        'stroke-width': 3 + amount * 4,
        'stroke-opacity': 0.4,
        'marker-end': 'url(#dw-arrow-flow)'
      });

      link.addEventListener('mouseenter', () => {
        qsa('.dw-sankey-link').forEach(l => l.style.strokeOpacity = '0.15');
        link.style.strokeOpacity = '0.8';
      });
      link.addEventListener('mouseleave', () => {
        qsa('.dw-sankey-link').forEach(l => l.style.strokeOpacity = '0.4');
      });

      svgEl.appendChild(link);

      CF.UI.createEl('text', {
        class: 'dw-sankey-label',
        x: midX, y: (fromPos.y + toPos.y) / 2 - 5,
        'text-anchor': 'middle',
        'font-size': '10',
        fill: '#17a2b8',
        html: flow.amount
      })[0] ? svgEl.appendChild(svgEl.querySelector('.dw-sankey-label')) : null;

      const label = CF.UI.createEl('text', {
        class: 'dw-sankey-label',
        x: midX,
        y: (fromPos.y + toPos.y) / 2 - 5,
        'text-anchor': 'middle',
        'font-size': '10',
        fill: '#17a2b8',
        html: flow.amount
      });
      svgEl.appendChild(label);
    });

    Object.entries(nodePositions).forEach(([key, pos]) => {
      const bar = CF.UI.createEl('rect', {
        class: `dw-sankey-node ${selectedNode && selectedNode.id === key ? 'dw-sankey-node--selected' : ''}`,
        x: pos.x, y: pos.y - 10,
        width: nodeWidth,
        height: 20,
        fill: key === 'offshore' ? '#6c757d' : '#0d6efd',
        rx: 3
      });
      svgEl.appendChild(bar);

      CF.UI.createEl('text', {
        class: 'dw-sankey-node-label',
        x: pos.x + nodeWidth + 8,
        y: pos.y + 4,
        'font-size': '10',
        html: nodeLabels[key] || key
      }, [svgEl]);
    });

    section.appendChild(svgEl);
    container.appendChild(section);
  }

  function renderOnionTimeline() {
    const section = CF.UI.createEl('section', { class: 'dw-timeline-section' });
    section.innerHTML = '<h3>Onion Address Timeline</h3>';

    const track = CF.UI.createEl('div', { class: 'dw-timeline-track' });

    const allServices = [...markets, ...mirrors];
    allServices.forEach(service => {
      const item = CF.UI.createEl('div', { class: 'dw-timeline-item' });

      const firstSeen = service.firstSeen || service.listed;
      const lastSeen = service.lastSeen || '2023-06-18';

      item.innerHTML = `
        <div class="dw-timeline-service">
          <span class="dw-timeline-name">${service.name || service.onion}</span>
          <code class="dw-timeline-onion">${service.onion}<span class="dw-timeline-sim"> SIMULATED</span></code>
        </div>
        <div class="dw-timeline-bar">
          <div class="dw-timeline-marker" style="left:${firstSeenToDatePercent(firstSeen)}%" title="${firstSeen}">●</div>
          ${service.lastSeen ? `<div class="dw-timeline-marker dw-timeline-marker--last" style="left:${firstSeenToDatePercent(lastSeen)}%" title="${lastSeen}">●</div>` : ''}
          ${service.seized ? `<div class="dw-timeline-marker dw-timeline-marker--seized" style="left:50%" title="Seized">●</div>` : ''}
        </div>
        <div class="dw-timeline-dates">
          <span class="dw-timeline-date">${firstSeen || '?'} → ${lastSeen || '?'}</span>
          ${service.status ? `<span class="dw-timeline-status status--${service.status}">${service.status}</span>` : ''}
        </div>
      `;

      track.appendChild(item);

      qsa('.dw-timeline-marker', item).forEach(marker => {
        marker.addEventListener('click', (e) => {
          e.stopPropagation();
          CF.UI.toast(`Service: ${service.name || service.onion} — ${marker.title}`, { type: 'info' });
        });
      });
    });

    section.appendChild(track);
    container.appendChild(section);
  }

  function firstSeenToDatePercent(dateStr) {
    if (!dateStr) return 0;
    const year = parseInt(dateStr.substring(0, 4), 10);
    const month = parseInt(dateStr.substring(5, 7), 10);
    return Math.max(0, Math.min(100, ((year - 2019) * 12 + month - 1) / ((2023 - 2019) * 12 + 6) * 100));
  }

  function renderIdentityFinder() {
    const section = CF.UI.createEl('section', { class: 'dw-identity-section' });
    section.innerHTML = `
      <h3>Cross-Market Identity Finder</h3>
      <div class="dw-identity-search">
        <input type="text" class="dw-identity-input" placeholder="Enter alias, PGP fingerprint, or email..." aria-label="Search identity across markets">
        <button type="button" class="btn btn--sm btn--primary dw-identity-btn">${CF.Icons.get('search', { size: 'sm' })} Search</button>
      </div>
      <div class="dw-identity-results"></div>
    `;

    const input = section.querySelector('.dw-identity-input');
    const btn = section.querySelector('.dw-identity-btn');
    const results = section.querySelector('.dw-identity-results');

    const doSearch = () => {
      const text = input.value.trim().toLowerCase();
      if (!text) {
        results.innerHTML = '<p class="dw-identity-empty">Enter a search term to find cross-market identities.</p>';
        return;
      }

      identitySearchText = text;
      identityMatches = [];

      vendors.forEach(vendor => {
        let confidence = 0;
        if (vendor.alias && vendor.alias.toLowerCase() === text) confidence = 0.95;
        else if (vendor.pgp && vendor.pgp.toLowerCase().includes(text)) confidence = 0.92;
        else if (vendor.aliases && vendor.aliases.some(a => a.toLowerCase() === text)) confidence = 0.88;
        else if (vendor.links && vendor.links.some(l =>
          (l.type === 'email' && l.target.toLowerCase().includes(text)) ||
          (l.type === 'telegram' && l.target.toLowerCase().includes(text))
        )) confidence = 0.82;

        if (confidence > 0) {
          identityMatches.push({ vendor, confidence });

          drawMatchBeam(vendor.id);

          const samePgp = vendors.filter(v => v.pgp === vendor.pgp && v.id !== vendor.id);
          samePgp.forEach(same => {
            identityMatches.push({ vendor: same, confidence: 0.88, related: true });
          });
        }
      });

      wallets.forEach(wallet => {
        if (wallet.address && wallet.address.toLowerCase().includes(text)) {
          identityMatches.push({ wallet, confidence: 0.95 });
        }
      });

      const breaches = CF.Storage.getAll('deepwebBreaches');
      breaches.forEach(breach => {
        if (breach.name.toLowerCase().includes(text)) {
          identityMatches.push({ breach, confidence: 0.85 });
        }
      });

      results.innerHTML = identityMatches.length ? `
        <div class="dw-identity-list">
          <h4>Results for "${text}" (${identityMatches.length} matches)</h4>
          ${identityMatches.map(m => `
            <div class="dw-identity-match" data-id="${m.vendor?.id || m.wallet?.id}" style="border-color: ${m.related ? '#6c757d' : '#0d6efd'}">
              <span class="dw-match-confidence" style="background:${m.confidence > 0.9 ? '#28a745' : m.confidence > 0.8 ? '#0d6efd' : '#ffc107'}">${Math.round(m.confidence * 100)}%</span>
              <span class="dw-match-label">${m.vendor?.name || m.vendor?.alias || m.wallet?.address || m.breach?.name}</span>
              <span class="dw-match-type">${m.vendor ? 'Vendor' : m.wallet ? 'Wallet' : m.breach ? 'Breach' : 'Unknown'}</span>
            </div>
          `).join('')}
        </div>
      ` : `<p class="dw-identity-empty">No matches found.</p>`;

      CF.DeepDive.bus.emit('chain:add', identityMatches);
    };

    btn.addEventListener('click', doSearch);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); doSearch(); }
    });
    input.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/[<>;]/g, '');
    });

    container.appendChild(section);
  }

  function drawMatchBeam(nodeId) {
    if (!svg) return;
    const pos = nodePosition(nodeId);
    if (!pos) return;

    const market = vendors.find(v => v.id === nodeId)?.market;
    const marketPos = CLUSTER_POS[market];
    if (!marketPos) return;

    const beam = CF.UI.createEl('path', {
      class: 'dw-match-beam',
      d: `M ${marketPos.cx} ${marketPos.cy} C ${(marketPos.cx + pos.x)/2} ${marketPos.cy} ${(marketPos.cx + pos.x)/2} ${pos.y} ${pos.x} ${pos.y}`,
      fill: 'none',
      stroke: '#ffc107',
      'stroke-width': 2,
      'stroke-dasharray': '4,2',
      'stroke-opacity': 0.7
    });

    const edges = svg.querySelector('.dw-edges');
    if (edges) edges.parentNode.insertBefore(beam, edges.nextSibling);
    else svg.appendChild(beam);

    setTimeout(() => beam.remove(), 5000);
  }

  function refreshSankey() {
    container.querySelector('.dw-sankey-section')?.remove();
    renderSankey();
  }

  function onNodeSelect(payload) {
    if (payload && payload.module === 'darkweb') {
      const node = payload.node || payload;
      selectNode(node);
    }
  }

  function onIdentitySearch(query) {
    const input = container.querySelector('.dw-identity-input');
    if (input) {
      input.value = query;
      const event = new Event('input', { bubbles: true });
      input.dispatchEvent(event);
      const btn = container.querySelector('.dw-identity-btn');
      if (btn) btn.click();
    }
  }

  function defineMarkers() {
    if (!svg) return;
    const defs = CF.UI.createEl('defs', {}, [svg]);
    defs.innerHTML = `
      <marker id="dw-arrow-flow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
        <path d="M0,0 L9,3 L0,6 Z" fill="#17a2b8"/>
      </marker>
      <marker id="dw-arrow-mirror" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
        <path d="M0,0 L9,3 L0,6 Z" fill="#6c757d"/>
      </marker>
      <marker id="dw-arrow-default" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
        <path d="M0,0 L9,3 L0,6 Z" fill="var(--dw-accent)"/>
      </marker>
    `;
  }

  return {
    mount, unmount,
    highlight: (id) => selectNode({ id })
  };
})();