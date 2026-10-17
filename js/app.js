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

  function init() {
    if (initialized) return;
    initialized = true;

    CF.Storage.seedAll();
    CF.UI.init();

    const savedTheme = CF.Storage.getTheme();
    CF.Storage.applyTheme(savedTheme);

    const canvasContainer = document.getElementById('network-canvas');
    if (canvasContainer && (typeof vis !== 'undefined' || (window && window.vis))) {
      const visLib = typeof vis !== 'undefined' ? vis : (window && window.vis);
      initNetwork(canvasContainer, visLib);
      restoreGraph();
      
      const saved = localStorage.getItem('CFGraph');
      if (!saved && nodes.getLength() === 0) {
        loadSeedGraph();
      }
    } else {
      CF.UI.toast('vis-network failed to load', { type: 'error' });
    }

    renderEntityPalette();
    renderGlobalActions();
    bindGlobalKeys();
    bindEvents();
    bindThemeSwitch();

    setTimeout(() => {
      CF.UI.toast('CYBER-FORCE OSINT Deep-Dive initialized', { type: 'success' });
    }, 500);
  }

  function initNetwork(container, visLib) {
    if (!visLib) {
      console.error('vis-network library not available');
      return;
    }

    nodes = new visLib.DataSet([]);
    edges = new visLib.DataSet([]);

    const data = { nodes: nodes, edges: edges };

    const options = {
      interaction: {
        hover: true,
        navigationButtons: false,
        keyboard: false,
        tooltipDelay: 100,
        multiselect: true,
        zoomSpeed: 0.6,
        zoomView: true
      },
      nodes: {
        shape: 'image',
        font: { color: '#e9ecef', size: 16, strokeWidth: 0, vadjust: 10 },
        borderWidth: 0,
        widthConstraint: { maximum: 200 }
      },
      edges: {
        color: { color: '#6b7280', highlight: '#38bdf8', hover: '#7dd3fc' },
        width: 2,
        arrows: { to: { enabled: true, scaleFactor: 0.7 } },
        smooth: { enabled: true, type: 'cubicBezier', forceDirection: 'vertical', roundness: 0.4 }
      },
      physics: { enabled: false },
      manipulation: { enabled: false },
      autoResize: true
    };

    network = new visLib.Network(container, data, options);

    network.on('click', handleNetworkClick);
    network.on('doubleClick', handleNetworkDoubleClick);
    network.on('dragStart', hideSizeSlider);
    network.on('dragEnd', handleDragEnd);
    network.on('zoom', hideSizeSlider);
    network.on('viewChanged', saveState);
  }

  function renderEntityPalette() {
    const palette = document.getElementById('entity-palette');
    if (!palette) return;

    palette.innerHTML = '';
    Object.entries(CF.Data.getAllEntityTypes()).forEach(([type, entity]) => {
      const btn = document.createElement('button');
      btn.className = 'tooltip';
      btn.innerHTML = '<span class="tooltiptext">' + entity.label + '</span>' + CF.Icons.get(entity.icon, { size: 24, color: entity.color });
      btn.onclick = function() { addNode(type); };
      palette.appendChild(btn);
    });
  }

  function renderGlobalActions() {
    const actions = document.getElementById('global-actions');
    if (!actions) return;

    const actionList = [
      { label: 'Save JSON', icon: 'export-json', action: exportJSON },
      { label: 'Save PNG', icon: 'export-png', action: exportPNG },
      { label: 'Load JSON', icon: 'import', action: function() { document.getElementById('load-input').click(); } },
      { label: 'Center', icon: 'center', action: function() { network.fit({ animation: true }); } },
      { label: 'Clear', icon: 'delete', action: clearCanvas, danger: true }
    ];

    actionList.forEach(function(action) {
      const btn = document.createElement('button');
      btn.className = 'tooltip';
      btn.innerHTML = '<span class="tooltiptext">' + action.label + '</span>' + CF.Icons.get(action.icon, { size: 20 });
      btn.onclick = function(e) {
        e.stopPropagation();
        action.action();
      };
      actions.appendChild(btn);
    });
  }

  function createEntityIcon(type) {
    const entity = CF.Data.getEntityType(type);
    const svg = CF.Icons.getSVG(entity.icon, { size: ICON_SIZE, color: entity.color });
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  function addNode(type, canvasPos) {
    if (!network || !nodes) return;

    const entity = CF.Data.getEntityType(type);
    if (!entity || type === 'image') {
      if (type === 'image') {
        document.getElementById('add-photo-input').click();
      }
      return;
    }

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

    const added = nodes.add(newNode);
    network.selectNode(added.id);
  }

  function addImageNodeFromFile(file, canvasPos) {
    if (!file || !file.type.startsWith('image/') || !network || !nodes) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      const position = canvasPos || network.getViewPosition();
      const nodeId = 'img_' + Date.now();
      nodes.add({
        id: nodeId,
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
        edges.add({ from: connectionSourceNodeId, to: clickedNodeId, label: 'connected' });
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
    if (!nodeId) return;

    const node = nodes.get(nodeId);
    if (!node) return;

    CF.UI.modal('Edit Label', '', {
      input: true,
      inputValue: node.label || '',
      onOk: function(newLabel) {
        if (newLabel.trim()) {
          nodes.update({ id: nodeId, label: newLabel });
        }
      }
    });
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
      const span = btn.querySelector('span');
      if (span) span.textContent = 'Select target...';
    }
    CF.UI.toast('Select target node', { type: 'info' });
  }

  function resetConnectionState() {
    isConnecting = false;
    connectionSourceNodeId = null;
    const btn = document.getElementById('edit-connect');
    if (btn) {
      btn.disabled = false;
      const span = btn.querySelector('span');
      if (span) span.textContent = 'Connect';
    }
  }

  function populateEditPanel() {
    const editPanel = document.getElementById('edit-panel');
    if (!editPanel) return;

    if (selectedNodeId) {
      const node = nodes.get(selectedNodeId);
      const entity = CF.Data.getEntityType(node.entityType);
      editPanel.innerHTML = '';

      const title = document.createElement('h3');
      title.textContent = 'Edit Node';
      title.className = 'font-bold text-lg';
      editPanel.appendChild(title);

      const typeInfo = document.createElement('p');
      typeInfo.textContent = 'Type: ' + entity.label;
      typeInfo.className = 'text-sm';
      editPanel.appendChild(typeInfo);

      const editRow = document.createElement('div');
      editRow.className = 'edit-row';

      const labelEl = document.createElement('label');
      labelEl.textContent = 'Label';
      editRow.appendChild(labelEl);

      const input = document.createElement('input');
      input.type = 'text';
      input.id = 'edit-label';
      input.value = node.label || '';
      input.oninput = function(e) {
        nodes.update({ id: selectedNodeId, label: e.target.value });
      };
      editRow.appendChild(input);
      editPanel.appendChild(editRow);

      const connectBtn = document.createElement('button');
      connectBtn.id = 'edit-connect';
      connectBtn.className = 'edit-btn edit-btn-connect';
      connectBtn.innerHTML = '<span>Connect</span>';
      connectBtn.onclick = startConnection;
      editPanel.appendChild(connectBtn);

      const divider = document.createElement('div');
      divider.className = 'border-t';
      editPanel.appendChild(divider);

      const deleteBtn = document.createElement('button');
      deleteBtn.id = 'edit-delete-node';
      deleteBtn.className = 'edit-btn edit-btn-delete';
      deleteBtn.innerHTML = '<span>Delete Node</span>';
      deleteBtn.onclick = function() {
        nodes.remove(selectedNodeId);
        const edgeIds = edges.get().filter(function(e) {
          return e.from === selectedNodeId || e.to === selectedNodeId;
        }).map(function(e) { return e.id; });
        edges.remove(edgeIds);
        showEditPanel(false);
        CF.UI.toast('Node deleted', { type: 'info' });
      };
      editPanel.appendChild(deleteBtn);
    } else if (selectedEdgeId) {
      editPanel.innerHTML = '';

      const title = document.createElement('h3');
      title.textContent = 'Edit Connection';
      title.className = 'font-bold text-lg';
      editPanel.appendChild(title);

      const info = document.createElement('p');
      info.textContent = 'Selected edge';
      info.className = 'text-sm';
      editPanel.appendChild(info);

      const deleteBtn = document.createElement('button');
      deleteBtn.id = 'edit-delete-edge';
      deleteBtn.className = 'edit-btn edit-btn-delete';
      deleteBtn.innerHTML = '<span>Delete Connection</span>';
      deleteBtn.onclick = function() {
        edges.remove(selectedEdgeId);
        showEditPanel(false);
      };
      editPanel.appendChild(deleteBtn);
    }
  }

  function showEditPanel(isShown) {
    const editPanel = document.getElementById('edit-panel');
    if (!editPanel) return;

    if (isShown) {
      editPanel.classList.add('show');
      setTimeout(function() {
        const input = document.getElementById('edit-label');
        if (input) {
          input.focus();
          input.select();
        }
      }, 350);
    } else {
      editPanel.classList.remove('show');
      selectedNodeId = null;
      selectedEdgeId = null;
    }
  }

  function hideSizeSlider() {
    const container = document.getElementById('size-slider-container');
    if (!container) return;
    container.classList.remove('show');
  }

  function showSizeSlider(nodeId) {
    const container = document.getElementById('size-slider-container');
    const slider = document.getElementById('node-size-slider');
    if (!container || !slider || !network || !nodes) return;

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
    if (!nodePosition[nodeId]) return;

    const domPosition = network.canvasToDOM(nodePosition[nodeId]);
    const boundingBox = network.getBoundingBox(nodeId);
    const nodeHeightOnCanvas = boundingBox.bottom - boundingBox.top;
    const scaledNodeHeight = nodeHeightOnCanvas * network.getScale();

    container.classList.add('show');
    container.style.left = (domPosition.x - container.offsetWidth / 2) + 'px';
    container.style.top = (domPosition.y + (scaledNodeHeight / 2) + 10) + 'px';

    slider.oninput = function(e) {
      nodes.update({ id: nodeId, size: parseInt(e.target.value) });
    };
  }

  function saveState() {
    if (!network || !nodes || !edges) return;
    network.storePositions();

    const graphData = {
      nodes: nodes.get({ fields: ['id', 'label', 'entityType', 'image', 'shape', 'size', 'x', 'y', 'color'] }),
      edges: edges.get(),
      theme: CF.Storage.getTheme()
    };

    localStorage.setItem('CFGraph', JSON.stringify(graphData));
  }

  function restoreGraph() {
    const saved = localStorage.getItem('CFGraph');
    if (!saved || !nodes || !edges) return;

    try {
      const data = JSON.parse(saved);
      if (data.nodes) {
        const restoredNodes = data.nodes.map(function(node) {
          if (node.entityType && !node.image) {
            node.image = createEntityIcon(node.entityType);
          }
          if (typeof node.x === 'string') node.x = parseFloat(node.x);
          if (typeof node.y === 'string') node.y = parseFloat(node.y);
          if (typeof node.size === 'string') node.size = parseFloat(node.size);
          return node;
        });
        nodes.add(restoredNodes);
      }
      if (data.edges) edges.add(data.edges);
      if (data.theme) {
        CF.Storage.applyTheme(data.theme);
      }
    } catch (e) {
      console.error('Failed to restore graph', e);
    }
  }

  function loadSeedGraph() {
    if (!nodes || !edges) return;
    
    const seedData = CF.Data.SEED_GRAPH;
    const seedNodes = seedData.nodes.map(function(node) {
      return {
        id: node.id,
        label: node.label,
        entityType: node.entityType,
        x: node.x || 0,
        y: node.y || 0,
        image: createEntityIcon(node.entityType),
        size: ICON_SIZE / 2
      };
    });
    
    const seedEdges = seedData.edges.map(function(edge) {
      return {
        from: edge.from,
        to: edge.to,
        label: edge.label
      };
    });
    
    nodes.add(seedNodes);
    edges.add(seedEdges);
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
    CF.UI.toast('Investigation exported as JSON', { type: 'success' });
  }

  function exportPNG() {
    if (!network) return;

    const canvas = document.querySelector('#network-canvas canvas');
    if (!canvas) {
      CF.UI.toast('Unable to export PNG', { type: 'error' });
      return;
    }

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const ctx = tempCanvas.getContext('2d');

    const isNight = CF.UI.getTheme() === 'night' || CF.Storage.getTheme() === 'night';
    ctx.fillStyle = isNight ? '#0a0a0a' : '#f5f6fa';
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    ctx.drawImage(canvas, 0, 0);

    const padding = 25;
    const logoSize = 30;
    const textFontSize = 18;
    const brandText = 'CYBER-FORCE OSINT';

    ctx.font = 'bold ' + textFontSize + 'px Orbitron';
    const textWidth = ctx.measureText(brandText).width;
    const brandWidth = logoSize + 10 + textWidth;

    const logoX = tempCanvas.width - padding - brandWidth;
    const logoY = tempCanvas.height - padding - logoSize;
    const logoPath = new Path2D('M12 2L2 7V12C2 17.5 6.5 21.5 12 22C17.5 21.5 22 17.5 22 12V7L12 2Z M2 7L12 12 M12 22V12 M22 7L12 12 M17 4.5L7 9.5');

    ctx.save();
    ctx.translate(logoX, logoY);
    var scale = logoSize / 24;
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
    CF.UI.toast('Investigation exported as PNG', { type: 'success' });
  }

  function clearCanvas() {
    if (!nodes || !edges) return;

    CF.UI.confirm('Clear entire canvas?', {
      title: 'Confirm Clear',
      buttons: [
        {
          label: 'Clear',
          variant: 'danger',
          onClick: function() {
            nodes.clear();
            edges.clear();
            selectedNodeId = null;
            selectedEdgeId = null;
            showEditPanel(false);
            saveState();
            CF.UI.toast('Canvas cleared', { type: 'info' });
          }
        },
        { label: 'Cancel', variant: 'ghost' }
      ]
    });
  }

  function showHelp() {
    const body = '<div class="space-y-2">' +
      '<p><strong>CYBER-FORCE OSINT Deep-Dive</strong> — Network graph visualization tool.</p>' +
      '<p>• <strong>Add Nodes:</strong> Use the entity palette at the bottom to place objects on the canvas.</p>' +
      '<p>• <strong>Connect Nodes:</strong> Select a node, click "Connect", then select a target node.</p>' +
      '<p>• <strong>Edit:</strong> Double-click a node to edit its label, or use the right-side edit panel.</p>' +
      '<p>• <strong>Context Menu:</strong> Right-click on canvas or nodes for quick actions.</p>' +
      '<p>• <strong>Navigation:</strong> Mouse wheel to zoom, drag to pan.</p>' +
      '<p>• <strong>Export:</strong> Save your investigation as JSON or PNG.</p>' +
      '<p><strong>Tip:</strong> Your graph persists automatically in local storage.</p>' +
      '</div>';

    CF.UI.modal('CYBER-FORCE Help', body, { closable: true });
  }

  function bindThemeSwitch() {
    const switcher = document.getElementById('theme-switcher');
    if (!switcher) return;

    const savedTheme = CF.Storage.getTheme();
    const activeBtn = switcher.querySelector('button[data-theme="' + savedTheme + '"]');
    if (activeBtn) activeBtn.classList.add('active');

    switcher.addEventListener('click', function(e) {
      const btn = e.target.closest('button[data-theme]');
      if (!btn) return;

      const theme = btn.getAttribute('data-theme');
      if (theme) {
        CF.Storage.setTheme(theme);
        saveState();
        CF.UI.toast('Theme: ' + theme, { type: 'info' });
      }
    });
  }

  function bindGlobalKeys() {
    document.addEventListener('keydown', function(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'Delete') {
        if (selectedNodeId && nodes) {
          nodes.remove(selectedNodeId);
          selectedNodeId = null;
          showEditPanel(false);
        } else if (selectedEdgeId && edges) {
          edges.remove(selectedEdgeId);
          selectedEdgeId = null;
          showEditPanel(false);
        }
      }

      if (e.key === 'Escape') {
        resetConnectionState();
        showEditPanel(false);
      }

      if (e.key === '+' || e.key === '-') {
        if (network) {
          const scale = network.getScale();
          network.moveTo({ scale: e.key === '+' ? scale * 1.2 : scale * 0.8, animation: true });
        }
      }

      if (e.ctrlKey && e.key === 'd' || e.metaKey && e.key === 'd') {
        e.preventDefault();
        CF.Storage.setTheme(CF.Storage.getTheme() === 'night' ? 'day' : 'night');
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        showHelp();
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        exportJSON();
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        exportPNG();
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        clearCanvas();
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        document.getElementById('load-input').click();
      }
    });
  }

  function bindEvents() {
    const dropOverlay = document.getElementById('drop-overlay');
    const photoInput = document.getElementById('add-photo-input');
    const loadInput = document.getElementById('load-input');
    const contextMenu = document.getElementById('context-menu');

    if (photoInput) {
      photoInput.onchange = function(e) {
        if (e.target.files.length > 0) {
          const pos = network ? network.getViewPosition() : { x: 0, y: 0 };
          addImageNodeFromFile(e.target.files[0], pos);
          e.target.value = '';
        }
      };
    }

    if (loadInput) {
      loadInput.onchange = function(e) {
        if (e.target.files.length > 0) {
          loadState(e.target.files[0]);
          e.target.value = '';
        }
      };
    }

    if (dropOverlay) {
      dropOverlay.addEventListener('dragover', function(e) {
        e.preventDefault();
      });

      dropOverlay.addEventListener('drop', function(e) {
        e.preventDefault();
        dragCounter = 0;
        dropOverlay.classList.remove('show');

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

    window.addEventListener('dragenter', function(e) {
      e.preventDefault();
      dragCounter++;
      if (dropOverlay) dropOverlay.classList.add('show');
    });

    window.addEventListener('dragleave', function(e) {
      e.preventDefault();
      dragCounter--;
      if (dragCounter <= 0 && dropOverlay) dropOverlay.classList.remove('show');
    });

    document.addEventListener('contextmenu', function(e) {
      if (!contextMenu || !network) return;

      e.preventDefault();
      const pos = { x: e.clientX, y: e.clientY };
      const nodeId = network.getNodeAt(pos);

      contextMenu.innerHTML = '';

      if (nodeId) {
        const btn1 = createContextBtn('Delete Node', function() {
          nodes.remove(nodeId);
          const edgeIds = edges.get().filter(function(edg) {
            return edg.from === nodeId || edg.to === nodeId;
          }).map(function(edg) { return edg.id; });
          edges.remove(edgeIds);
          contextMenu.classList.remove('show');
          CF.UI.toast('Node deleted', { type: 'info' });
        });
        const btn2 = createContextBtn('Connect', function() {
          network.selectNodes([nodeId]);
          selectedNodeId = nodeId;
          startConnection();
          contextMenu.classList.remove('show');
        });
        contextMenu.appendChild(btn1);
        contextMenu.appendChild(btn2);
      } else {
        Object.entries(CF.Data.getAllEntityTypes()).forEach(function(entry) {
          const type = entry[0];
          const entity = entry[1];
          const btn = createContextBtn('Add "' + entity.label + '"', function() {
            addNode(type);
            contextMenu.classList.remove('show');
          });
          contextMenu.appendChild(btn);
        });
      }

      contextMenu.style.left = pos.x + 'px';
      contextMenu.style.top = pos.y + 'px';
      contextMenu.classList.add('show');
    });

    document.addEventListener('click', function() {
      if (contextMenu) contextMenu.classList.remove('show');
    });
  }

  function createContextBtn(label, onClick) {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.onclick = onClick;
    return btn;
  }

  function loadState(file) {
    if (!file || !nodes || !edges) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const graphData = JSON.parse(e.target.result);
        CF.UI.confirm('Load investigation?', {
          title: 'Confirm Load',
          body: 'Current canvas will be replaced.',
          buttons: [
            {
              label: 'Load',
              variant: 'primary',
              onClick: function() {
                nodes.clear();
                edges.clear();
                if (graphData.nodes) nodes.add(graphData.nodes);
                if (graphData.edges) edges.add(graphData.edges);
                CF.UI.toast('Investigation loaded', { type: 'success' });
              }
            },
            { label: 'Cancel', variant: 'ghost' }
          ]
        });
      } catch (error) {
        CF.UI.toast('Invalid JSON file', { type: 'error' });
      }
    };
    reader.readAsText(file);
  }

  return {
    init,
    getNetwork: function() { return network; },
    getNodes: function() { return nodes; },
    getEdges: function() { return edges; },
    addNode: addNode,
    saveState: saveState,
    restoreGraph: restoreGraph,
    exportJSON: exportJSON,
    exportPNG: exportPNG,
    showHelp: showHelp,
    clearCanvas: clearCanvas
  };
})();