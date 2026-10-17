window.CF = window.CF || {};

CF.Storage = (function () {
  'use strict';

  const PREFIX = 'cf.';
  const VERSION = 'cf.v1';
  const SCHEMA_VERSION = 1;

  const COLLECTIONS = [
    'entities', 'edges', 'telegramNodes', 'telegramEdges', 'telegramMessages',
    'telegramForwardChains', 'darkwebMarkets', 'darkwebVendors',
    'darkwebListings', 'darkwebWallets', 'darkwebMirrors', 'darkwebForums',
    'darkwebFlows', 'darkwebTimeline', 'deepwebLayers', 'deepwebNodes',
    'deepwebBreaches', 'deepwebDiscoveries', 'traceChains', 'cases'
  ];

  const defaults = {
    entities: [], edges: [], telegramNodes: [], telegramEdges: [],
    telegramMessages: [], telegramForwardChains: [], darkwebMarkets: [],
    darkwebVendors: [], darkwebListings: [], darkwebWallets: [],
    darkwebMirrors: [], darkwebForums: [], darkwebFlows: [],
    darkwebTimeline: [], deepwebLayers: [], deepwebNodes: [],
    deepwebBreaches: [], deepwebDiscoveries: [], traceChains: [], cases: []
  };

  function exists(collection) {
    return localStorage.getItem(PREFIX + collection) !== null;
  }

  function getAll(collection) {
    try {
      const raw = localStorage.getItem(PREFIX + collection);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch (err) {
      console.warn('Storage.parse error for', collection, err);
      return [];
    }
  }

  function get(collection, id) {
    return getAll(collection).find(item => item.id === id);
  }

  function put(collection, item) {
    if (!item) return null;
    if (!item.id) item.id = generateId(collection);
    const data = getAll(collection);
    const idx = data.findIndex(d => d.id === item.id);
    if (idx >= 0) data[idx] = item;
    else data.push(item);
    try {
      localStorage.setItem(PREFIX + collection, JSON.stringify(data));
    } catch (err) {
      console.warn('Storage.set error for', collection, err);
    }
    return item;
  }

  function remove(collection, id) {
    const data = getAll(collection);
    const idx = data.findIndex(d => d.id === id);
    if (idx < 0) return false;
    data.splice(idx, 1);
    try {
      localStorage.setItem(PREFIX + collection, JSON.stringify(data));
    } catch (err) {
      console.warn('Storage.remove error for', collection, err);
    }
    return true;
  }

  function findByKey(collection, normalizedKey) {
    return getAll(collection).filter(item => {
      const key = (item.key || item.handle || item.email || item.id || '').toLowerCase();
      return key === normalizedKey.toLowerCase();
    });
  }

  function generateId(collection) {
    return collection + '-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  function migrateVersion() {
    const storedVersion = localStorage.getItem(VERSION);
    if (!storedVersion || parseInt(storedVersion, 10) < SCHEMA_VERSION) {
      localStorage.setItem(VERSION, String(SCHEMA_VERSION));
    }
  }

  function seed(collection, data) {
    if (exists(collection)) return;
    localStorage.setItem(PREFIX + collection, JSON.stringify(data || defaults[collection]));
  }

  function seedAll() {
    migrateVersion();
    COLLECTIONS.forEach(col => {
      if (!exists(col)) {
        localStorage.setItem(PREFIX + col, JSON.stringify(defaults[col]));
      }
    });
  }

  function resetCollection(collection) {
    localStorage.removeItem(PREFIX + collection);
  }

  function resetAll() {
    COLLECTIONS.forEach(col => localStorage.removeItem(PREFIX + col));
    localStorage.removeItem(VERSION);
  }

  function exportAll() {
    const data = {};
    COLLECTIONS.forEach(col => { data[col] = getAll(col); });
    data._schemaVersion = SCHEMA_VERSION;
    return JSON.stringify(data, null, 2);
  }

  function importAll(jsonStr) {
    try {
      const obj = JSON.parse(jsonStr);
      COLLECTIONS.forEach(col => {
        if (Array.isArray(obj[col])) {
          localStorage.setItem(PREFIX + col, JSON.stringify(obj[col]));
        }
      });
      if (obj._schemaVersion) {
        localStorage.setItem(VERSION, String(obj._schemaVersion));
      }
      return true;
    } catch (err) {
      console.error('Import failed:', err);
      return false;
    }
  }

  return {
    EXISTS: exists, getAll, get, put, remove, findByKey, generateId,
    seedAll, seed, resetCollection, resetAll, exportAll, importAll,
    SCHEMA_VERSION, COLLECTIONS, migrateVersion
  };
})();
