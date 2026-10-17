window.CF = window.CF || {};

CF.Icons = (function () {
  'use strict';

  const svgIcons = {
    person: '<circle cx="12" cy="7" r="4"/><path d="M6 20C6 17.79 8.24 16 11 16H13C15.76 16 18 17.79 18 20"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    email: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    website: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20"/>',
    location: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    company: '<path d="M16 20V4a2 2 0 0 0-2-2H10a2 2 0 0 0-2 2v16"/><rect x="2" y="14" width="20" height="6" rx="2"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
    wallet: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h12v8H6z"/><circle cx="14" cy="12" r="1.5"/>',
    telegram: '<path d="M14.5 2.5L1.5 7.5L15 12.5L14.5 2.5Z"/>',
    channel: '<path d="M4 6h16v2H4V6z"/><path d="M4 12h16v2H4v-2z"/>',
    bot: '<circle cx="9" cy="9" r="4"/><circle cx="15" cy="9" r="4"/><path d="M12 13c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm-7 4v2h10v-2"/>',
    ip: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a10 10 0 0 1 8 4.2 10 10 0 0 1-16 0 10 10 0 0 1 8-4.2z"/>',
    domain: '<path d="M12 2L2 7v10c0 5.5 3.8 9 9 12s9-6.5 9-12V7l-10-5z"/>',
    pgp: '<rect x="4" y="4" width="16" height="16" rx="2"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="12" y2="12"/>',
    document: '<path d="M6 2h14l6 6v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8l6-6V2z"/><path d="M14 2v6h-4V2h4z"/>',
    portal: '<circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/>',
    marketplace: '<rect x="3" y="5" width="18" height="14" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/>',
    record: '<rect x="4" y="6" width="16" height="12" rx="1"/><line x1="4" y1="10" x2="20" y2="10"/>',
    archive: '<rect x="4" y="6" width="16" height="12" rx="1"/><path d="M9 10h6v2H9z"/>',
    database: '<ellipse cx="12" cy="6" rx="6" ry="3"/><path d="M18 6v12c0 .6-.4 1-1 1H7c-.6 0-1-.4-1-1V6c0-.6.4-1 1-1h10c.6 0 1 .4 1 1z"/>',

    search: '<circle cx="11" cy="11" r="6"/><line x1="16.6" y1="16.6" x2="21" y2="21"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
    'export-json': '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>',
    'export-png': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
    import: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    center: '<path d="M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h6v6h-6z"/>',
    delete: '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>',
    help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    close: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    remove: '<line x1="18" y1="6" x2="6" y2="18"/>',
    layers: '<path d="M12 2L2 7v10c0 5.5 3.8 9 9 12s9-6.5 9-12V7l-10-5z"/>',
    onion: '<circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="3"/>',
    chain: '<circle cx="8" cy="8" r="4"/><circle cx="16" cy="16" r="4"/><path d="M12 8L16 12M12 8L8 12M12 8v4M12 12l4 4M12 12l-4 4"/>'
  };

  function buildSVG(name, opts) {
    opts = opts || {};
    var size = opts.size || 24;
    var color = opts.color || 'currentColor';
    var path = svgIcons[name] || svgIcons['help'];
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="' + color + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + path + '</svg>';
  }

  function getSVG(name, opts) {
    opts = opts || {};
    var size = opts.size || 24;
    var color = opts.color || 'currentColor';
    var path = svgIcons[name] || svgIcons['help'];
    var fillColor = opts.fill || 'none';

    if (fillColor === 'currentColor') {
      return '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="' + color + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + path + '</svg>';
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="' + fillColor + '" stroke="' + color + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + path + '</svg>';
  }

  function get(name, opts) {
    return getSVG(name, opts);
  }

  return { get: get, getSVG: getSVG };
})();