window.CF = window.CF || {};
window.CF.Views = window.CF.Views || {};

CF.Views.telegram = (function () {
  'use strict';

  let container;
  let svg;
  let nodes = [];
  let edges = [];
  let messages = [];
  let forwardChains = [];
  let simulation = null;
  let selectedNode = null;
  let filteredNodes = [];
  let filters = { type: 'all', riskBand: 'all', search: '' };

  const NODE_POS = {};

  function initLayout() {
    const pos = {
      'tg-ch-01': { x: 300, y: 200 }, 'tg-ch-02': { x: 500, y: 300 },
      'tg-ch-03': { x: 100, y: 300 }, 'tg-grp-01': { x: 300, y: 380 },
      'tg-grp-02': { x: 500, y: 460 }, 'tg-user-01': { x: 200, y: 150 },
      'tg-user-02': { x: 400, y: 120 }, 'tg-user-03': { x: 550, y: 220 },
      'tg-user-04': { x: 250, y: 420 }, 'tg-user-05': { x: 450, y: 420 },
      'tg-user-06': { x: 80, y: 320 }, 'tg-bot-01': { x: 480, y: 160 },
      'tg-bot-02': { x: 560, y: 120 }, 'tg-wallet-01': { x: 280, y: 60 },
      'tg-email-01': { x: 220, y: 80 }, 'tg-pgp-01': { x: 600, y: 260 }
    };
    Object.assign(NODE_POS, pos);
  }

  function mount(el) {
    container = el;
    if (container.dataset.mounted === 'telegram') return;
    container.dataset.mounted = 'telegram';

    initLayout();
    loadData();
    render();

    CF.DeepDive.bus.on('node:select', onNodeSelect);
    CF.DeepDive.bus.on('tab:changed', onTabChange);
  }

  function unmount() {
    if (simulation) {
      simulation.stop();
      simulation = null;
    }
    CF.DeepDive.bus.on('node:select', () => {});
    CF.DeepDive.bus.on('tab:changed', () => {});
  }

  function loadData() {
    if (typeof CF.Data !== 'undefined' && CF.Data.telegramSeed) {
      nodes = CF.Storage.getAll('telegramNodes').map(n => ({ ...n }));
      edges = CF.Storage.getAll('telegramEdges').map(e => ({ ...e }));
      messages = CF.Storage.getAll('telegramMessages').map(m => ({ ...m }));
      forwardChains = CF.Storage.getAll('telegramForwardChains').map(f => ({ ...f }));
    } else {
      nodes = [];
      edges = [];
      messages = [];
      forwardChains = [];
    }

    const lookup = {};
    nodes.forEach(n => lookup[n.id] = n);
    edges.forEach(e => {
      if (lookup[e.source]) e.sourceNode = lookup[e.source];
      if (lookup[e.target]) e.targetNode = lookup[e.target];
    });
  }

  function render() {
    if (!container) return;
    container.innerHTML = '';
    renderHeader();
    renderFilters();
    renderNetworkMap();
    renderStoryline();
    renderBotTimeline();
    renderCoMembershipMatrix();
  }

  function renderHeader() {
    const header = CF.UI.createEl('div', { class: 'deepdive__header' });
    header.innerHTML = `
      <div class="deepdive__header-title">
        ${CF.Icons.get('telegram', { size: 'lg' })}
        <h2>Telegram Investigations</h2>
      </div>
      ${CF.DeepDive.components.simBadge()}
    `;
    container.appendChild(header);
  }

  function renderFilters() {
    const filterBar = CF.UI.createEl('div', { class: 'filter-bar' });

    const typeFilter = CF.UI.createEl('select', {
      class: 'filter-select',
      'aria-label': 'Filter by type',
      onchange: (e) => { filters.type = e.target.value; applyFilters(); }
    });
    typeFilter.innerHTML = '<option value="all">All Types</option><option value="channel">Channels</option><option value="group">Groups</option><option value="user">Users</option><option value="bot">Bots</option><option value="wallet">Wallets</option>';

    const searchInput = CF.UI.createEl('input', {
      type: 'text',
      class: 'filter-search',
      placeholder: 'Search channels, users, handles...',
      'aria-label': 'Search nodes',
      oninput: (e) => { filters.search = e.target.value; applyFilters(); }
    });

    const riskFilter = CF.UI.createEl('select', {
      class: 'filter-select',
      'aria-label': 'Filter by risk band',
      onchange: (e) => { filters.riskBand = e.target.value; applyFilters(); }
    });
    riskFilter.innerHTML = '<option value="all">All Risk</option><option value="low">Low (0-30)</option><option value="medium">Medium (30-60)</option><option value="high">High (60-100)</option>';

    filterBar.appendChild(typeFilter);
    filterBar.appendChild(searchInput);
    filterBar.appendChild(riskFilter);

    const chips = CF.UI.createEl('div', { class: 'filter-chips' });
    filterBar.appendChild(chips);

    container.appendChild(filterBar);
  }

  function applyFilters() {
    filteredNodes = nodes.filter(n => {
      if (filters.type !== 'all' && n.type !== filters.type) return false;
      if (filters.search && !n.label.toLowerCase().includes(filters.search.toLowerCase()) &&
          !(n.handle && n.handle.toLowerCase().includes(filters.search.toLowerCase()))) return false;
      if (filters.riskBand !== 'all') {
        if (filters.riskBand === 'low' && n.risk >= 30) return false;
        if (filters.riskBand === 'medium' && n.risk < 30) return false;
        if (filters.riskBand === 'medium' && n.risk >= 60) return false;
        if (filters.riskBand === 'high' && n.risk < 60) return false;
      }
      return true;
    });

    renderNetworkMap();
  }

  function renderNetworkMap() {
    container.querySelector('.tg-network-map')?.remove();

    const wrapper = CF.UI.createEl('div', { class: 'tg-network-map-wrapper' });
    const map = CF.UI.createEl('div', { class: 'tg-network-map' });
    wrapper.appendChild(map);

    const width = 800;
    const height = 500;

    svg = CF.UI.createEl('svg', {
      class: 'tg-map-svg',
      width, height,
      'viewBox': `0 0 ${width} ${height}`,
      'role': 'img',
      'aria-label': 'Telegram network map showing channels, groups, users, and bots',
      tabindex: '0',
      onfocus: () => {},
      onblur: () => {}
    }, [wrapper]);

    const defs = CF.UI.createEl('defs', {}, [svg]);
    const pattern = CF.UI.createEl('pattern', {
      id: 'tg-chat-pattern',
      patternUnits: 'userSpaceOnUse',
      width: '40', height: '40'
    }, [defs]);
    pattern.innerHTML = `
      <path d="M0,10 Q10,5 20,10 T40,10" stroke="var(--tg-accent-alpha)" stroke-width="0.5" fill="none"/>
      <path d="M0,20 Q10,15 20,20 T40,20" stroke="var(--tg-accent-alpha)" stroke-width="0.5" fill="none"/>
      <path d="M0,30 Q10,25 20,30 T40,30" stroke="var(--tg-accent-alpha)" stroke-width="0.5" fill="none"/>
      <path d="M0,40 Q10,35 20,40 T40,40" stroke="var(--tg-accent-alpha)" stroke-width="0.5" fill="none"/>
    `;

    CF.UI.createEl('rect', {
      class: 'tg-map-bg',
      x: 0, y: 0, width, height,
      fill: 'url(#tg-chat-pattern)'
    }, [svg]);

    const edgeGroup = CF.UI.createEl('g', { class: 'tg-edges' }, [svg]);

    const edgeTypes = {
      admin:   { color: 'var(--tg-admin-edge)', dash: 'none' },
      member:  { color: 'var(--tg-member-edge)', dash: '4,3' },
      forward: { color: 'var(--tg-forward-edge)', dash: '2,2' },
      wallet:  { color: 'var(--tg-wallet-edge)', dash: '6,2' },
      email:   { color: 'var(--tg-email-edge)', dash: '8,4' },
      pgp:     { color: 'var(--tg-pgp-edge)', dash: 'none' }
    };

    const arrowDefs = CF.UI.createEl('defs', {}, [svg]);
    Object.entries(edgeTypes).forEach(([type, style]) => {
      arrowDefs.innerHTML += `<marker id="tg-arrow-${type}" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L9,3 L0,6 Z" class="tg-arrow" fill="${style.color}"/></marker>`;
    });

    edges.forEach(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      if (!sourceNode || !targetNode) return;
      if (filteredNodes.length && !filteredNodes.includes(sourceNode) && !filteredNodes.includes(targetNode)) return;

      const sx = NODE_POS[sourceNode.id]?.x || width / 2;
      const sy = NODE_POS[sourceNode.id]?.y || height / 2;
      const tx = NODE_POS[targetNode.id]?.x || width / 2;
      const ty = NODE_POS[targetNode.id]?.y || height / 2;

      const style = edgeTypes[edge.type] || edgeTypes.forward;
      const line = CF.UI.createEl('line', {
        class: `tg-edge tg-edge--${edge.type}`,
        'data-edge-id': edge.id,
        x1: sx, y1: sy, x2: tx, y2: ty,
        'data-weight': edge.weight || 1,
        stroke: style.color,
        'stroke-width': 1 + (edge.weight || 1) * 2,
        'stroke-dasharray': style.dash,
        'marker-end': `url(#tg-arrow-${edge.type})`
      }, [edgeGroup]);

      line.addEventListener('click', (e) => e.stopPropagation());
      line.addEventListener('mouseenter', () => {
        line.style.opacity = '0.8';
        line.style.filter = 'brightness(1.5)';
      });
      line.addEventListener('mouseleave', () => {
        line.style.opacity = '';
        line.style.filter = '';
      });
    });

    const nodeGroup = CF.UI.createEl('g', { class: 'tg-nodes' }, [svg]);

    const displayNodes = filteredNodes.length > 0 ? filteredNodes : nodes;

    displayNodes.forEach(node => {
      const pos = NODE_POS[node.id] || { x: width / 2, y: height / 2 };
      const iconSvg = CF.DeepDive.components.typeIcon(node.type);
      const risk = CF.DeepDive.riskBand(node.risk || 0);
      const size = node.type === 'channel' ? 56 : node.type === 'group' ? 52 : node.type === 'bot' ? 44 : 40;

      const g = CF.UI.createEl('g', {
        class: `tg-node tg-node--${node.type}`,
        'data-node-id': node.id,
        'data-risk': node.risk || 0,
        tabindex: '0',
        role: 'button',
        'aria-label': `${node.label || node.handle || node.id} (${node.type}, risk: ${node.risk || 0})`,
        transform: `translate(${pos.x}, ${pos.y})`
      }, [nodeGroup]);

      const circle = CF.UI.createEl('circle', {
        class: `tg-node-bg risk-${risk.class}`,
        cx: 0, cy: 0, r: size / 2,
        fill: node.type === 'channel' ? 'var(--tg-channel-bg)' :
              node.type === 'group' ? 'var(--tg-group-bg)' :
              node.type === 'bot' ? 'var(--tg-bot-bg)' :
              'var(--tg-user-bg)'
      }, [g]);

      if (node.type === 'channel' || node.type === 'group') {
        circle.setAttribute('rx', '12');
        circle.setAttribute('ry', '12');
      }

      if (node.risk > 0) {
        const radius = size / 2 + 2;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference * (1 - node.risk / 100);
        CF.UI.createEl('circle', {
          class: 'tg-node-ring',
          cx: 0, cy: 0, r: radius,
          fill: 'none',
          'stroke-width': 2,
          stroke: node.risk > 80 ? 'var(--color-danger)' : node.risk > 50 ? 'var(--color-warning)' : 'var(--color-safe)',
          'stroke-dasharray': circumference,
          'stroke-dashoffset': offset,
          style: CF.DeepDive.components && !CF.UI.isReducedMotion() ? 'transition: stroke-dashoffset 0.8s ease' : ''
        }, [g]);
      }

      const fo = CF.UI.createEl('foreignObject', {
        x: -12, y: -12, width: 24, height: 24
      }, [g]);
      fo.innerHTML = iconSvg;

      CF.UI.createEl('text', {
        class: 'tg-node-label',
        x: pos.x, y: pos.y + size / 2 + 18,
        'text-anchor': 'middle',
        'font-size': '11',
        html: node.label || node.handle || node.id
      }, [svg]);

      g.addEventListener('click', (e) => {
        e.stopPropagation();
        selectNode(node, g);
      });
      g.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectNode(node, g);
        }
      });
      g.addEventListener('mouseenter', () => highlightNeighbors(node));
      g.addEventListener('mouseleave', () => clearHighlight());
    });

    wrapper.appendChild(svg);
    container.appendChild(wrapper);

    const legend = CF.UI.createEl('div', { class: 'tg-map-legend' });
    legend.innerHTML = `
      <div class="tg-legend-item"><span class="tg-legend-color" style="background:var(--tg-forward-edge)"></span> Forward</div>
      <div class="tg-legend-item"><span class="tg-legend-color" style="background:var(--tg-admin-edge)"></span> Admin</div>
      <div class="tg-legend-item"><span class="tg-legend-color" style="background:var(--tg-member-edge)"></span> Member</div>
      <div class="tg-legend-item"><span class="tg-legend-color" style="background:var(--tg-wallet-edge)"></span> Wallet</div>
      <div class="tg-legend-item"><span class="tg-risk-dot risk-critical"></span> Risk 80+</div>
      <div class="tg-legend-item"><span class="tg-risk-dot risk-high"></span> Risk 60-79</div>
      <div class="tg-legend-item"><span class="tg-risk-dot risk-medium"></span> Risk 30-59</div>
      <div class="tg-legend-item"><span class="tg-risk-dot risk-low"></span> Risk 0-29</div>
    `;
    wrapper.appendChild(legend);
  }

  function selectNode(node, element) {
    selectedNode = node;
    qsa('.tg-node.selected').forEach(n => n.classList.remove('selected'));
    element.classList.add('selected');
    CF.DeepDive.bus.emit('node:select', node);
    openDetailDrawer(node);
  }

  function openDetailDrawer(node) {
    const memberCount = node.subscribers || node.members || 0;

    const body = CF.UI.createEl('div', { class: 'tg-detail-body' });

    body.innerHTML = `
      <div class="tg-detail-header">
        <div class="tg-detail-title">
          ${CF.DeepDive.components.typeIcon(node.type)}
          <h3>${node.label || node.handle}</h3>
        </div>
        <span class="sim-badge sim-badge--small">${CF.Icons.get('sim', { size: 'sm' })} SIMULATED</span>
      </div>

      <div class="tg-detail-section">
        <h4>Details</h4>
        <table class="tg-detail-table">
          <tr><td>Handle</td><td><code>${node.handle || '—'}</code></td></tr>
          <tr><td>Type</td><td><span class="tg-node-type tg-node-type--${node.type}">${node.type}</span></tr>
          ${node.subscribers ? `<tr><td>Subscribers</td><td><span id="tg-counter-${node.id}">0</span></td></tr>` : ''}
          ${node.members ? `<tr><td>Members</td><td><span id="tg-counter-${node.id}">0</span></td></tr>` : ''}
          <tr><td>Created</td><td>${node.created || '—'}</td></tr>
          ${node.role ? `<tr><td>Role</td><td>${node.role}</td></tr>` : ''}
          ${node.desc ? `<tr><td>Description</td><td>${node.desc}</td></tr>` : ''}
        </table>
      </div>

      <div class="tg-detail-section">
        <h4>Risk Assessment</h4>
        <div id="tg-risk-gauge-${node.id}" class="tg-risk-gauge"></div>
      </div>

      ${node.type === 'wallet' || node.wallets ? `<div class="tg-detail-section"><h4>Linked Wallets</h4><ul>${(node.links || []).filter(l => l.type === 'wallet').map(l => { const w = nodes.find(n => n.id === l.target); return w ? `<li><code>${w.label || w.address}</code> — ${w.balance || '?'}</li>` : ''; }).join('')}</ul></div>` : ''}

      ${node.links && node.links.length ? `<div class="tg-detail-section"><h4>Connected Entities</h4><ul>${node.links.map(l => { const t = nodes.find(n => n.id === l.target); return t ? `<li><span class="tg-node-type tg-node-type--${t.type}">${CF.DeepDive.components.typeIcon(t.type).trim()}</span> ${t.label || t.handle || t.id} <em>(${l.type})</em></li>` : ''; }).join('')}</ul></div>` : ''}

      ${node.aliases ? `<div class="tg-detail-section"><h4>Aliases</h4><p>${node.aliases.join(', ')}</p></div>` : ''}
    `;

    container.appendChild(body);

    const counterEl = body.querySelector(`#tg-counter-${node.id}`);
    if (counterEl && memberCount > 0) {
      CF.DeepDive.components.animatedCounter(counterEl, memberCount, { prefix: '', suffix: '', duration: 1200 });
    }

    const gaugeEl = body.querySelector(`#tg-risk-gauge-${node.id}`);
    if (gaugeEl) {
      CF.DeepDive.components.radialGauge(gaugeEl, node.risk || 0, {
        label: 'Risk', size: 100, showValue: true
      });
    }

    const actions = CF.DeepDive.components.actionRow(node, {
      sendToGraph: (n) => CF.UI.toast(`Sent ${n.label || n.id} to main graph`, { type: 'success' }),
      addToChain: (n) => {
        const chainDraft = JSON.parse(localStorage.getItem('cf.dd.chainDraft') || '[]');
        const exists = chainDraft.find(h => h.entityRef === n.id);
        if (exists) {
          CF.UI.toast('Already in trace chain', { type: 'info' });
          return;
        }
        chainDraft.push({
          id: 'hop-' + Date.now(),
          entityRef: n.id,
          module: 'telegram',
          label: n.label || n.handle || n.id,
          confidence: 0.9,
          ts: new Date().toISOString(),
          note: ''
        });
        localStorage.setItem('cf.dd.chainDraft', JSON.stringify(chainDraft));
        CF.DeepDive.bus.emit('chain:add', chainDraft);
        CF.UI.toast('Added to trace chain', { type: 'success' });
      }
    });
    body.appendChild(actions);
  }

  function highlightNeighbors(node) {
    const neighborIds = new Set();
    edges.forEach(e => {
      if (e.source === node.id) neighborIds.add(e.target);
      if (e.target === node.id) neighborIds.add(e.source);
    });

    qsa('.tg-node').forEach(el => {
      const id = el.getAttribute('data-node-id');
      if (id === node.id) {
        el.style.filter = 'brightness(1.5) saturate(1.3)';
      } else if (neighborIds.has(id)) {
        el.style.filter = 'brightness(1.3)';
      } else {
        el.style.opacity = '0.3';
      }
    });
    qsa('.tg-edge').forEach(el => {
      const edgeId = el.getAttribute('data-edge-id');
      if (edgeId && (edges.find(e => e.id === edgeId && (e.source === node.id || e.target === node.id)))) {
        el.style.filter = 'brightness(1.5)';
      } else {
        el.style.opacity = '0.2';
      }
    });
  }

  function clearHighlight() {
    qsa('.tg-node').forEach(el => {
      el.style.filter = '';
      el.style.opacity = '';
    });
    qsa('.tg-edge').forEach(el => {
      el.style.filter = '';
      el.style.opacity = '';
    });
  }

  function renderStoryline() {
    const section = CF.UI.createEl('section', { class: 'tg-storyline-section' });
    section.innerHTML = '<h3>Storyline Track</h3>';

    const track = CF.UI.createEl('div', { class: 'tg-storyline-track' });

    forwardChains.forEach(chain => {
      const card = CF.UI.createEl('div', { class: 'tg-storyline-card' });
      card.innerHTML = `
        <div class="tg-storyline-header">
          <span class="tg-storyline-name">${chain.name}</span>
          <span class="sim-badge sim-badge--tiny">SIMULATED</span>
        </div>
        <div class="tg-storyline-steps">
          ${chain.steps.map((stepId, i) => {
            const n = nodes.find(n => n.id === stepId);
            if (!n) return '';
            const icon = CF.DeepDive.components.typeIcon(n.type);
            return `
              <div class="tg-storyline-step" data-step="${stepId}">
                <div class="tg-storyline-step-icon">${icon}</div>
                <div class="tg-storyline-step-label">${n.label || n.handle || n.id}</div>
                <div class="tg-storyline-step-meta">${n.type} • risk: ${n.risk || 0}</div>
                ${i < chain.steps.length - 1 ? '<div class="tg-storyline-arrow">' + CF.Icons.get('arrow-right', { size: 'sm' }) + '</div>' : ''}
              </div>
            `;
          }).join('')}
        </div>
        ${messages.filter(m => chain.steps.some(s => m.channel === s || m.author === s)).slice(0, 3).map(m => `
          <div class="tg-storyline-message">
            <div class="tg-storyline-msg-author">${messages.find(n => n.id === m.author)?.label || m.author}</div>
            <div class="tg-storyline-msg-text">${m.excerpt}</div>
            <div class="tg-storyline-msg-time">${m.time}</div>
          </div>
        `).join('')}
      `;

      track.appendChild(card);

      qsa('.tg-storyline-step', card).forEach(step => {
        step.addEventListener('click', () => {
          const stepId = step.getAttribute('data-step');
          const n = nodes.find(node => node.id === stepId);
          if (n) {
            highlightSingleNode(stepId);
            CF.UI.toast(`Highlighting: ${n.label || n.id}`, { type: 'info' });
          }
        });
        step.setAttribute('tabindex', '0');
        step.setAttribute('role', 'button');
        step.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            step.click();
          }
        });
      });
    });

    section.appendChild(track);
    container.appendChild(section);
  }

  function highlightSingleNode(nodeId) {
    qsa('.tg-node').forEach(el => {
      el.style.filter = '';
      el.style.opacity = '';
      if (el.getAttribute('data-node-id') === nodeId) {
        el.style.filter = 'brightness(1.8) saturate(1.5)';
      } else {
        el.style.opacity = '0.4';
      }
    });
    setTimeout(() => {
      qsa('.tg-node').forEach(el => {
        el.style.filter = '';
        el.style.opacity = '';
      });
    }, 2000);
  }

  function renderBotTimeline() {
    const botNodes = nodes.filter(n => n.type === 'bot');
    if (!botNodes.length) return;

    const section = CF.UI.createEl('section', { class: 'tg-bot-section' });
    section.innerHTML = '<h3>Bot Activity</h3>';

    const timeline = CF.UI.createEl('div', { class: 'tg-bot-timeline' });

    botNodes.forEach(bot => {
      const events = messages.filter(m => {
        if (bot.id === 'tg-bot-01' && m.text.toLowerCase().includes('checksum')) return true;
        if (bot.id === 'tg-bot-02' && m.text.toLowerCase().includes('balance')) return true;
        return false;
      });

      if (!events.length) {
        events.push({
          id: 'bot-event-' + bot.id + '-1',
          time: '2023-06-15 22:14',
          text: `[VERIFICATION] Checksum check on Contoso dump`,
          type: 'verification'
        }, {
          id: 'bot-event-' + bot.id + '-2',
          time: '2023-06-01 00:00',
          text: `[ALERT] Wallet balance update received`,
          type: 'balance'
        });
      }

      const item = CF.UI.createEl('div', { class: 'tg-bot-item' });
      item.innerHTML = `
        <div class="tg-bot-icon">${CF.DeepDive.components.typeIcon(bot.type)}</div>
        <div class="tg-bot-name">${bot.label}</div>
        <div class="tg-bot-events">
          ${events.map(e => `
            <div class="tg-bot-event">
              <span class="tg-bot-event-time">${e.time}</span>
              <span class="tg-bot-event-type">${e.type}</span>
              <span class="tg-bot-event-text">${e.text || e.excerpt}</span>
            </div>
          `).join('')}
        </div>
      `;
      timeline.appendChild(item);
    });

    section.appendChild(timeline);
    container.appendChild(section);
  }

  function renderCoMembershipMatrix() {
    const channels = nodes.filter(n => n.type === 'channel' || n.type === 'group');
    const users = nodes.filter(n => n.type === 'person' || n.type === 'bot');

    const matrixData = {};
    channels.forEach(ch => {
      matrixData[ch.id] = {};
      const chMembers = (ch.links || []).filter(l => l.type === 'member' || l.type === 'admin').map(l => l.target);
      users.forEach(user => {
        const sharedMember = edges.some(e => {
          const src = e.source === ch.id;
          const tgt = e.target === user.id || e.source === user.id;
          return (src && tgt) || (e.source === user.id && e.target === ch.id);
        });
        matrixData[ch.id][user.id] = sharedMember ? 1 : 0;
      });
    });

    const section = CF.UI.createEl('section', { class: 'tg-matrix-section' });
    section.innerHTML = '<h3>Co-Membership Matrix</h3>';

    const matrix = CF.UI.createEl('div', { class: 'tg-matrix' });

    const header = CF.UI.createEl('div', { class: 'tg-matrix-row tg-matrix-row--header' });
    header.innerHTML = '<div class="tg-matrix-cell tg-matrix-corner"></div>';
    users.forEach(user => {
      header.innerHTML += `<div class="tg-matrix-cell tg-matrix-user" data-user="${user.id}" tabindex="0">${user.label || user.handle || '?'}</div>`;
    });
    matrix.appendChild(header);

    channels.forEach(ch => {
      const row = CF.UI.createEl('div', { class: 'tg-matrix-row' });
      row.innerHTML = `<div class="tg-matrix-cell tg-matrix-channel" data-channel="${ch.id}">${ch.label || ch.handle || '?'}</div>`;
      users.forEach(user => {
        const count = matrixData[ch.id] && matrixData[ch.id][user.id] ? 1 : 0;
        const intensity = count * 0.7;
        row.innerHTML += `<div class="tg-matrix-cell tg-matrix-cell--data" style="background:rgba(0,123,255,${intensity});" data-channel="${ch.id}" data-user="${user.id}" title="${ch.label} ↔ ${user.label || user.handle}: ${count} connection">${count}</div>`;
      });
      matrix.appendChild(row);
    });

    section.appendChild(matrix);
    container.appendChild(section);
  }

  function onNodeSelect(payload) {
    if (payload && payload.module === 'telegram') {
      selectedNode = payload.node || payload;
      qsa('.tg-node').forEach(el => {
        el.classList.toggle('selected', el.getAttribute('data-node-id') === selectedNode.id);
      });
    }
  }

  function onTabChange(tabId) {
    if (tabId !== 'telegram' && selectedNode) {
      qsa('.tg-node.selected').forEach(n => n.classList.remove('selected'));
      selectedNode = null;
    }
  }

  return {
    mount, unmount,
    highlight: (id) => highlightSingleNode(id)
  };
})();