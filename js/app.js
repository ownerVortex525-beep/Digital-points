window.CF = window.CF || {};

CF.App = (function () {
  'use strict';

  let initialized = false;
  let network = null;
  let nodes = null;
  let edges = null;
  let selectedNodeId = null;
  let selectedEdgeId = null;
  let isConnecting = false;
  let connectionSourceNodeId = null;
  let currentView = 'telegram';
  let dragCounter = 0;

  const ICON_SIZE = 64;

  const ENTITY_TYPES = {
    person: { label: 'Person', color: '#4f46e5', icon: 'person' },
    phone: { label: 'Phone', color: '#16a34a', icon: 'phone' },
    email: { label: 'Email', color: '#ca8a04', icon: 'email' },
    website: { label: 'Website', color: '#0891b2', icon: 'website' },
    location: { label: 'Location', color: '#c026d3', icon: 'location' },
    company: { label: 'Company', color: '#6d28d9', icon: 'company' },
    image: { label: 'Image', color: '#be123c', icon: 'image' },
    wallet: { label: 'Wallet', color: '#dc2626', icon: 'wallet' },
    telegram: { label: 'Telegram', color: '#0088cc', icon: 'telegram' },
    channel: { label: 'Channel', color: '#006699', icon: 'channel' },
    bot: { label: 'Bot', color: '#009966', icon: 'bot' },
    ip: { label: 'IP Address', color: '#f97316', icon: 'ip' },
    domain: { label: 'Domain', color: '#0ea5e9', icon: 'domain' },
    pgp: { label: 'PGP Key', color: '#a855f7', icon: 'pgp' },
    document: { label: 'Document', color: '#fbbf24', icon: 'document' },
    portal: { label: 'Portal', color: '#ef4444', icon: 'portal' },
    marketplace: { label: 'Marketplace', color: '#fb923c', icon: 'marketplace' }
  };

  const GLOBAL_ACTIONS = {
    save_png: { label: 'Save PNG', icon: 'download', action: () => exportPNG() },
    save_json: { label: 'Save JSON', icon: 'export-json', action: () => exportJSON() },
    load_json: { label: 'Load JSON', icon: 'import', action: () => document.getElementById('load-input').click() },
    center_view: { label: 'Center View', icon: 'center', action: () => network.fit({ animation: true }) },
    clear_canvas: { label: 'Clear All', icon: 'delete', action: () => clearCanvas(), danger: true },
    show_help: { label: 'Help', icon: 'help', action: () => showHelp() }
  };

  function init() {
    if (initialized) return;
    initialized = true;

    CF.Storage.seedAll();

    const canvasContainer = document.getElementById('network-canvas');
    if (canvasContainer && typeof vis !== 'undefined') {
      initNetwork(canvasContainer);
    }

    renderEntityPalette();
    renderGlobalActions();
    bindEvents();
    restoreGraph();

    setTimeout(() => {
      CF.UI.toast('CYBER-FORCE OSINT Deep-Dive initialized', { type: 'success' });
      showHelp();
    }, 500);
  }

  function initNetwork(container) {
    nodes = new vis.DataSet([]);
    edges = new vis.DataSet([]);

    const data = { nodes, edges };

    const options = {
      interaction: {
        hover: true,
        navigationButtons: false,
        keyboard: false,
        tooltipDelay: 100,
        multiselect: true
      },
      nodes: {
        shape: 'image',
        font: { color: 'var(--text-primary)', size: 16, strokeWidth: 0, vadjust: 10 },
        borderWidth: 0,
        widthConstraint: { maximum: 200 }
      },
      edges: {
        color: { color: '#6b7280', highlight: 'var(--accent-color)', hover: 'var(--accent-hover-color)' },
        width: 2,
        arrows: { to: { enabled: true, scaleFactor: 0.7 } },
        smooth: { enabled: true, type: 'cubicBezier', forceDirection: 'vertical', roundness: 0.4 }
      },
      physics: { enabled: false },
      manipulation: { enabled: false }
    };

    network = new vis.Network(container, data, options);

    network.on('click', handleNetworkClick);
    network.on('doubleClick', handleNetworkDoubleClick);
    network.on('dragStart', () => hideSizeSlider());
    network.on('dragEnd', handleDragEnd);
    network.on('zoom', () => hideSizeSlider());
    network.on('viewChanged', () => {
      if (nodes && edges) saveState();
    });
  }

  function renderEntityPalette() {
    const palette = document.getElementById('entity-palette');
    if (!palette) return;

    palette.innerHTML = '';
    Object.entries(ENTITY_TYPES).forEach(([type, entity]) => {
      const btn = document.createElement('button');
      btn.className = 'tooltip p-2 rounded-lg hover:bg-brand-surface transition-colors';
      btn.innerHTML = `<span class="tooltiptext">${entity.label}</span>` + CF.Icons.get(entity.icon, { size: 'sm' });
      btn.onclick = () => addNode(type);
      palette.appendChild(btn);
    });
  }

  function renderGlobalActions() {
    const actions = document.getElementById('global-actions');
    if (!actions) return;

    actions.innerHTML = '';
    Object.entries(GLOBAL_ACTIONS).forEach(([key, action]) => {
      const btn = document.createElement('button');
      btn.className = `tooltip p-2 rounded-lg hover:bg-brand-surface transition-colors ${action.danger ? 'hover:bg-red-500' : ''}`;
      btn.innerHTML = `<span class="tooltiptext">${action.label}</span>` + CF.Icons.get(action.icon, { size: 'sm' });
      btn.onclick = (e) => {
        e.stopPropagation();
        action.action();
      };
      actions.appendChild(btn);
    });
  }

  function createEntityIcon(type) {
    const entity = ENTITY_TYPES[type];
    if (!entity) return null;
    const svg = CF.Icons.getSVG(entity.icon, { size: ICON_SIZE, color: entity.color });
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  function addNode(type, canvasPos) {
    if (!network || !nodes) return;
    if (type === 'image') {
      document.getElementById('add-photo-input').click();
      return;
    }

    const entity = ENTITY_TYPES[type];
    if (!entity) return;

    const position = canvasPos || network.getViewPosition();
    const newNode = {
      entityType: type,
      x: position.x,
      y: position.y,
      label: entity.label,
      image: createEntityIcon(type),
      size: ICON_SIZE / 2,
      color: { background: entity.color }
    };

    nodes.add(newNode);
  }

  function addImageNodeFromFile(file, canvasPos) {
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const position = canvasPos || network.getViewPosition();
      nodes.add({
        label: file.name,
        entityType: 'image',
        shape: 'image',
        image: e.target.result,
        size: 50,
        x: position.x,
        y: position.y
      });
    };
    reader.readAsDataURL(file);
  }

  function handleNetworkClick(params) {
    const contextMenu = document.getElementById('context-menu');
    if (contextMenu) contextMenu.classList.add('hidden');

    const clickedNodeId = params.nodes[0];
    const clickedEdgeId = params.edges[0];

    if (isConnecting) {
      if (clickedNodeId && clickedNodeId !== connectionSourceNodeId) {
        edges.add({ from: connectionSourceNodeId, to: clickedNodeId });
      }
      resetConnectionState();
      if (connectionSourceNodeId) network.selectNodes([connectionSourceNodeId]);
      return;
    }

    selectedNodeId = clickedNodeId;
    selectedEdgeId = clickedEdgeId;

    if (clickedNodeId) {
      populateEditPanel();
      showEditPanel(true);
      showSizeSlider(clickedNodeId);
    } else if (clickedEdgeId) {
      populateEditPanel();
      showEditPanel(true);
      hideSizeSlider();
    } else {
      showEditPanel(false);
      hideSizeSlider();
    }
  }

  function handleNetworkDoubleClick(params) {
    const nodeId = params.nodes[0];
    if (nodeId) {
      const node = nodes.get(nodeId);
      CF.UI.modal('Edit Label', '', {
        input: true,
        inputValue: node.label,
        onOk: (newLabel) => {
          if (newLabel.trim()) {
            nodes.update({ id: nodeId, label: newLabel });
          }
        }
      });
    }
  }

  function handleDragEnd(params) {
    if (params.nodes.length > 0 && selectedNodeId === params.nodes[0]) {
      showSizeSlider(selectedNodeId);
    }
  }

  function startConnection() {
    isConnecting = true;
    connectionSourceNodeId = selectedNodeId;
    const btn = document.getElementById('edit-connect');
    if (btn) {
      btn.disabled = true;
      btn.querySelector('span').textContent = 'Select target...';
    }
    showToast('Select target node to create a connection');
  }

  function resetConnectionState() {
    isConnecting = false;
    connectionSourceNodeId = null;
    const btn = document.getElementById('edit-connect');
    if (btn) {
      btn.disabled = false;
      btn.querySelector('span').textContent = 'Connect';
    }
  }

  function populateEditPanel() {
    const editPanel = document.getElementById('edit-panel');
    if (!editPanel) return;

    if (selectedNodeId) {
      const node = nodes.get(selectedNodeId);
      const entity = ENTITY_TYPES[node.entityType];
      editPanel.innerHTML = `
        <h3 class="font-bold text-lg text-white">Edit Node</h3>
        <p class="text-sm text-gray-400 -mt-2 mb-2">Type: ${entity ? entity.label : 'Unknown'}</p>
        <div class="flex flex-col gap-4 text-sm">
          <div>
            <label for="edit-label" class="block text-xs text-gray-400 mb-1">Label</label>
            <input type="text" id="edit-label" value="${node.label || ''}" class="w-full bg-brand-surface border border-brand-border rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-accent">
          </div>
          <button id="edit-connect" class="flex items-center justify-center gap-2 w-full px-3 py-2 bg-brand-surface hover:bg-brand-accent rounded-md transition-colors">
            <span>Connect</span>
          </button>
          <div class="border-t border-brand-border my-1"></div>
          <button id="edit-delete-node" class="flex items-center justify-center gap-2 w-full px-3 py-2 text-red-400 hover:bg-red-500 hover:text-white rounded-md transition-colors">
            <span>Delete Node</span>
          </button>
        </div>
      `;

      const labelInput = document.getElementById('edit-label');
      if (labelInput) {
        labelInput.oninput = (e) => nodes.update({ id: selectedNodeId, label: e.target.value });
      }

      const connectBtn = document.getElementById('edit-connect');
      if (connectBtn) connectBtn.onclick = startConnection;

      const deleteBtn = document.getElementById('edit-delete-node');
      if (deleteBtn) {
        deleteBtn.onclick = () => {
          nodes.remove(selectedNodeId);
          edges.remove(edges.get().filter(e => e.from === selectedNodeId || e.to === selectedNodeId).map(e => e.id));
          showEditPanel(false);
          CF.UI.toast('Node deleted', { type: 'info' });
        };
      }
    } else if (selectedEdgeId) {
      editPanel.innerHTML = `
        <h3 class="font-bold text-lg text-white">Edit Connection</h3>
        <p class="text-sm text-gray-400 -mt-2 mb-2">Selected edge</p>
        <button id="edit-delete-edge" class="flex items-center justify-center gap-2 w-full px-3 py-2 text-red-400 hover:bg-red-500 hover:text-white rounded-md transition-colors">
          <span>Delete Connection</span>
        </button>
      `;
      const deleteEdgeBtn = document.getElementById('edit-delete-edge');
      if (deleteEdgeBtn) {
        deleteEdgeBtn.onclick = () => {
          edges.remove(selectedEdgeId);
          showEditPanel(false);
        };
      }
    }
  }

  function showEditPanel(isShown) {
    const editPanel = document.getElementById('edit-panel');
    if (!editPanel) return;

    if (isShown) {
      editPanel.classList.remove('translate-x-[120%]');
      setTimeout(() => {
        const input = document.getElementById('edit-label');
        if (input) { input.focus(); input.select(); }
      }, 450);
    } else {
      editPanel.classList.add('translate-x-[120%]');
      selectedNodeId = null;
      selectedEdgeId = null;
    }
  }

  function hideSizeSlider() {
    const container = document.getElementById('size-slider-container');
    if (!container) return;
    if (!container.classList.contains('hidden')) {
      container.classList.add('opacity-0');
      setTimeout(() => {
        container.classList.add('hidden');
        container.classList.remove('flex');
      }, 200);
      const slider = document.getElementById('node-size-slider');
      if (slider) slider.oninput = null;
    }
  }

  function showSizeSlider(nodeId) {
    const container = document.getElementById('size-slider-container');
    const slider = document.getElementById('node-size-slider');
    if (!container || !slider || !network) return;

    const node = nodes.get(nodeId);
    if (!node) return;

    if (node.entityType === 'image') {
      slider.min = 20;
      slider.max = 200;
      slider.value = node.size || 50;
    } else {
      slider.min = 16;
      slider.max = 80;
      slider.value = node.size || (ICON_SIZE / 2);
    }

    const nodePosition = network.getPositions([nodeId]);
    const domPosition = network.canvasToDOM(nodePosition[nodeId]);
    const nodeHeightOnCanvas = network.getBoundingBox(nodeId).bottom - network.getBoundingBox(nodeId).top;
    const scaledNodeHeight = nodeHeightOnCanvas * network.getScale();

    container.classList.remove('hidden', 'opacity-0');
    container.classList.add('flex');
    container.style.left = `${domPosition.x - container.offsetWidth / 2}px`;
    container.style.top = `${domPosition.y + (scaledNodeHeight / 2) + 10}px`;

    slider.oninput = (e) => {
      nodes.update({ id: nodeId, size: parseInt(e.target.value) });
    };
  }

  function showToast(message, type) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'px-4 py-2 rounded-lg text-white shadow-lg fade-in ' + toastClass(type);
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.remove('fade-in');
      toast.classList.add('fade-out');
      toast.addEventListener('animationend', () => toast.remove());
    }, 3000);
  }

  function toastClass(type) {
    switch (type) {
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  }

  function saveState() {
    if (!network) return;
    network.storePositions();
    const graphData = {
      nodes: nodes.get({ fields: ['id', 'label', 'entityType', 'image', 'shape', 'size', 'x', 'y', 'color'] }),
      edges: edges.get(),
      view: currentView
    };
    localStorage.setItem('CFGraph', JSON.stringify(graphData));
  }

  function restoreGraph() {
    const saved = localStorage.getItem('CFGraph');
    if (saved && nodes && edges) {
      try {
        const data = JSON.parse(saved);
        if (data.nodes) nodes.add(data.nodes);
        if (data.edges) edges.add(data.edges);
        if (data.view) currentView = data.view;
      } catch (e) {
        console.error('Failed to restore graph', e);
      }
    }
  }

  function exportJSON() {
    if (!nodes || !edges) return;
    saveState();
    const data = localStorage.getItem('CFGraph');
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cyberforce-investigation.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Investigation exported as JSON', 'success');
  }

  function exportPNG() {
    const canvas = document.querySelector('#network-canvas canvas');
    if (!canvas) return;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const ctx = tempCanvas.getContext('2d');

    const isNight = document.documentElement.getAttribute('data-theme') === 'night';
    ctx.fillStyle = isNight ? '#0a0a0a' : '#f5f6fa';
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    ctx.drawImage(canvas, 0, 0);

    const padding = 25;
    const logoSize = 30;
    const textFontSize = 18;
    const brandText = 'CYBER-FORCE OSINT';

    ctx.font = `bold ${textFontSize}px Orbitron`;
    const textWidth = ctx.measureText(brandText).width;
    const brandWidth = logoSize + 10 + textWidth;
    const logoX = tempCanvas.width - padding - brandWidth;
    const logoY = tempCanvas.height - padding - logoSize;

    const logoPath = new Path2D('M12 2L2 7V12C2 17.5 6.5 21.5 12 22C17.5 21.5 22 17.5 22 12V7L12 2Z M2 7L12 12 M12 22V12 M22 7L12 12 M17 4.5L7 9.5');

    ctx.save();
    ctx.translate(logoX, logoY);
    const scale = logoSize / 24;
    ctx.scale(scale, scale);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2 / scale;
    ctx.stroke(logoPath);
    ctx.restore();

    ctx.fillStyle = '#f9fafb';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(brandText, logoX + logoSize + 10, logoY + logoSize / 2);

    const a = document.createElement('a');
    a.href = tempCanvas.toDataURL('image/png');
    a.download = 'cyberforce-investigation.png';
    a.click();
    showToast('Investigation exported as PNG', 'success');
  }

  function clearCanvas() {
    if (!nodes || !edges) return;
    CF.UI.confirm('Clear entire canvas?', {
      buttons: [
        { label: 'Clear', variant: 'danger', onClick: () => {
          nodes.clear();
          edges.clear();
          selectedNodeId = null;
          selectedEdgeId = null;
          showEditPanel(false);
          saveState();
          showToast('Canvas cleared', 'info');
        }},
        { label: 'Cancel', variant: 'ghost' }
      ]
    });
  }

  function showHelp() {
    const body = `
      <div class="space-y-2">
        <p><strong>CYBER-FORCE OSINT Deep-Dive</strong> — Investigation visualization tool.</p>
        <p>• <strong>Add Nodes:</strong> Use the entity palette at the bottom to place objects on the canvas.</p>
        <p>• <strong>Connect Nodes:</strong> Select a node, click "Connect", then select a target node.</p>
        <p>• <strong>Edit:</strong> Double-click a node label, or use the right-side edit panel.</p>
        <p>• <strong>Context Menu:</strong> Right-click on canvas or nodes for quick actions.</p>
        <p>• <strong>Navigation:</strong> Mouse wheel to zoom, drag to pan.</p>
        <p>• <strong>Export:</strong> Save your investigation as JSON or PNG.</p>
        <p><strong>Tip:</strong> Your graph persists automatically in local storage.</p>
      </div>
    `;
    CF.UI.modal('CYBER-FORCE Help', body, { size: 'md', closable: true });
  }

  function bindEvents() {
    const dropOverlay = document.getElementById('drop-overlay');
    const photoInput = document.getElementById('add-photo-input');
    const loadInput = document.getElementById('load-input');
    const contextMenu = document.getElementById('context-menu');

    if (photoInput) {
      photoInput.onchange = (e) => {
        if (e.target.files.length > 0) {
          const pos = network ? network.getViewPosition() : { x: 0, y: 0 };
          addImageNodeFromFile(e.target.files[0], pos);
          e.target.value = '';
        }
      };
    }

    if (loadInput) {
      loadInput.onchange = (e) => {
        if (e.target.files.length > 0) {
          loadState(e.target.files[0]);
          e.target.value = '';
        }
      };
    }

    if (dropOverlay) {
      dropOverlay.addEventListener('dragover', (e) => e.preventDefault());

      dropOverlay.addEventListener('drop', (e) => {
        e.preventDefault();
        dragCounter = 0;
        dropOverlay.classList.add('hidden');

        if (e.dataTransfer.files.length > 0) {
          const file = e.dataTransfer.files[0];
          const pos = network ? network.DOMtoCanvas({ x: e.clientX, y: e.clientY }) : { x: 0, y: 0 };
          if (file.type.startsWith('image/')) {
            addImageNodeFromFile(file, pos);
          } else if (file.type === 'application/json') {
            loadState(file);
          }
        }
      });
    }

    window.addEventListener('dragenter', (e) => {
      e.preventDefault();
      dragCounter++;
      if (dropOverlay) dropOverlay.classList.remove('hidden');
    });

    window.addEventListener('dragleave', (e) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter <= 0 && dropOverlay) dropOverlay.classList.add('hidden');
    });

    document.addEventListener('contextmenu', (e) => {
      if (contextMenu) {
        e.preventDefault();
        const pos = { x: e.clientX, y: e.clientY };
        const nodeId = network ? network.getNodeAt(pos) : null;

        let menuHTML = '';
        if (nodeId) {
          menuHTML = `
            <button data-action="delete" class="text-left w-full px-3 py-1.5 hover:bg-brand-surface rounded">Delete Node</button>
            <button data-action="connect" class="text-left w-full px-3 py-1.5 hover:bg-brand-surface rounded">Connect</button>
          `;
        } else {
          Object.entries(ENTITY_TYPES).forEach(([type, entity]) => {
            menuHTML += `<button data-action="add" data-type="${type}" class="text-left w-full px-3 py-1.5 hover:bg-brand-surface rounded">Add "${entity.label}"</button>`;
          });
        }

        contextMenu.innerHTML = menuHTML;
        contextMenu.style.left = `${pos.x}px`;
        contextMenu.style.top = `${pos.y}px`;
        contextMenu.classList.remove('hidden');
        contextMenu.onclick = (event) => {
          const btn = event.target.closest('button');
          if (!btn) return;
          const action = btn.dataset.action;
          if (action === 'delete' && nodeId) {
            nodes.remove(nodeId);
            edges.remove(edges.get().filter(e => e.from === nodeId || e.to === nodeId).map(e => e.id));
          }
          if (action === 'connect' && nodeId) {
            network.selectNodes([nodeId]);
            selectedNodeId = nodeId;
            startConnection();
          }
          if (action === 'add') {
            addNode(btn.dataset.type);
          }
          contextMenu.classList.add('hidden');
        };
      }
    });

    document.addEventListener('click', () => {
      if (contextMenu) contextMenu.classList.add('hidden');
    });
  }

  function loadState(file) {
    if (!file || !nodes || !edges) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const graphData = JSON.parse(e.target.result);
        CF.UI.confirm('Overwrite current graph?', {
          buttons: [
            { label: 'Yes, Load', variant: 'primary', onClick: () => {
              nodes.clear();
              edges.clear();
              if (graphData.nodes) nodes.add(graphData.nodes);
              if (graphData.edges) edges.add(graphData.edges);
              showToast('Investigation loaded', 'success');
            }},
            { label: 'Cancel', variant: 'ghost' }
          ]
        });
      } catch (error) {
        CF.UI.toast('Invalid JSON file', { type: 'error' });
      }
    };
    reader.readAsText(file);
  }

  function getCurrentView() { return currentView; }
  function setCurrentView(view) { currentView = view; }

  return {
    init,
    getCurrentView,
    setCurrentView,
    addNode,
    showToast,
    saveState,
    restoreGraph,
    getNetwork: () => network,
    getNodes: () => nodes,
    getEdges: () => edges
  };
})();