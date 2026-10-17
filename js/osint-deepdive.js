window.CF = window.CF || {};

CF.DeepDive = (function () {
  'use strict';

  const TABS = [
    { id: 'telegram', label: 'Telegram Investigations', icon: 'telegram', accent: 'tg' },
    { id: 'darkweb',  label: 'Dark Web Investigations', icon: 'onion',   accent: 'dw' },
    { id: 'deepweb',  label: 'Deep Web Investigations', icon: 'database', accent: 'deep' }
  ];

  let state = {
    currentTab: 'telegram',
    filters: {},
    selection: null,
    chainDraft: []
  };

  const STORAGE_KEYS = {
    tab: 'cf.dd.tab',
    filters: (tab) => `cf.dd.filters.${tab}`,
    selection: 'cf.dd.selection',
    chainDraft: 'cf.dd.chainDraft',
    chains: 'cf.dd.chains',
    version: 'cf.dd.v'
  };

  const SUBSCRIBERS = {};

  const bus = {
    emit(event, payload) {
      if (SUBSCRIBERS[event]) {
        SUBSCRIBERS[event].forEach(fn => fn(payload));
      }
    },
    on(event, fn) {
      if (!SUBSCRIBERS[event]) SUBSCRIBERS[event] = [];
      SUBSCRIBERS[event].push(fn);
      return () => {
        const idx = SUBSCRIBERS[event].indexOf(fn);
        if (idx >= 0) SUBSCRIBERS[event].splice(idx, 1);
      };
    }
  };

  let saveTimeout;
  function saveState() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEYS.tab, state.currentTab);
        Object.entries(state.filters).forEach(([tab, f]) => {
          localStorage.setItem(STORAGE_KEYS.filters(tab), JSON.stringify(f));
        });
        localStorage.setItem(STORAGE_KEYS.chainDraft, JSON.stringify(state.chainDraft));
        if (state.selection) {
          localStorage.setItem(STORAGE_KEYS.selection, JSON.stringify(state.selection));
        }
      } catch (err) {
        console.warn('DeepDive.saveState:', err);
      }
    }, 300);
  }

  function restoreState() {
    try {
      const savedTab = localStorage.getItem(STORAGE_KEYS.tab);
      if (savedTab && TABS.find(t => t.id === savedTab)) state.currentTab = savedTab;

      TABS.forEach(tab => {
        const saved = localStorage.getItem(STORAGE_KEYS.filters(tab.id));
        if (saved) state.filters[tab.id] = JSON.parse(saved);
      });

      const savedDraft = localStorage.getItem(STORAGE_KEYS.chainDraft);
      if (savedDraft) state.chainDraft = JSON.parse(savedDraft);

      const savedSel = localStorage.getItem(STORAGE_KEYS.selection);
      if (savedSel) state.selection = JSON.parse(savedSel);

      const version = localStorage.getItem(STORAGE_KEYS.version);
      if (!version || parseInt(version, 10) < 1) {
        localStorage.setItem(STORAGE_KEYS.version, '1');
        return true;
      }
    } catch (err) {
      console.warn('DeepDive.restoreState:', err);
    }
    return false;
  }

  function checkVersion(resets) {
    const version = localStorage.getItem(STORAGE_KEYS.version);
    if (!version || parseInt(version, 10) < 1) {
      resets.push('Deep-Dive data');
      return true;
    }
    return false;
  }

  const components = {
    animatedCounter(container, targetValue, opts = {}) {
      const o = Object.assign({ duration: 1500, prefix: '', suffix: '', decimals: 0 }, opts);
      container.textContent = '';
      container.classList.add('deepdive-counter');

      if (CF.UI.isReducedMotion()) {
        container.textContent = o.prefix + Number(targetValue).toLocaleString(undefined, { minimumFractionDigits: o.decimals, maximumFractionDigits: o.decimals }) + o.suffix;
        return;
      }

      const start = performance.now();
      const startValue = 0;

      function step(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / o.duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = startValue + (targetValue - startValue) * easeOut;
        container.textContent = o.prefix + Number(current).toLocaleString(undefined, { minimumFractionDigits: o.decimals, maximumFractionDigits: o.decimals }) + o.suffix;
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    },

    radialGauge(container, value, opts = {}) {
      const o = Object.assign({ label: '', color: 'var(--accent)', size: 100, showValue: true }, opts);
      const clamped = Math.max(0, Math.min(100, value));
      const radius = o.size / 2 - 6;
      const strokeWidth = 4;
      const circumference = 2 * Math.PI * radius;
      const offset = circumference - (clamped / 100) * circumference;

      const colorMap = {
        low: 'var(--color-safe)',
        medium: 'var(--color-warning)',
        high: 'var(--color-danger)'
      };
      const color = o.color || (clamped < 30 ? colorMap.low : clamped < 70 ? colorMap.medium : colorMap.high);

      container.innerHTML = '';
      container.classList.add('deepdive-gauge');
      container.setAttribute('data-value', clamped);

      const svg = CF.UI.createEl('svg', {
        class: 'gauge-svg',
        width: o.size,
        height: o.size,
        viewBox: '0 0 100 100',
        role: 'img',
        'aria-label': `${o.label}: ${clamped}%`
      });

      CF.UI.createEl('circle', {
        class: 'gauge-bg',
        cx: 50, cy: 50, r: radius,
        'stroke-width': strokeWidth,
        fill: 'none'
      }, [svg]);

      const fg = CF.UI.createEl('circle', {
        class: 'gauge-fg',
        cx: 50, cy: 50, r: radius,
        'stroke-width': strokeWidth,
        fill: 'none',
        stroke: color,
        'stroke-dasharray': circumference,
        'stroke-dashoffset': CF.UI.isReducedMotion() ? offset : circumference,
        style: CF.UI.isReducedMotion() ? '' : `transition: stroke-dashoffset ${o.duration || 800}ms ease-out`
      }, [svg]);

      if (!CF.UI.isReducedMotion()) {
        setTimeout(() => {
          fg.setAttribute('stroke-dashoffset', offset);
        }, 50);
      }

      const center = CF.UI.createEl('g', { class: 'gauge-center' }, [svg]);
      if (o.showValue) {
        CF.UI.createEl('text', {
          class: 'gauge-value',
          x: 50, y: 48, 'text-anchor': 'middle',
          'font-size': '14', 'font-weight': 'bold',
          html: `${clamped}%`
        }, [center]);
      }
      if (o.label) {
        CF.UI.createEl('text', {
          class: 'gauge-label',
          x: 50, y: 62, 'text-anchor': 'middle',
          'font-size': '9', html: o.label
        }, [center]);
      }

      container.appendChild(svg);
      return { element: container, setValue: (v) => { this.radialGauge(container, v, o); } };
    },

    confidenceBar(container, confidence, opts = {}) {
      const o = Object.assign({ label: '', tooltip: '' }, opts);
      const percent = Math.round(confidence * 100);
      const barClass = confidence > 0.9 ? 'high' : confidence > 0.7 ? 'medium' : confidence > 0.5 ? 'low' : 'very-low';
      const colorVar = confidence > 0.9 ? 'var(--color-safe)' : confidence > 0.7 ? '#4a90d9' : confidence > 0.5 ? 'var(--color-warning)' : 'var(--color-danger)';

      container.innerHTML = `
        <div class="confidence-bar ${barClass}" role="progressbar" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100">
          <div class="confidence-bar__track">
            <div class="confidence-bar__fill" style="width:${percent}%;background:${colorVar};"></div>
          </div>
          <span class="confidence-bar__label">${o.label || percent + '%'} <span class="confidence-bar__tooltip">${o.tooltip || `Confidence: ${percent}%`}</span></span>
        </div>
      `;

      if (o.tooltip) {
        const tooltip = container.querySelector('.confidence-bar__tooltip');
        tooltip.style.display = 'none';
      }
    },

    simBadge() {
      return CF.UI.createEl('span', {
        class: 'sim-badge',
        html: CF.Icons.get('sim', { size: 'sm' }) + ' SIMULATED DATA',
        title: 'This data is simulated and for training purposes only'
      });
    },

    actionRow(node, handlers = {}) {
      const row = CF.UI.createEl('div', { class: 'action-row' });

      CF.UI.createEl('button', {
        type: 'button',
        class: 'btn btn--sm btn--ghost',
        html: CF.Icons.get('send-to-graph', { size: 'sm' }) + ' Send to Graph',
        onclick: () => { if (handlers.sendToGraph) handlers.sendToGraph(node); }
      }, [row]);

      CF.UI.createEl('button', {
        type: 'button',
        class: 'btn btn--sm btn--ghost',
        html: CF.Icons.get('chain', { size: 'sm' }) + ' Add to Trace Chain',
        onclick: () => { if (handlers.addToChain) handlers.addToChain(node); }
      }, [row]);

      CF.UI.createEl('button', {
        type: 'button',
        class: 'btn btn--sm btn--ghost',
        html: CF.Icons.get('copy', { size: 'sm' }) + ' Copy ID',
        onclick: () => {
          navigator.clipboard.writeText(node.id || node.handle || node.label).catch(() => {});
          CF.UI.toast('Copied to clipboard', { type: 'info' });
        }
      }, [row]);

      return row;
    },

    tooltip(targetEl, text) {
      targetEl.classList.add('has-tooltip');
      targetEl.setAttribute('aria-describedby', 'tooltip-' + Math.random().toString(36).substr(2, 9));
      targetEl.insertAdjacentHTML('afterend', `<div class="tooltip" role="tooltip">${text}</div>`);
    },

    typeIcon(type, subtype) {
      const iconMap = {
        channel: 'megaphone', group: 'people', user: 'person', person: 'person',
        bot: 'robot', admin: 'crown', wallet: 'wallet', email: 'email',
        phone: 'phone', pgp: 'pgp', link: 'link', market: 'market',
        vendor: 'vendor', listing: 'listing', mirror: 'mirror', forum: 'forum',
        database: 'database', record: 'record', portal: 'portal', leak: 'leak',
        device: 'device', archive: 'archive', breach: 'breach', group_admin: 'crown'
      };
      const name = iconMap[type] || iconMap[subtype] || 'info';
      return CF.Icons.get(name, { size: 'md' });
    }
  };

  function navigate(tabId) {
    const tab = TABS.find(t => t.id === tabId);
    if (!tab) return;

    state.currentTab = tabId;
    saveState();
    bus.emit('tab:changed', tabId);

    const tabEls = document.querySelectorAll('[data-deepdive-tab]');
    tabEls.forEach(el => el.classList.toggle('active', el.getAttribute('data-deepdive-tab') === tabId));

    const contentEls = document.querySelectorAll('.deepdive__panel');
    contentEls.forEach(el => el.classList.toggle('active', el.getAttribute('data-deepdive-panel') === tabId));

    if (window.CF.Views && CF.Views[tabId] && typeof CF.Views[tabId].mount === 'function') {
      CF.Views[tabId].mount(document.querySelector(`[data-deepdive-panel="${tabId}"]`));
    }
  }

  function riskBand(risk) {
    if (risk < 30) return { label: 'Low', class: 'risk-low' };
    if (risk < 60) return { label: 'Medium', class: 'risk-medium' };
    if (risk < 80) return { label: 'High', class: 'risk-high' };
    return { label: 'Critical', class: 'risk-critical' };
  }

  function getAccent(module) {
    const tab = TABS.find(t => t.id === module);
    return tab ? tab.accent : 'tg';
  }

  function getState() { return { ...state }; }
  function setState(updates) {
    Object.assign(state, updates);
    saveState();
    bus.emit('state:changed', state);
  }

  return {
    init,
    navigate,
    getState,
    setState,
    saveState,
    restoreState,
    checkVersion,
    getAccent,
    riskBand,
    TABS,
    bus,
    components,
    STORAGE_KEYS
  };
})();