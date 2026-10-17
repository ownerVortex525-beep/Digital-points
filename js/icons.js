window.CF = window.CF || {};

CF.Icons = (function () {
  'use strict';

  const svgIcons = {
    'person': '<circle cx="12" cy="7" r="4"/><path d="M6 20C6 17.79 8.24 16 11 16H13C15.76 16 18 17.79 18 20"/>',
    'phone': '<path d="M22 16.92V18C22 19.1 21.1 20 20 20H19.5C17.84 20 16.28 19.34 15.17 18.22L14.11 17.17C13.83 16.89 13.42 16.73 13 16.73C12.58 16.73 12.17 16.89 11.89 17.17L9.95 19.11C8.11 20.95 5.22 20.95 3.38 19.11L2.17 17.9C1.42 17.15 1 16.13 1 15V13C1 11.62 1.62 10.4 2.67 9.5C3.73 8.59 4.96 8 6.26 7.93L10.21 8.22C10.38 7.61 10.82 7.06 11.41 6.75L14.83 5.05C16.12 4.47 17.63 4.63 18.69 5.69L20.31 7.31C21.36 8.36 21.99 9.85 22 11.26V13C22 14.31 21.36 15.8 20.31 17.31Z" fill="currentColor"/>',
    'email': '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    'website': '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20"/>',
    'location': '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    'company': '<path d="M16 20V4a2 2 0 0 0-2-2H10a2 2 0 0 0-2 2v16"/><rect x="2" y="14" width="20" height="6" rx="2"/>',
    'image': '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></rect></svg>'.replace('</rect></svg>', ''),
    'wallet': '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h12v8H6z"/><circle cx="14" cy="12" r="1.5"/>',
    'telegram': '<path d="M14.5 2.5L1.5 7.5L15 12.5L14.5 2.5Z"/>',
    'channel': '<path d="M4 6H20V8H4V6Z"/><path d="M4 12H20V14H4V12Z"/>',
    'bot': '<circle cx="9" cy="9" r="4"/><circle cx="15" cy="9" r="4"/><path d="M12 13C10.9 13 10 12.1 10 11C10 9.9 10.9 9 12 9C13.1 9 14 9.9 14 11C14 12.1 13.1 13 12 13Z"/><path d="M7 17C7 15.9 7.9 15 9 15H15C16.1 15 17 15.9 17 17V19H7V17Z"/>',
    'ip': '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a10 10 0 0 1 8 4.2M12 2a10 10 0 0 0-8 4.2M4.2 20a10 10 0 0 1 16 0"/><path d="M8 8h1l3 6h4l3-6h1"/>',
    'domain': '<path d="M12 2L2 7v10c0 5.5 3.8 9 9 12s9-6.5 9-12V7l-10-5z"/>',
    'pgp': '<rect x="4" y="4" width="16" height="16" rx="2"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="12" y2="12"/>',
    'document': '<path d="M6 2H14L18 6V20C18 21.1 17.1 22 16 22H8C6.9 22 6 21.1 6 20V2Z"/><path d="M14 2L14 6C14 6.6 14.4 7 15 7H18"/>',
    'portal': '<circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor"/>',
'search': '<circle cx="11" cy="11" r="6"/><line x1="16.6" y1="16.6" x2="21" y2="21"/>',
    'menu': '<path d="M3 6H21M3 12H21M3 18H21"/>',
    'download': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
    'export-json': '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>',
    'export-png': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
    'save': '<path d="M19 14v4a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-4"/><polyline points="12 12 12 19"/><path d="M15 8l-3 3-3-3"/>',
    'import': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    'center': '<path d="M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h6v6h-6z"/>',
    'delete': '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>',
    'help': '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    'close': '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    'remove': '<line x1="18" y1="6" x2="6" y2="18"/>',
    'chevron-up': '<line x1="12" y1="19" x2="12" y2="5"/><path d="M5 12l7-7 7 7"/>',
    'chevron-down': '<line x1="12" y1="5" x2="12" y2="19"/><path d="M19 12l-7 7-7-7"/>',
    'layers': '<path d="M12 2L2 7v10c0 5.5 3.8 9 9 12s9-6.5 9-12V7l-10-5z"/>',
    'depth': '<path d="M12 2L2 7v10c0 5.5 3.8 9 9 12s9-6.5 9-12V7l-10-5z"/>',
    'onion': '<circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="3"/>',
    'database': '<ellipse cx="12" cy="6" rx="6" ry="3"/><path d="M18 6V18C18 18.6 17.6 19 17 19H7C6.4 19 6 18.6 6 18V6"/><path d="M6 6L12 3L18 6"/>',
    'chain': '<circle cx="8" cy="8" r="4"/><circle cx="16" cy="16" r="4"/><path d="M12 8L16 12M12 8L8 12M12 8V4M12 12L16 16M12 12L8 16M12 12V16"/>',
    'marketplace': '<rect x="3" y="5" width="18" height="14" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/>',
    'record': '<rect x="4" y="6" width="16" height="12" rx="1"/><line x1="4" y1="10" x2="20" y2="10"/>'
  };

  function getSVG(name, opts) {
    opts = opts || {};
    var size = opts.size || 24;
    var path = svgIcons[name] || svgIcons['help'];
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="' + path + '"/></svg>'.replace('<path d="', '<g>').replace('"/></svg>', '</g></svg>');
  }

  function get(name, opts) {
    return getSVG(name, opts);
  }

  function getSVG(name, opts) {
    opts = opts || {};
    var size = opts.size || 24;
    var color = opts.color || 'currentColor';
    var path = svgIcons[name] || svgIcons['help'];
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="' + color + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + path + '</svg>';
  }

  return { get, getSVG };
})();