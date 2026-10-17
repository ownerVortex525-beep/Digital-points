window.CF = window.CF || {};
window.CF.Views = window.CF.Views || {};

(function () {
  'use strict';

  if (!CF.DeepDive) {
    console.error('CF.DeepDive is not loaded');
    return;
  }

  CF.Views.register = function (name, viewModule) {
    CF.Views[name] = viewModule;
  };

  CF.DeepDive.init = function () {
    if (typeof CF.Storage === 'undefined') {
      console.warn('Storage not available, skipping Deep-Dive init');
      return;
    }

    const needReseed = CF.DeepDive.checkVersion ? CF.DeepDive.checkVersion() : false;
    if (needReseed && typeof CF.Data !== 'undefined' && CF.Data.seedAll) {
      CF.Data.seedAll();
      CF.UI.toast('Deep-Dive data initialized', { type: 'info' });
    }

    CF.DeepDive.restoreState();

    if (typeof CF.Views.telegram !== 'undefined') {
      CF.Views.register('telegram', CF.Views.telegram);
    }
    if (typeof CF.Views.darkweb !== 'undefined') {
      CF.Views.register('darkweb', CF.Views.darkweb);
    }
    if (typeof CF.Views.deepweb !== 'undefined') {
      CF.Views.register('deepweb', CF.Views.deepweb);
    }

    const state = CF.DeepDive.getState();
    const tabId = state.currentTab || 'telegram';
    CF.DeepDive.navigate(tabId);
  };

  CF.DeepDive.navigate = (function (originalNavigate) {
    return function (tabId) {
      if (!CF.DeepDive.TABS.find(t => t.id === tabId)) return;

      state.currentTab = tabId;
      saveState();
      bus.emit('tab:changed', tabId);

      const tabEls = document.querySelectorAll('[data-deepdive-tab]');
      tabEls.forEach(el => {
        el.classList.toggle('active', el.getAttribute('data-deepdive-tab') === tabId);
      });

      const panelEls = document.querySelectorAll('.deepdive__panel');
      panelEls.forEach(el => {
        el.classList.toggle('active', el.getAttribute('data-deepdive-panel') === tabId);
      });

      if (CF.Views[tabId] && typeof CF.Views[tabId].mount === 'function') {
        const panel = document.querySelector(`[data-deepdive-panel="${tabId}"]`);
        if (panel && panel.dataset.mounted !== tabId) {
          CF.Views[tabId].mount(panel);
        }
      }

      CF.UI.toast(`Switched to ${CF.DeepDive.TABS.find(t => t.id === tabId)?.label || tabId}`, {
        type: 'info',
        duration: 2000
      });
    };
  })(CF.DeepDive.navigate);

  var state = CF.DeepDive.getState();
  var bus = CF.DeepDive.bus;
  var saveState = CF.DeepDive.saveState;
})();