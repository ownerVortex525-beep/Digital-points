window.CF = window.CF || {};
window.CF.App = (function () {
  'use strict';

  let initialized = false;

  function init() {
    if (initialized) return;
    initialized = true;

    CF.Storage.seedAll();

    const versionKey = 'cf.dd.v';
    const storedVersion = localStorage.getItem(versionKey);
    if (!storedVersion || parseInt(storedVersion, 10) < 1) {
      if (CF.Data && typeof CF.Data.seedAll === 'function') {
        CF.Data.seedAll();
        CF.UI.toast('Deep-Dive data initialized', { type: 'info' });
      }
    }

    if (typeof CF.DeepDive.init === 'function') {
      CF.DeepDive.init();
    }

    if (typeof CF.TraceChain.init === 'function') {
      CF.TraceChain.init();
    }

    initNavigation();
    initReset();
    updateStatus('System ready');
  }

  function initNavigation() {
    const navItems = document.querySelectorAll('[data-nav]');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const target = item.getAttribute('data-nav');
        const section = document.querySelector(`.panel[data-panel="${target}"]`);
        if (section) {
          document.querySelectorAll('.panel').forEach(p => p.classList.remove('panel--active'));
          section.classList.add('panel--active');
          navItems.forEach(n => n.classList.remove('sidebar__nav-item--active'));
          item.classList.add('sidebar__nav-item--active');
          updateStatus(`Navigated to ${target}`);
        }
      });
    });

    const tabButtons = document.querySelectorAll('[data-deepdive-tab]');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-deepdive-tab');
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const panels = document.querySelectorAll('.deepdive__panel');
        panels.forEach(p => p.classList.remove('active'));
        const targetPanel = document.querySelector(`[data-deepdive-panel="${tabId}"]`);
        if (targetPanel) targetPanel.classList.add('active');

        if (CF.DeepDive && typeof CF.DeepDive.navigate === 'function') {
          CF.DeepDive.navigate(tabId);
        }

        updateStatus(`Switched to ${tabId} tab`);
      });
    });

    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        CF.UI.toggleTheme();
        updateStatus('Theme toggled');
      });
    }

    const sidebarBtn = document.getElementById('sidebar-toggle');
    if (sidebarBtn) {
      sidebarBtn.addEventListener('click', () => {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
          sidebar.classList.toggle('hidden');
        }
      });
    }
  }

  function initReset() {
    const resetBtn = document.getElementById('reset-data');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        CF.UI.confirm('Reset all simulated data? This cannot be undone.', {
          buttons: [
            { label: 'Reset', variant: 'danger', onClick: () => {
              CF.Storage.resetAll();
              CF.Storage.seedAll();
              if (CF.Data && typeof CF.Data.seedAll === 'function') {
                CF.Data.seedAll();
              }
              window.location.reload();
            }},
            { label: 'Cancel', variant: 'ghost' }
          ]
        });
      });
    }
  }

  function updateStatus(message) {
    const statusEl = document.getElementById('status-text');
    if (statusEl) {
      statusEl.textContent = message;
    }
  }

  return {
    init
  };
})();
