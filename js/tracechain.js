window.CF = window.CF || {};

CF.TraceChain = (function () {
  'use strict';

  let rail;
  let currentChain = [];
  let cases = [];
  let timelineEl;

  const MODULE_CONFIG = {
    telegram: { label: 'Telegram', color: 'var(--tg-accent)', icon: 'telegram', bg: 'var(--tg-accent-alpha)' },
    darkweb: { label: 'Dark Web', color: 'var(--dw-accent)', icon: 'onion', bg: 'var(--dw-accent-alpha)' },
    deepweb: { label: 'Deep Web', color: 'var(--deep-accent)', icon: 'database', bg: 'var(--deep-accent-alpha)' }
  };

  function init() {
    loadChain();
    loadCases();
    renderRail();
    bindEvents();
  }

  function loadChain() {
    const draft = localStorage.getItem('cf.dd.chainDraft');
    if (draft) {
      try {
        currentChain = JSON.parse(draft);
      } catch (e) {
        currentChain = [];
      }
    }

    if (currentChain.length === 0) {
      const storedChains = localStorage.getItem('cf.dd.chains');
      if (storedChains) {
        try {
          const chains = JSON.parse(storedChains);
          const demo = chains.find(c => c.id === 'chain-demo-01');
          if (demo) {
            currentChain = demo.hops;
          }
        } catch (e) {}
      }
    }
  }

  function saveChain() {
    localStorage.setItem('cf.dd.chainDraft', JSON.stringify(currentChain));
  }

  function loadCases() {
    const stored = localStorage.getItem('cf.dd.cases');
    if (stored) {
      try {
        cases = JSON.parse(stored);
      } catch (e) {
        cases = [];
      }
    }
  }

  function saveCases() {
    localStorage.setItem('cf.dd.cases', JSON.stringify(cases));
  }

  function renderRail() {
    rail = CF.UI.createEl('div', {
      class: 'tracechain-rail',
      'aria-label': 'Trace Chain'
    });

    const header = CF.UI.createEl('div', { class: 'tracechain-rail__header' });
    header.innerHTML = `
      <h3 class="tracechain-rail__title">
        ${CF.Icons.get('chain', { size: 'md' })} Trace Chain
      </h3>
      <div class="tracechain-rail__actions">
        <button type="button" class="btn btn--icon btn--sm" id="tc-export-json" title="Export JSON" aria-label="Export as JSON">
          ${CF.Icons.get('export-json', { size: 'sm' })}
        </button>
        <button type="button" class="btn btn--icon btn--sm" id="tc-export-png" title="Export PNG" aria-label="Export as PNG">
          ${CF.Icons.get('export-png', { size: 'sm' })}
        </button>
        <button type="button" class="btn btn--icon btn--sm" id="tc-save-case" title="Save as Case" aria-label="Save as case">
          ${CF.Icons.get('save', { size: 'sm' })}
        </button>
      </div>
    `;
    rail.appendChild(header);

    const hopsEl = CF.UI.createEl('div', { class: 'tracechain-rail__hops' });
    rail.appendChild(hopsEl);
    renderHops();

    const confidence = computeConfidence();
    const confEl = CF.UI.createEl('div', { class: 'tracechain-rail__confidence' });
    confEl.innerHTML = `
      <div class="tracechain-confidence-label">Chain Confidence</div>
      <div class="tracechain-confidence-value">${Math.round(confidence * 100)}%</div>
    `;
    rail.appendChild(confEl);

    const casesEl = CF.UI.createEl('div', { class: 'tracechain-rail__cases' });
    casesEl.innerHTML = '<h4>Cases</h4>';
    const caseList = CF.UI.createEl('div', { class: 'tracechain-cases-list' });
    cases.forEach(c => {
      const item = CF.UI.createEl('div', {
        class: 'tracechain-case-item',
        'data-case-id': c.id
      });
      item.innerHTML = `
        <span class="tracechain-case-name">${c.name}</span>
        <span class="tracechain-case-date">${c.createdAt}</span>
        <div class="tracechain-case-actions">
          <button type="button" class="btn btn--icon btn--xs btn--ghost tc-case-load" title="Load" aria-label="Load case">${CF.Icons.get('download', { size: 'xs' })}</button>
          <button type="button" class="btn btn--icon btn--xs btn--ghost tc-case-delete" title="Delete" aria-label="Delete case">${CF.Icons.get('delete', { size: 'xs' })}</button>
        </div>
      `;
      caseList.appendChild(item);
    });
    casesEl.appendChild(caseList);
    rail.appendChild(casesEl);

    const existing = document.getElementById('tracechain-rail');
    if (existing) existing.remove();
    rail.setAttribute('id', 'tracechain-rail');
    rail.setAttribute('tabindex', '-1');
    rail.setAttribute('role', 'region');
    rail.setAttribute('aria-label', 'Trace Chain Rail');
    document.body.appendChild(rail);

    bindRailEvents();
  }

  function renderHops() {
    const hopsEl = rail.querySelector('.tracechain-rail__hops');
    if (!hopsEl) return;

    hopsEl.innerHTML = '';

    if (currentChain.length === 0) {
      hopsEl.innerHTML = '<p class="tracechain-empty">No hops in chain. Add nodes from any view.</p>';
      return;
    }

    currentChain.forEach((hop, index) => {
      const config = MODULE_CONFIG[hop.module] || MODULE_CONFIG.telegram;
      const hopEl = CF.UI.createEl('div', {
        class: 'tracechain-rail__hop',
        'data-hop-id': hop.id
      });

      hopEl.innerHTML = `
        <div class="tracechain-rail__hop-icon" style="background:${config.bg}">
          ${CF.Icons.get(config.icon, { size: 'sm' })}
        </div>
        <div class="tracechain-rail__hop-content">
          <div class="tracechain-rail__hop-label">${hop.label}</div>
          <div class="tracechain-rail__hop-meta">
            <span class="tracechain-rail__hop-module">${config.label}</span>
            <span class="tracechain-rail__hop-confidence">${Math.round(hop.confidence * 100)}%</span>
          </div>
          ${hop.note ? `<div class="tracechain-rail__hop-note">${hop.note}</div>` : ''}
        </div>
        <div class="tracechain-rail__hop-actions">
          <button type="button" class="btn btn--icon btn--xs btn--ghost tc-hop-move-up" title="Move up" aria-label="Move up">
            ${CF.Icons.get('chevron-up', { size: 'xs' })}
          </button>
          <button type="button" class="btn btn--icon btn--xs btn--ghost tc-hop-move-down" title="Move down" aria-label="Move down">
            ${CF.Icons.get('chevron-down', { size: 'xs' })}
          </button>
          <button type="button" class="btn btn--icon btn--xs btn--ghost tc-hop-remove" title="Remove" aria-label="Remove hop">
            ${CF.Icons.get('remove', { size: 'xs' })}
          </button>
        </div>
      `;

      hopsEl.appendChild(hopEl);
    });

    bindHopEvents();
  }

  function bindRailEvents() {
    const exportJsonBtn = rail.querySelector('#tc-export-json');
    if (exportJsonBtn) {
      exportJsonBtn.addEventListener('click', () => exportJSON());
    }

    const exportPngBtn = rail.querySelector('#tc-export-png');
    if (exportPngBtn) {
      exportPngBtn.addEventListener('click', () => exportPNG());
    }

    const saveBtn = rail.querySelector('#tc-save-case');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => saveAsCase());
    }
  }

  function bindHopEvents() {
    qsa('.tc-hop-move-up', rail).forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const hop = btn.closest('.tracechain-rail__hop');
        const index = Array.from(hop.parentNode.children).indexOf(hop);
        if (index > 0) {
          [currentChain[index], currentChain[index - 1]] = [currentChain[index - 1], currentChain[index]];
          saveChain();
          renderHops();
          CF.UI.toast('Reordered chain', { type: 'info' });
        }
      });
    });

    qsa('.tc-hop-move-down', rail).forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const hop = btn.closest('.tracechain-rail__hop');
        const index = Array.from(hop.parentNode.children).indexOf(hop);
        if (index < currentChain.length - 1) {
          [currentChain[index], currentChain[index + 1]] = [currentChain[index + 1], currentChain[index]];
          saveChain();
          renderHops();
          CF.UI.toast('Reordered chain', { type: 'info' });
        }
      });
    });

    qsa('.tc-hop-remove', rail).forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const hop = btn.closest('.tracechain-rail__hop');
        const index = Array.from(hop.parentNode.children).indexOf(hop);
        currentChain.splice(index, 1);
        saveChain();
        renderHops();
        CF.UI.toast('Removed hop from chain', { type: 'info' });
      });
    });

    rail.addEventListener('keydown', (e) => {
      const hop = e.target.closest('.tracechain-rail__hop');
      if (!hop) return;
      const index = Array.from(hop.parentNode.children).indexOf(hop);

      if (e.altKey && e.key === 'ArrowUp' && index > 0) {
        e.preventDefault();
        [currentChain[index], currentChain[index - 1]] = [currentChain[index - 1], currentChain[index]];
        saveChain();
        renderHops();
        hop.focus();
      } else if (e.altKey && e.key === 'ArrowDown' && index < currentChain.length - 1) {
        e.preventDefault();
        [currentChain[index], currentChain[index + 1]] = [currentChain[index + 1], currentChain[index]];
        saveChain();
        renderHops();
        hop.focus();
      } else if (e.key === 'Delete') {
        e.preventDefault();
        currentChain.splice(index, 1);
        saveChain();
        renderHops();
      }
    });
  }

  function bindEvents() {
    CF.DeepDive.bus.on('chain:add', (payload) => {
      if (Array.isArray(payload)) return;

      const node = payload.node || payload;
      if (!node) return;

      const exists = currentChain.find(h => h.entityRef === node.id);
      if (exists) {
        CF.UI.toast('Already in trace chain', { type: 'info' });
        return;
      }

      currentChain.push({
        id: 'hop-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
        entityRef: node.id,
        module: payload.module || 'telegram',
        label: node.label || node.handle || node.id,
        confidence: 0.9,
        ts: new Date().toISOString(),
        note: '',
        nodeData: node
      });
      saveChain();
      renderHops();
      CF.UI.toast(`Added ${node.label || node.id} to trace chain`, { type: 'success' });
    });

    CF.DeepDive.bus.on('chain:remove', (hopId) => {
      const index = currentChain.findIndex(h => h.id === hopId);
      if (index >= 0) {
        currentChain.splice(index, 1);
        saveChain();
        renderHops();
      }
    });

    rail.addEventListener('keydown', (e) => {
      if (e.target === rail || e.target.classList.contains('tracechain-rail')) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const firstHop = rail.querySelector('.tracechain-rail__hop');
          if (firstHop) firstHop.focus();
        }
      }
    });
  }

  function computeConfidence() {
    if (currentChain.length === 0) return 0;
    return currentChain.reduce((product, hop) => product * hop.confidence, 1);
  }

  function exportJSON() {
    const data = {
      name: 'Exported Chain',
      hops: currentChain,
      confidence: computeConfidence(),
      exportedAt: new Date().toISOString(),
      schemaVersion: 1
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tracechain_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    CF.UI.toast('Exported Trace Chain as JSON', { type: 'success' });
  }

  function exportPNG() {
    renderTimelineToCanvas().then(canvas => {
      if (!canvas) {
        CF.UI.toast('PNG export failed', { type: 'error' });
        return;
      }

      const link = document.createElement('a');
      link.download = `tracechain_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png', 0.9);
      link.click();
      CF.UI.toast('Exported Trace Chain as PNG', { type: 'success' });
    });
  }

  function renderTimelineToCanvas() {
    return new Promise((resolve) => {
      if (currentChain.length === 0) {
        CF.UI.toast('No chain to export', { type: 'warning' });
        resolve(null);
        return;
      }

      const width = Math.max(800, currentChain.length * 200);
      const height = 300;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      const theme = CF.UI.getTheme();
      ctx.fillStyle = theme === 'night' ? '#0f0f1a' : '#ffffff';
      ctx.fillRect(0, 0, width, height);

      ctx.font = '12px monospace';
      ctx.fillStyle = 'rgba(13, 202, 255, 0.15)';
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.rotate(-30 * Math.PI / 180);
      ctx.textAlign = 'center';
      ctx.fillText('SIMULATED DATA — CYBER-FORCE Training Use Only', width / 2, height / 2);
      ctx.restore();

      const hopWidth = width / (currentChain.length + 1);
      const startY = 80;
      const endY = 220;

      ctx.strokeStyle = theme === 'night' ? '#0d6efd' : '#0d6efd';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);

      ctx.beginPath();
      for (let i = 0; i < currentChain.length; i++) {
        const x = hopWidth * (i + 1);
        const y = startY + 40 * Math.sin(i);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      currentChain.forEach((hop, i) => {
        const x = hopWidth * (i + 1);
        const y = startY + 40 * Math.sin(i);
        const config = MODULE_CONFIG[hop.module] || MODULE_CONFIG.telegram;

        const color = i === 0 ? '#28a745' : config.color;
        ctx.fillStyle = color;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.font = '14px monospace';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(config.icon.substring(0, 2).toUpperCase(), x, y);

        ctx.font = '11px monospace';
        ctx.fillStyle = theme === 'night' ? '#e9ecef' : '#333';
        ctx.textAlign = 'center';
        ctx.fillText(hop.label.substring(0, 20), x, y + 35);

        ctx.fillStyle = '#6c757d';
        ctx.fillText(`${Math.round(hop.confidence * 100)}%`, x, y + 50);

        if (i < currentChain.length - 1) {
          const nextX = hopWidth * (i + 2);
          const nextY = startY + 40 * Math.sin(i + 1);
          ctx.strokeStyle = '#6c757d';
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(x + 20, y);
          ctx.lineTo(nextX - 20, nextY);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });

      ctx.font = 'bold 16px monospace';
      ctx.fillStyle = theme === 'night' ? '#fff' : '#333';
      ctx.textAlign = 'center';
      ctx.fillText('Trace Chain — ' + (currentChain[0]?.label || 'Untitled'), width / 2, 30);

      ctx.font = '12px monospace';
      ctx.fillStyle = '#6c757d';
      ctx.textAlign = 'right';
      ctx.fillText(`Chain Confidence: ${Math.round(computeConfidence() * 100)}%`, width - 20, height - 20);

      resolve(canvas);
    });
  }

  function saveAsCase() {
    const name = prompt('Case name:', 'Chain_' + Date.now());
    if (!name) return;

    const caseData = {
      id: 'case_' + Date.now(),
      name: name,
      hops: currentChain,
      confidence: computeConfidence(),
      createdAt: new Date().toISOString().split('T')[0],
      notes: ''
    };

    cases.push(caseData);
    saveCases();
    renderRail();

    CF.UI.toast(`Saved as case: ${name}`, { type: 'success' });
  }

  function showTimeline() {
    renderTimelineToCanvas().then(canvas => {
      if (!canvas) return;

      const img = new Image();
      img.src = canvas.toDataURL();
      img.onload = () => {
        CF.UI.modal('Trace Chain Timeline', img, { size: 'xl', closable: true });
      };
    });
  }

  return {
    init,
    getChain: () => currentChain,
    getConfidence: computeConfidence,
    showTimeline,
    exportJSON,
    exportPNG,
    renderRail,
    renderHops
  };
})();