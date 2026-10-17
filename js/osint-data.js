window.CF = window.CF || {};

CF.Data = (function () {
  'use strict';

  const MODULE_CONFIG = {
    telegram: {
      label: 'Telegram',
      color: '#0088cc',
      icon: 'telegram',
      entityTypes: ['telegram', 'channel', 'bot', 'person', 'phone', 'email', 'wallet', 'pgp', 'document']
    },
    darkweb: {
      label: 'Dark Web',
      color: '#6f42c1',
      icon: 'onion',
      entityTypes: ['portal', 'marketplace', 'document', 'wallet', 'domain', 'pgp', 'ip', 'location']
    },
    deepweb: {
      label: 'Deep Web',
      color: '#17a2b8',
      icon: 'database',
      entityTypes: ['database', 'record', 'document', 'archive', 'ip', 'domain', 'website']
    }
  };

  const ENTITY_TYPES = {
    person: { label: 'Person', color: '#4f46e5', icon: 'person', category: 'identity' },
    phone: { label: 'Phone', color: '#16a34a', icon: 'phone', category: 'identity' },
    email: { label: 'Email', color: '#ca8a04', icon: 'email', category: 'identity' },
    website: { label: 'Website', color: '#0891b2', icon: 'website', category: 'digital' },
    location: { label: 'Location', color: '#c026d3', icon: 'location', category: 'physical' },
    company: { label: 'Company', color: '#6d28d9', icon: 'company', category: 'organization' },
    wallet: { label: 'Wallet', color: '#dc2626', icon: 'wallet', category: 'financial' },
    telegram: { label: 'Telegram', color: '#0088cc', icon: 'telegram', category: 'communication' },
    channel: { label: 'Channel', color: '#006699', icon: 'channel', category: 'communication' },
    bot: { label: 'Bot', color: '#009966', icon: 'bot', category: 'automation' },
    ip: { label: 'IP Address', color: '#f97316', icon: 'ip', category: 'network' },
    domain: { label: 'Domain', color: '#0ea5e9', icon: 'domain', category: 'network' },
    pgp: { label: 'PGP Key', color: '#a855f7', icon: 'pgp', category: 'security' },
    document: { label: 'Document', color: '#fbbf24', icon: 'document', category: 'evidence' },
    image: { label: 'Image', color: '#be123c', icon: 'image', category: 'evidence' },
    portal: { label: 'Portal', color: '#ef4444', icon: 'portal', category: 'darkweb' },
    marketplace: { label: 'Marketplace', color: '#fb923c', icon: 'marketplace', category: 'darkweb' },
    database: { label: 'Database', color: '#3498db', icon: 'database', category: 'deepweb' },
    record: { label: 'Record', color: '#f39c12', icon: 'record', category: 'deepweb' },
    archive: { label: 'Archive', color: '#6c757d', icon: 'archive', category: 'deepweb' }
  };

  const SEED_GRAPH = {
    nodes: [
      { id: 'n1', label: 'Alice Chen', entityType: 'person', x: -200, y: -100 },
      { id: 'n2', label: 'alice@darknet.chat', entityType: 'email', x: -100, y: -50 },
      { id: 'n3', label: '+1-555-0100', entityType: 'phone', x: 0, y: -100 },
      { id: 'n4', label: 'CryptoWallet #A4F2', entityType: 'wallet', x: 100, y: -50 },
      { id: 'n5', label: 't.me/securechannel', entityType: 'telegram', x: 200, y: -100 },
      { id: 'n6', label: 'DarkMarket Portal', entityType: 'portal', x: 300, y: 0 },
      { id: 'n7', label: 'market.onion', entityType: 'domain', x: 400, y: 100 },
      { id: 'n8', label: '185.132.189.10', entityType: 'ip', x: 300, y: 200 },
      { id: 'n9', label: 'PGP Key #9F2B', entityType: 'pgp', x: 100, y: 150 },
      { id: 'n10', label: 'Company X', entityType: 'company', x: -200, y: 100 }
    ],
    edges: [
      { from: 'n1', to: 'n2', label: 'owns' },
      { from: 'n1', to: 'n3', label: 'owns' },
      { from: 'n3', to: 'n4', label: 'payment' },
      { from: 'n4', to: 'n6', label: 'used_at' },
      { from: 'n5', to: 'n6', label: 'linked' },
      { from: 'n6', to: 'n7', label: 'hosted_on' },
      { from: 'n7', to: 'n8', label: 'resolves_to' },
      { from: 'n1', to: 'n9', label: 'pgp_key' },
      { from: 'n1', to: 'n10', label: 'works_at' },
      { from: 'n10', to: 'n6', label: 'vendor' }
    ]
  };

  const EDGE_TYPES = {
    owns: { label: 'Owns', color: '#0088cc' },
    payment: { label: 'Payment', color: '#28a745' },
    linked: { label: 'Linked', color: '#6f42c1' },
    connected: { label: 'Connected', color: '#17a2b8' },
    used_at: { label: 'Used At', color: '#fd7e14' },
    resolves_to: { label: 'Resolves To', color: '#0891b2' },
    hosted_on: { label: 'Hosted On', color: '#dc3545' },
    vendor: { label: 'Vendor', color: '#6d28d9' },
    works_at: { label: 'Works At', color: '#17a2b8' },
    pgp_key: { label: 'PGP Key', color: '#a855f7' }
  };

  function seedAll() {
    if (!localStorage.getItem('CFSettings')) {
      localStorage.setItem('CFSettings', JSON.stringify({
        version: 1,
        createdAt: new Date().toISOString()
      }));
    }

    if (!localStorage.getItem('CFGraph')) {
      localStorage.setItem('CFGraph', JSON.stringify(SEED_GRAPH));
    }

    if (!localStorage.getItem('CFEdges')) {
      localStorage.setItem('CFEdges', JSON.stringify(EDGE_TYPES));
    }
  }

  function getModuleConfig(moduleName) {
    return MODULE_CONFIG[moduleName] || MODULE_CONFIG.telegram;
  }

  function getEntityType(type) {
    return ENTITY_TYPES[type] || { label: type, color: '#6c757d', icon: 'help' };
  }

  function getEdgeType(type) {
    return EDGE_TYPES[type] || { label: type, color: '#6c757d' };
  }

  function getAllEntityTypes() {
    return ENTITY_TYPES;
  }

  function getModuleEntityTypes(moduleName) {
    const config = MODULE_CONFIG[moduleName] || MODULE_CONFIG.telegram;
    return config.entityTypes.map(t => ENTITY_TYPES[t]).filter(Boolean);
  }

  return {
    seedAll,
    getModuleConfig,
    getEntityType,
    getEdgeType,
    getAllEntityTypes,
    getModuleEntityTypes,
    SEED_GRAPH,
    ENTITY_TYPES,
    EDGE_TYPES,
    MODULE_CONFIG
  };
})();