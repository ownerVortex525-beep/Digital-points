window.CF = window.CF || {};

CF.UI = (function () {
  'use strict';

  let toastContainer;
  let modalStack = [];
  let lastFocusedEl = null;
  let reducedMotion = false;
  let theme = 'day';

  const SHORTCUTS = {
    'g d': 'go to Deep-Dive',
    '1': 'switch to Telegram sub-tab',
    '2': 'switch to Dark Web sub-tab',
    '3': 'switch to Deep Web sub-tab',
    '/': 'focus search',
    'c': 'add selected to Trace Chain',
    's': 'send to main graph',
    '?': 'show this help',
    'Esc': 'close top layer'
  };

  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

  function createEl(tag, props = {}, children = []) {
    const el = document.createElement(tag);
    Object.entries(props).forEach(([k, v]) => {
      if (k === 'class') { el.className = v; }
      else if (k === 'html') { el.innerHTML = v; }
      else if (k.startsWith('aria-')) { el.setAttribute(k, v); }
      else if (k in el) { el[k] = v; }
      else { el.setAttribute(k, v); }
    });
    children.forEach(c => el.appendChild(
      typeof c === 'string' ? document.createTextNode(c) : c
    ));
    return el;
  }

  function initReducedMotion() {
    reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.body.classList.toggle('reduced-motion', reducedMotion);
  }

  function initTheme() {
    const saved = localStorage.getItem('cf.theme');
    theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day');
    applyTheme(theme);
  }

  function applyTheme(t) {
    theme = t;
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('cf.theme', theme);
  }

  function toggleTheme() {
    applyTheme(theme === 'day' ? 'night' : 'day');
  }

  function isReducedMotion() { return reducedMotion; }
  function getTheme() { return theme; }

  function initToastContainer() {
    toastContainer = createEl('div', {
      id: 'toast-container',
      class: 'toast-container',
      'aria-live': 'polite',
      'aria-atomic': 'true'
    });
    document.body.appendChild(toastContainer);
  }

  function toast(message, options = {}) {
    const opts = Object.assign({
      duration: 4000,
      type: 'info',
      action: null
    }, options);

    const iconMap = {
      info: 'info', warning: 'alert', error: 'alert', success: 'check'
    };
    const icon = CF.Icons ? CF.Icons.get(iconMap[opts.type] || 'info', { size: 'sm' }) : '';

    const toastEl = createEl('div', {
      class: `toast toast--${opts.type}`,
      'aria-live': opts.type === 'error' ? 'assertive' : 'off'
    });

    const content = createEl('div', { class: 'toast__content' });
    content.innerHTML = icon + message;
    toastEl.appendChild(content);

    if (opts.action) {
      const btn = createEl('button', {
        type: 'button',
        class: 'toast__action',
        textContent: opts.action.label,
        onclick: () => {
          if (opts.action.onClick) opts.action.onClick();
          dismiss(toastEl);
        }
      });
      toastEl.appendChild(btn);
    }

    const dismissBtn = createEl('button', {
      type: 'button',
      class: 'toast__close',
      html: CF.Icons ? CF.Icons.get('close', { size: 'sm' }) : '×',
      'aria-label': 'Dismiss',
      onclick: () => dismiss(toastEl)
    });
    toastEl.appendChild(dismissBtn);

    toastContainer.appendChild(toastEl);
    requestAnimationFrame(() => toastEl.classList.add('show'));

    let timeout = setTimeout(() => dismiss(toastEl), opts.duration);

    function dismiss() {
      clearTimeout(timeout);
      toastEl.classList.remove('show');
      toastEl.addEventListener('transitionend', () => {
        if (toastEl.parentNode) toastEl.parentNode.removeChild(toastEl);
      }, { once: true });
    }

    return { element: toastEl, dismiss };
  }

  function modal(title, content, options = {}) {
    const opts = Object.assign({
      closable: true,
      size: 'md',
      buttons: [],
      onClose: null
    }, options);

    lastFocusedEl = document.activeElement;
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;

    const overlay = createEl('div', {
      class: 'modal-overlay',
      'data-size': opts.size,
      onclick: opts.closable ? closeModal : null
    });

    const dialog = createEl('div', {
      class: 'modal',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-labelledby': 'modal-title',
      tabindex: '-1'
    });
    overlay.appendChild(dialog);

    const header = createEl('div', { class: 'modal__header' });
    header.innerHTML = `<h2 id="modal-title">${title}</h2>`;
    if (opts.closable) {
      header.appendChild(createEl('button', {
        type: 'button',
        class: 'modal__close',
        html: CF.Icons ? CF.Icons.get('close') : '×',
        'aria-label': 'Close',
        onclick: closeModal
      }));
    }
    dialog.appendChild(header);

    const body = createEl('div', {
      class: 'modal__body',
      html: typeof content === 'string' ? content : ''
    });
    if (typeof content === 'object' && content.nodeType) {
      body.innerHTML = '';
      body.appendChild(content);
    }
    dialog.appendChild(body);

    const footer = createEl('div', { class: 'modal__footer' });
    opts.buttons.forEach(btn => {
      footer.appendChild(createEl('button', {
        type: 'button',
        class: `btn ${btn.variant ? 'btn--' + btn.variant : 'btn--primary'}`,
        textContent: btn.label,
        onclick: (e) => {
          e.preventDefault();
          const result = btn.onClick ? btn.onClick() : null;
          if (result !== false) closeModal(result);
        }
      }));
    });
    if (opts.closable) {
      footer.appendChild(createEl('button', {
        type: 'button',
        class: 'btn btn--ghost',
        textContent: 'Cancel',
        onclick: closeModal
      }));
    }
    dialog.appendChild(footer);

    document.body.appendChild(overlay);
    modalStack.push({ overlay, dialog, onRemove: opts.onClose });

    setTimeout(() => {
      dialog.focus();
    }, 50);

    function closeModal(result) {
      const entry = modalStack.pop();
      if (entry && entry.onRemove) entry.onRemove();
      overlay.classList.add('closing');
      overlay.addEventListener('transitionend', () => {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        document.body.style.position = '';
        document.body.style.top = '';
        window.scrollTo(0, parseInt(document.body.style.top || '0') * -1 || 0);
        if (lastFocusedEl) lastFocusedEl.focus();
      }, { once: true });
    }

    function trapFocus(e) {
      if (e.key === 'Escape' && opts.closable) {
        e.preventDefault();
        closeModal();
        return;
      }
      const focusables = dialog.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    dialog.addEventListener('keydown', trapFocus);

    return {
      close: closeModal,
      body,
      dialog
    };
  }

  function confirmDialog(message, options = {}) {
    return new Promise((resolve) => {
      modal('Confirm', message, {
        size: 'sm',
        buttons: [
          { label: 'Confirm', variant: 'danger', onClick: () => resolve(true) },
          { label: 'Cancel', variant: 'ghost', onClick: () => resolve(false) }
        ],
        onClose: () => resolve(false)
      });
    });
  }

  function showShortcuts() {
    const rows = Object.entries(SHORTCUTS).map(([k, v]) =>
      `<tr><td><kbd>${k}</kbd></td><td>${v}</td></tr>`
    ).join('');
    modal('Keyboard Shortcuts', `<table class="shortcuts-table"><tbody>${rows}</tbody></table>`, { size: 'sm' });
  }

  function initKeyHandling() {
    document.addEventListener('keydown', (e) => {
      if (e.key === '?' && !e.target.matches('input, textarea, [contenteditable]')) {
        e.preventDefault();
        showShortcuts();
        return;
      }
      if (e.key === 'Escape') {
        if (modalStack.length > 0) {
          const top = modalStack[modalStack.length - 1];
        }
      }
    });
  }

  function init() {
    initTheme();
    initReducedMotion();
    initToastContainer();
    initKeyHandling();
  }

  return {
    init,
    toast,
    modal,
    confirm: confirmDialog,
    showShortcuts,
    toggleTheme,
    getTheme,
    isReducedMotion,
    createEl,
    qs,
    qsa,
    SHORTCUTS
  };
})();