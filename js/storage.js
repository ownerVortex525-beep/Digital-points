window.CF = window.CF || {};

CF.Storage = (function () {
  'use strict';

  const KEYS = {
    GRAPH: 'CFGraph',
    THEME: 'CFTheme',
    SETTINGS: 'CFSettings'
  };

  function seedAll() {
    if (!localStorage.getItem(KEYS.THEME)) {
      localStorage.setItem(KEYS.THEME, 'night');
    }
    if (!localStorage.getItem(KEYS.SETTINGS)) {
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify({
        autoSave: true,
        showGrid: true,
        animateTransitions: true
      }));
    }
  }

  function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function load(key, defaultValue) {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : (defaultValue || null);
    } catch (e) {
      console.error('Failed to parse storage key:', key, e);
      return defaultValue || null;
    }
  }

  function remove(key) {
    localStorage.removeItem(key);
  }

  function resetAll() {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  }

  function getTheme() {
    return localStorage.getItem(KEYS.THEME) || 'auto';
  }

  function setTheme(theme) {
    localStorage.setItem(KEYS.THEME, theme);
    document.documentElement.setAttribute('data-theme', theme);
    applyTheme(theme);
  }

  function applyTheme(themeName) {
    let theme = themeName;
    if (themeName === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      theme = prefersDark ? 'night' : 'day';
    }
    document.documentElement.setAttribute('data-theme', theme);

    const themeBtn = document.querySelector('#theme-switcher button[data-theme].active');
    if (themeBtn) themeBtn.classList.remove('active');
    const activeBtn = document.querySelector('#theme-switcher button[data-theme="' + themeName + '"]');
    if (activeBtn) activeBtn.classList.add('active');
  }

  function getSettings() {
    return load(KEYS.SETTINGS, {
      autoSave: true,
      showGrid: true,
      animateTransitions: true
    });
  }

  function setSettings(settings) {
    save(KEYS.SETTINGS, settings);
  }

  return {
    KEYS,
    seedAll,
    save,
    load,
    remove,
    resetAll,
    getTheme,
    setTheme,
    applyTheme,
    getSettings,
    setSettings
  };
})();