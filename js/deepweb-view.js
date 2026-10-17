window.CF = window.CF || {};
window.CF.Views = window.CF.Views || {};

CF.Views.deepweb = (function () {
  'use strict';

  let container;
  let svg;
  let canvas;
  let animationFrame = null;
  let layers = [];
  let nodes = [];
  let breaches = [];
  let discoveries = [];
  let viewMode = 'rings';
  let selectedNode = null;
  let discoveryStep = 0;

  function mount(el) {
    container = el;
    if (container.dataset.mounted === 'deepweb') return;
    container.dataset.mounted = 'deepweb';

    loadData();
    render();

    CF.DeepDive.bus.on('node:select', onNodeSelect);
  }

  function unmount() {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
  }

  function loadData() {
    layers = CF.Storage.getAll('deepwebLayers');
    nodes = CF.Storage.getAll('deepwebNodes');
    breaches = CF.Storage.getAll('deepwebBreaches');
    discoveries = CF.Storage.getAll('deepwebDiscoveries');
    viewMode = localStorage.getItem('cf.dd.viewMode.deepweb') || 'rings';
  }

  function render() {
    if (!container) return;
    container.innerHTML = '';
    renderHeader();
    renderViewModeToggle();
    renderLayerExplorer();
    renderDepthGauge();
    renderDiscoverabilityFlow();
    renderBreachExplorer();
    renderCorrelationEngine();
  }

  function renderHeader() {
    const header = CF.UI.createEl('div', { class: 'deepdive__header' });
    header.innerHTML = `
      <div class="deepdive__header-title">
        ${CF.Icons.get('database', { size: 'lg' })}
        <h2>Deep Web Investigations</h2>
      </div>
      ${CF.DeepDive.components.simBadge()}
    `;
    container.appendChild(header);
  }

  function renderViewModeToggle() {
    const toggle = CF.UI.createEl('div', { class: 'dw-viewmode-toggle' });
    toggle.innerHTML = `
      <span>View Mode:</span>
      <button type="button" class="dw-viewmode-btn ${viewMode === 'rings' ? 'active' : ''}" data-mode="rings">${CF.Icons.get('layers', { size: 'sm' })} Concentric Rings</button>
      <button type="button" class="dw-viewmode-btn ${viewMode === 'strata' ? 'active' : ''}" data-mode="strata">${CF.Icons.get('depth', { size: 'sm' })} Vertical Strata</button>
    `;
    qsa('.dw-viewmode-btn', toggle).forEach(btn => {
      btn.addEventListener('click', () => {
        viewMode = btn.getAttribute('data-mode');
        localStorage.setItem('cf.dd.viewMode.deepweb', viewMode);
        qsa('.dw-viewmode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        redrawLayerExplorer();
      });
    });
    container.appendChild(toggle);
  }

  function renderLayerExplorer() {
    const width = 800;
    const height = 560;

    const wrapper = CF.UI.createEl('div', { class: 'dw-layer-wrapper' });

    canvas = CF.UI.createEl('canvas', {
      class: 'dw-sonar-canvas',
      width, height,
      'aria-hidden': 'true'
    }, [wrapper]);
    wrapper.appendChild(canvas);
    animateSonar();

    svg = CF.UI.createEl('svg', {
      class: 'dw-layer-svg',
      width, height,
      'viewBox': `0 0 ${width} ${height}`,
      'role': 'img',
      'aria-label': 'Deep web layer explorer showing databases, records, portals, and devices',
      tabindex: '0'
    }, [wrapper]);
    container.appendChild(wrapper);

    redrawLayerExplorer();
  }

  function redrawLayerExplorer() {
    if (!svg) return;
    qsa('.dw-rings-layer, .dw-strata-layer, .dw-depth-label, .dw-layer-node').forEach(el => el.remove());

    const width = 800;
    const height = 560;
    const centerX = width / 2;
    const centerY = height / 2;

    if (viewMode === 'rings') {
      drawRings(centerX, centerY);
    } else {
      drawStrata(width, height);
    }
    drawNodes(width, height);
  }

  function drawRings(cx, cy) {
    layers.forEach((layer, i) => {
      const radius = 50 + i * 55;
      const ring = CF.UI.createEl('circle', {
        class: 'dw-rings-layer',
        cx, cy, r: radius,
        fill: 'none',
        stroke: layer.color,
        'stroke-width': 2,
        'stroke-opacity': 0.4,
        'stroke-dasharray': '4,4',
        'data-layer': layer.id
      });
      svg.appendChild(ring);

      const angle = (i * 0.4) * Math.PI / 180;
      const labelX = cx + Math.cos(angle) * (radius + 15);
      const labelY = cy + Math.sin(angle) * (radius + 15);
      CF.UI.createEl('text', {
        class: 'dw-depth-label',
        x: labelX, y: labelY,
        'text-anchor': 'middle',
        'font-size': '9',
        fill: layer.color,
        html: layer.name
      }, [svg]);
    });
  }

  function drawStrata(width, height) {
    const layerHeight = height / layers.length;
    layers.forEach((layer, i) => {
      const y = i * layerHeight;
      const rect = CF.UI.createEl('rect', {
        class: 'dw-strata-layer',
        x: 0, y, width, height: layerHeight,
        fill: layer.color,
        'fill-opacity': 0.08,
        'data-layer': layer.id,
        'data-depth': i
      });
      svg.appendChild(rect);

      CF.UI.createEl('text', {
        class: 'dw-depth-label',
        x: 10, y: y + layerHeight / 2 + 4,
        'font-size': '10',
        fill: layer.color,
        html: layer.name
      }, [svg]);
    });
  }

  function drawNodes(width, height) {
    const cx = width / 2;
    const cy = height / 2;

    nodes.forEach(node => {
      const layer = layers.find(l => l.id === (node.layer || 'dw-l-01'));
      if (!layer) return;

      const depth = layers.indexOf(layer);
      const recordCount = node.records || 0;
      let size;
      if (typeof recordCount === 'number' && recordCount > 0) {
        size = 12 + Math.log10(recordCount) * 5;
      } else {
        size = 24;
      }
      size = Math.max(16, Math.min(44, size));

      let x, y;
      if (viewMode === 'rings') {
        const radius = 50 + depth * 55;
        const angleSeed = node.id.charCodeAt(node.id.length - 1) * 0.5;
        const angle = angleSeed + depth * 0.3;
        const rad = angle * Math.PI / 180;
        x = cx + Math.cos(rad) * radius + (Math.random() - 0.5) * 30;
        y = cy + Math.sin(rad) * radius + (Math.random() - 0.5) * 30;
      } else {
        const layerHeight = height / layers.length;
        x = 100 + Math.random() * (width - 200);
        y = depth * layerHeight + layerHeight / 2 + (Math.random() - 0.5) * 60;
      }

      const nodeMap = {
        database: 'var(--dw-node-database)', document: 'var(--dw-node-document)',
        record: 'var(--dw-node-record)', portal: 'var(--dw-node-portal)',
        leak: 'var(--dw-node-leak)', device: 'var(--dw-node-device)',
        archive: 'var(--dw-node-archive)'
      };

      const accessColors = {
        open: '#28a745', gated: '#f0ad4e', paywalled: '#6f42c1',
        leaked: '#dc3545', simulated: '#17a2b8'
      };
      const fillColor = accessColors[node.access] || '#6c757d';
      const strokeColor = nodeMap[node.type] || '#6c757d';

      const g = CF.UI.createEl('g', {
        class: 'dw-layer-node',
        'data-node-id': node.id,
        tabindex: '0',
        role: 'button',
        'aria-label': `${node.label} (${node.type}, ${node.access})`,
        'data-layer-id': layer.id,
        'data-depth': depth,
        transform: `translate(${x}, ${y})`,
        onclick: () => selectNode(node)
      });

      const iconName = node.type === 'database' ? 'database' :
                       node.type === 'document' ? 'document' :
                       node.type === 'record' ? 'record' :
                       node.type === 'portal' ? 'lock' :
                       node.type === 'leak' ? 'leak' :
                       node.type === 'device' ? 'iot-camera' :
                       node.type === 'archive' ? 'archive' : 'info';

      const icon = CF.Icons.get(iconName, { size: 'sm' });
      const fo = CF.UI.createEl('foreignObject', { x: -size/2, y: -size/2, width: size, height: size }, [g]);
      fo.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%">${icon}</div>`;

      CF.UI.createEl('circle', {
        cx: 0, cy: 0, r: size / 2 + 2,
        fill: 'none',
        stroke: fillColor,
        'stroke-width': 2,
        'stroke-opacity': 0.8
      }, [g]);

      if (typeof recordCount === 'number' && recordCount > 0) {
        CF.UI.createEl('text', {
          class: 'dw-node-count',
          x: 0, y: size / 2 + 10,
          'text-anchor': 'middle',
          'font-size': Math.max(6, 10 - depth * 0.5),
          html: recordCount > 999999 ? (recordCount / 1000000).toFixed(1) + 'M' :
                recordCount > 999 ? (recordCount / 1000).toFixed(recordCount > 9999 ? 0 : 1) + 'K' :
                String(recordCount)
        }, [g]);
      }

      if (node.emailRef) {
        CF.UI.createEl('circle', {
          class: 'dw-node-highlight',
          cx: 0, cy: 0, r: size / 2 + 6,
          fill: 'none',
          stroke: '#ffc107',
          'stroke-width': 2,
          'stroke-dasharray': '4,2'
        }, [g]);
      }

      svg.appendChild(g);
    });
  }

  function animateSonar() {
    if (CF.UI.isReducedMotion() || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;

    function renderSonar() {
      ctx.fillStyle = 'rgba(10, 15, 30, 0.2)';
      ctx.fillRect(0, 0, w, h);

      const time = Date.now() * 0.002;

      for (let i = 0; i < 3; i++) {
        const radius = 20 + (time * 20 + i * 80) % 280;
        if (radius < 280) {
          ctx.strokeStyle = `rgba(255, 193, 7, ${Math.max(0, 0.3 - radius / 300)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(w / 2, h / 2, radius, 0, 2 * Math.PI);
          ctx.stroke();
        }
      }

      for (let i = 0; i < 15; i++) {
        const bx = Math.sin(time * 0.3 + i) * 40 + w / 2;
        const by = h - ((time * 30 + i * 15) % h);
        const bsize = 2 + (i % 3);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + Math.sin(time + i) * 0.05})`;
        ctx.beginPath();
        ctx.arc(bx, by, bsize, 0, Math.PI * 2);
        ctx.fill();
      }

      if (viewMode === 'strata') {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        const layerHeight = h / layers.length;
        layers.forEach((_, i) => {
          if (i > 0 && i < layers.length) {
            const y = i * layerHeight;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
          }
        });
        ctx.setLineDash([]);
      }

      animationFrame = requestAnimationFrame(renderSonar);
    }
    animationFrame = requestAnimationFrame(renderSonar);
  }

  function renderDepthGauge() {
    const section = CF.UI.createEl('section', { class: 'dw-depth-section' });
    section.innerHTML = '<h3>Depth Gauge</h3>';

    const gauge = CF.UI.createEl('div', { class: 'dw-depth-gauge' });
    const svgEl = CF.UI.createEl('svg', {
      class: 'dw-depth-svg',
      width: 220, height: 120,
      viewBox: '0 0 220 120'
    });

    const currentDepth = selectedNode ? layers.indexOf(layers.find(l => l.id === (selectedNode.layer || 'dw-l-01'))) + 1 : 0;

    layers.forEach((layer, i) => {
      const y = 30 + i * 12;
      const active = i === currentDepth - 1 || (i === 0 && currentDepth === 0);

      CF.UI.createEl('line', {
        class: 'dw-depth-line',
        x1: 20, y1: y, x2: 180, y2: y,
        stroke: layer.color,
        'stroke-width': active ? 3 : 1,
        'data-depth': i + 1
      }, [svgEl]);

      CF.UI.createEl('text', {
        class: 'dw-depth-label',
        x: 22, y: y + 4,
        'font-size': '10',
        fill: layer.color,
        html: layer.name
      }, [svgEl]);
    });

    gauge.appendChild(svgEl);
    CF.UI.createEl('div', {
      class: 'dw-depth-label-text',
      html: `Selected: ${selectedNode?.label || 'None'}`
    }, [gauge]);
    section.appendChild(gauge);
    container.appendChild(section);
  }

  function renderDiscoverabilityFlow() {
    const discovery = discoveries.length > 0 ? discoveries[0] : null;
    if (!discovery) return;

    const section = CF.UI.createEl('section', { class: 'dw-discovery-section' });
    section.innerHTML = `
      <h3>Discoverability Flow: ${discovery.name}</h3>
      <div class="dw-discovery-controls">
        <button type="button" class="btn btn--sm btn--secondary dw-discovery-prev" disabled>Previous Hop</button>
        <button type="button" class="btn btn--sm btn--primary dw-discovery-next">Next Hop</button>
        <button type="button" class="btn btn--sm btn--ghost dw-discovery-reset">Reset</button>
      </div>
      <div class="dw-discovery-path"></div>
      <div class="dw-discovery-explanation"></div>
    `;

    discoveryStep = 0;
    const prevBtn = section.querySelector('.dw-discovery-prev');
    const nextBtn = section.querySelector('.dw-discovery-next');
    const resetBtn = section.querySelector('.dw-discovery-reset');

    nextBtn.addEventListener('click', () => {
      if (discoveryStep < discovery.steps.length - 1) {
        discoveryStep++;
        updateDiscovery();
      }
    });
    resetBtn.addEventListener('click', () => {
      discoveryStep = 0;
      updateDiscovery();
    });

    function updateDiscovery() {
      prevBtn.disabled = discoveryStep === 0;
      nextBtn.disabled = discoveryStep >= discovery.steps.length - 1;
      renderDiscoveryPath();
      renderDiscoveryExplanation();
    }

    function renderDiscoveryPath() {
      const path = section.querySelector('.dw-discovery-path');
      path.innerHTML = '';
      discovery.steps.forEach((stepId, i) => {
        const isActive = i <= discoveryStep;
        const activeClass = isActive ? 'active' : '';
        let label = stepId;
        let iconName = 'hop';

        const node = nodes.find(n => n.id === stepId) ||
                     CF.Storage.getAll('deepwebBreaches').find(b => b.id === stepId) ||
                     CF.Storage.getAll('darkwebVendors').find(v => v.id === stepId);

        if (node) {
          label = node.label || node.name || stepId;
          iconName = node.type === 'database' ? 'database' :
                     node.type === 'record' ? 'record' :
                     node.type === 'leak' ? 'leak' :
                     node.type === 'vendor' ? 'vendor' :
                     node.type === 'breach' ? 'breach' : 'info';
        } else {
          const emailMatch = stepId.match(/email:(.+)/);
          const pgpMatch = stepId.match(/pgp:(.+)/);
          if (emailMatch) {
            label = emailMatch[1];
            iconName = 'email';
          } else if (pgpMatch) {
            label = pgpMatch[1].substring(0, 8) + '...';
            iconName = 'pgp';
          } else {
            const nodeFromId = nodes.find(n => n.id === stepId) ||
                               CF.Storage.getAll('telegramNodes').find(n => n.id === stepId);
            if (nodeFromId) {
              label = nodeFromId.label || nodeFromId.handle || nodeFromId.id;
              iconName = nodeFromId.type === 'email' ? 'email' : nodeFromId.type === 'wallet' ? 'wallet' : 'person';
            }
          }
        }

        const step = CF.UI.createEl('div', {
          class: `dw-discovery-step ${activeClass}`,
          'data-step': i
        });
        step.innerHTML = `
          <div class="dw-discovery-icon">${CF.Icons.get(iconName, { size: 'md' })}</div>
          <div class="dw-discovery-label">${label}</div>
        `;
        if (isActive) step.style.opacity = '1';

        path.appendChild(step);

        if (i < discovery.steps.length - 1) {
          const arrow = CF.UI.createEl('div', {
            class: `dw-discovery-arrow ${isActive ? 'active' : ''}`
          });
          arrow.innerHTML = CF.Icons.get('arrow-right', { size: 'md' });
          path.appendChild(arrow);
        }
      });
    }

    function renderDiscoveryExplanation() {
      const exp = section.querySelector('.dw-discovery-explanation');
      const explanations = [
        'Starting from a Telegram channel where leaks were first announced.',
        'Linked email address extracted from channel admin profile.',
        'Email appears in breach database — confirms identity correlation.',
        'Vendor alias found in dark web marketplace using same PGP key.',
        'Vendor wallet address identified from marketplace flow data.',
        'Mirror of seized market linked to the same wallet infrastructure.',
        'Mirror takedown confirmed by law enforcement timeline.'
      ];
      exp.innerHTML = `<p class="dw-discovery-text">${explanations[discoveryStep] || explanations[explanations.length - 1]}</p>`;
    }

    renderDiscoveryPath();
    renderDiscoveryExplanation();

    container.appendChild(section);
  }

  function renderBreachExplorer() {
    const section = CF.UI.createEl('section', { class: 'dw-breach-section' });
    section.innerHTML = `
      <h3>Breach & Leak Explorer</h3>
      <div class="dw-breach-controls">
        <input type="text" class="dw-breach-search" placeholder="Search breaches by name..." aria-label="Search breaches">
        <button type="button" class="btn btn--sm btn--ghost dw-breach-sort" title="Sort by year">Sort</button>
      </div>
      <div class="dw-breach-table-wrapper">
        <table class="dw-breach-table" role="table" aria-label="Breach and leak database">
          <thead>
            <tr>
              <th>Name</th><th>Year</th><th>Records</th><th>Fields</th><th>Relevance</th><th>Action</th>
            </tr>
          </thead>
          <tbody class="dw-breach-body"></tbody>
        </table>
      </div>
    `;

    const tbody = section.querySelector('.dw-breach-body');
    const renderBreaches = (data) => {
      tbody.innerHTML = data.map(b => `
        <tr class="dw-breach-row" data-bid="${b.id}">
          <td>${b.name}</td>
          <td>${b.year}</td>
          <td>${b.records.toLocaleString()}</td>
          <td class="dw-breach-fields">${b.exposed.join(', ')}</td>
          <td>
            <div class="dw-breach-relevance">
              <span>${Math.round(b.relevance * 100)}%</span>
            </div>
          </td>
          <td class="dw-breach-actions">
            <button type="button" class="btn btn--xs btn--ghost dw-breach-link" title="Link to entity">Link</button>
          </td>
        </tr>
      `).join('');

      qsa('.dw-breach-row', tbody).forEach(row => {
        row.addEventListener('click', () => {
          const bid = row.getAttribute('data-bid');
          const breach = breaches.find(b => b.id === bid);
          if (breach) selectNode({ ...breach, type: 'breach' });
        });
      });

      qsa('.dw-breach-link').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          CF.UI.toast('Link to entity selected — choose target entity', { type: 'info' });
        });
      });
    };

    renderBreaches(breaches);

    section.querySelector('.dw-breach-search').addEventListener('input', (e) => {
      const term = e.target.value.trim().toLowerCase();
      renderBreaches(breaches.filter(b =>
        b.name.toLowerCase().includes(term) ||
        b.exposed.some(f => f.toLowerCase().includes(term))
      ));
    });

    container.appendChild(section);
  }

  function renderCorrelationEngine() {
    const section = CF.UI.createEl('section', { class: 'dw-correlation-section' });
    section.innerHTML = `
      <h3>Correlation Engine</h3>
      <div class="dw-correlation-input">
        <input type="text" class="dw-correlation-query" placeholder="Enter username, email, or phone..." aria-label="Correlation search">
        <button type="button" class="btn btn--sm btn--primary dw-correlation-btn">${CF.Icons.get('search', { size: 'sm' })} Correlate</button>
      </div>
      <div class="dw-correlation-results"></div>
    `;

    const input = section.querySelector('.dw-correlation-query');
    const btn = section.querySelector('.dw-correlation-btn');
    const results = section.querySelector('.dw-correlation-results');

    const correlate = () => {
      const text = input.value.trim().toLowerCase();
      if (!text) {
        results.innerHTML = '<p class="dw-correlation-empty">Enter an identifier to find deep-web matches.</p>';
        return;
      }

      const matches = [];

      nodes.forEach(node => {
        let confidence = 0;
        if (node.emailRef && node.emailRef.toLowerCase().includes(text)) confidence = 0.95;
        if (node.label && node.label.toLowerCase().includes(text)) confidence = Math.max(confidence, 0.80);
        if (node.ip && node.ip.includes(text)) confidence = 0.85;

        if (confidence > 0) {
          matches.push({ type: 'node', data: node, confidence });
        }
      });

      breaches.forEach(breach => {
        if (breach.name.toLowerCase().includes(text)) {
          matches.push({ type: 'breach', data: breach, confidence: 0.90 });
        }
      });

      nodes.forEach(node => {
        if (node.emailRef && node.emailRef.toLowerCase() === text) {
          const exists = matches.find(m => m.data.id === node.id);
          if (exists) exists.confidence = 0.95;
        }
      });

      results.innerHTML = matches.length ? `
        <div class="dw-correlation-list">
          <h4>${matches.length} match(es) for "${text}"</h4>
          ${matches.map(m => `
            <div class="dw-correlation-match" data-type="${m.type}" data-id="${m.data.id}">
              <span class="dw-correlation-confidence">${Math.round(m.confidence * 100)}%</span>
              <span class="dw-correlation-label">${m.data.label || m.data.name}</span>
              <span class="dw-correlation-type">${m.type}</span>
              ${m.type === 'node' ? `<span class="dw-correlation-layer">${layers.find(l => l.id === m.data.layer)?.name || ''}</span>` : ''}
            </div>
          `).join('')}
        </div>
      ` : `<p class="dw-correlation-empty">No matches found for "${text}".</p>`;

      matches.forEach(m => {
        if (m.type === 'node') {
          drawCorrelationLink(m.data.id);
        }
      });

      CF.DeepDive.bus.emit('chain:add', matches);
    };

    btn.addEventListener('click', correlate);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); correlate(); }
    });

    container.appendChild(section);
  }

  function drawCorrelationLink(nodeId) {
    if (!svg) return;

    const node = svg.querySelector(`[data-node-id="${nodeId}"]`);
    if (node) {
      node.style.animation = 'none';
      setTimeout(() => {
        node.style.animation = 'match-beam 1.5s ease-in-out';
      }, 10);
    }
  }

  function selectNode(node) {
    selectedNode = node;
    CF.DeepDive.bus.emit('node:select', node);

    const depthSection = container.querySelector('.dw-depth-section');
    if (depthSection) depthSection.remove();
    renderDepthGauge();

    qsa('.dw-layer-node').forEach(n => n.classList.remove('selected'));
    const nodeEl = svg.querySelector(`[data-node-id="${node.id}"]`);
    if (nodeEl) nodeEl.classList.add('selected');

    const detailContent = CF.UI.createEl('div');
    detailContent.innerHTML = `
      <div class="dw-detail-header">
        <h3>${node.label || node.name}</h3>
        <span class="sim-badge sim-badge--small">SIMULATED</span>
      </div>
      <table class="dw-detail-table">
        <tr><td>Type</td><td><span class="dw-node-type">${node.type}</span></td></tr>
        <tr><td>Access</td><td class="dw-access-${node.access}">${node.access}</td></tr>
        ${node.records ? `<tr><td>Records</td><td>${node.records.toLocaleString()}</td></tr>` : ''}
        ${node.year ? `<tr><td>Year</td><td>${node.year}</td></tr>` : ''}
        ${node.ip ? `<tr><td>IP</td><td><code>${node.ip}</code></td></tr>` : ''}
        ${node.desc ? `<tr><td>Description</td><td>${node.desc}</td></tr>` : ''}
        ${node.relevance ? `<tr><td>Relevance</td><td>${Math.round(node.relevance * 100)}%</td></tr>` : ''}
      </table>
      ${CF.DeepDive.components.actionRow(node, {
        sendToGraph: (n) => CF.UI.toast(`Sent ${n.label || n.id} to main graph`, { type: 'success' }),
        addToChain: (n) => {
          CF.UI.toast(`Added ${n.label || n.id} to trace chain`, { type: 'success' });
          CF.DeepDive.bus.emit('chain:add', { node: n, module: 'deepweb' });
        }
      })}
    `;

    CF.UI.modal(node.label || node.id, detailContent, { size: 'md' });
  }

  function onNodeSelect(payload) {
    if (payload && payload.module === 'deepweb') {
      selectedNode = payload.node || payload;
      container.querySelector('.dw-depth-section')?.remove();
      renderDepthGauge();
    }
  }

  return {
    mount, unmount,
    highlight: (id) => {
      const node = nodes.find(n => n.id === id);
      if (node) selectNode(node);
    }
  };
})();