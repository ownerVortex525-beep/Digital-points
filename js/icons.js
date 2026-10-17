window.CF = window.CF || {};

CF.Icons = (function () {
  'use strict';

  const ICON_SET = [
    'telegram', 'onion', 'tor', 'wallet', 'mixer', 'exchange', 'market',
    'vendor', 'listing', 'drugs', 'weapons', 'data', 'forged-docs', 'cards',
    'accounts', 'database', 'document', 'lock', 'leak', 'iot-camera', 'archive',
    'sonar', 'depth', 'ping', 'chain', 'hop', 'mirror', 'forum', 'pgp',
    'trust', 'seized', 'flagged', 'megaphone', 'people', 'person', 'crown',
    'robot', 'link', 'email', 'phone', 'alert', 'search', 'copy', 'send',
    'add', 'remove', 'expand', 'collapse', 'layers', 'breach', 'record',
    'portal', 'device', 'bubble', 'forward', 'invite', 'member', 'payment',
    'menu', 'close', 'settings', 'download', 'upload', 'save', 'export-png',
    'export-json', 'delete', 'rename', 'duplicate', 'confirm', 'warning',
    'info', 'question', 'help', 'refresh', 'sync', 'check', 'star', 'badge',
    'trace', 'identity', 'eye', 'map', 'list-view', 'grid-view', 'timeline',
    'matrix', 'bot', 'co-membership', 'sankey', 'constellation', 'radar',
    'terminal', 'ethics', 'sim', 'day', 'night', 'sun', 'moon', 'contrast',
    'keyboard', 'skip', 'reset', 'filter', 'sort', 'count', 'gauge',
    'bar-chart', 'radial', 'confidence', 'cross', 'arrow', 'arrow-right',
    'arrow-down', 'plus', 'minus', 'pin', 'tag', 'tags', 'file', 'files',
    'cloud', 'server', 'shield', 'activity', 'clock', 'calendar', 'users',
    'user-check', 'user-x', 'external', 'internal', 'split', 'merge',
    'zoom-in', 'zoom-out', 'fit', 'fullscreen', 'volume', 'volume-x',
    'play', 'pause', 'skip-back', 'skip-forward', 'more-vertical',
    'more-horizontal', 'chevron-left', 'chevron-right', 'chevron-down',
    'chevron-up', 'corner-down-left', 'send-to-graph'
  ];

  const FALLBACKS = {
    telegram: '<path d="M14.5 2.5L1.5 7.5L15 12.5L14.5 2.5Z" fill="currentColor"/>',
    onion: '<circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 2A6 6 0 0114 8A6 6 0 018 14A6 6 0 012 8A6 6 0 018 2Z" fill="none" stroke="currentColor" stroke-width="1"/><circle cx="8" cy="8" r="2" fill="currentColor"/>',
    tor: '<circle cx="8" cy="8" r="5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 3V3C8 3 13 5 13 8C13 11 8 13 8 13C8 13 3 11 3 8C3 5 8 3 8 3Z" fill="none" stroke="currentColor" stroke-width="1.5"/>',
    wallet: '<path d="M18 4H6C4.9 4 4 4.9 4 6V8H2V6C4 4 6.1 4 6 4H18C19.1 4 20 4.9 20 6V8H18V6C18 5.5 17.5 5 18 4Z"/><path d="M20 12H6C4.9 12 4 12.9 4 14V18C4 19.1 4.9 20 6 20H18C19.1 20 20 19.1 20 18V14C20 12.9 19.1 12 20 12Z"/><circle cx="14" cy="16" r="1"/>',
    market: '<rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" stroke-width="1"/><circle cx="8" cy="6" r="1.5"/><circle cx="12" cy="6" r="1.5"/><circle cx="16" cy="6" r="1.5"/>',
    vendor: '<circle cx="12" cy="8" r="4"/><path d="M4 20C4 17.79 6.24 16 9 16H15C17.76 16 20 17.79 20 20"/><path d="M9 2L11 6H13L12 2"/><path d="M6 10L8 14H6"/><path d="M18 10L16 14H18"/>',
    listing: '<rect x="4" y="4" width="16" height="16" rx="1"/><line x1="4" y1="9" x2="20" y2="9"/><line x1="8" y1="13" x2="8.01" y2="13"/><line x1="12" y1="13" x2="12.01" y2="13"/><line x1="16" y1="13" x2="16.01" y2="13"/>',
    database: '<ellipse cx="12" cy="6" rx="6" ry="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M18 6V18C18 18.6 17.6 19 17 19H7C6.4 19 6 18.6 6 18V6"/><path d="M6 6L12 3L18 6"/><path d="M6 9L12 12L18 9"/>',
    document: '<path d="M6 2H18L18 20L6 20L6 2Z"/><path d="M6 2L6 20"/><path d="M9 6L9 18"/><path d="M12 6L12 18"/><path d="M15 6L15 18"/>',
    lock: '<rect x="5" y="8" width="14" height="10" rx="2"/><path d="M8 8V6C8 4.9 8.9 4 10 4C11.1 4 12 4.9 12 6V8"/><circle cx="12" cy="13" r="1.5"/>',
    leak: '<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 4V12L16 16"/><path d="M8 8L12 12L16 8"/>',
    'iot-camera': '<rect x="4" y="6" width="16" height="12" rx="2"/><circle cx="12" cy="11" r="3"/><path d="M8 7L9 5H15L16 7"/><path d="M3 11L1 13V17H21V13L19 11"/>',
    archive: '<path d="M4 6H20V8H4V6Z"/><path d="M6 10H18V20H6V10Z"/><path d="M9 4H15L18 6V10H6V6L9 4Z"/>',
    sonar: '<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="1"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1"/><circle cx="12" cy="12" r="1" fill="currentColor"/><path d="M12 4L12 8"/><path d="M12 16L12 20"/><path d="M4 12L8 12"/><path d="M16 12L20 12"/>',
    depth: '<path d="M4 4L4 20L20 20L20 4Z"/><path d="M8 8L8 16"/><path d="M12 8L12 16"/><path d="M16 8L16 16"/>',
    ping: '<circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="2" fill="currentColor"/><path d="M12 4L12 12M12 12L16 12"/>',
    chain: '<path d="M5 12L12 5L19 12L12 19L5 12Z"/><path d="M9 9L12 12L15 9"/><circle cx="12" cy="12" r="1"/>',
    mirror: '<path d="M4 6L20 6L20 8L4 8Z"/><path d="M4 12L20 12L20 14L4 14Z"/><path d="M4 18L20 18L20 20L4 20Z"/>',
    forum: '<path d="M4 6H20V8H4Z"/><path d="M4 12H20V14H4Z"/><path d="M6 18H18L18 20H6Z"/>',
    pgp: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8L8 12"/><path d="M12 8L12 12"/><path d="M8 16L12 16"/>',
    trust: '<path d="M12 2L15 9H20L13 13L16 20L12 16L8 20L11 13L4 9H9Z"/>',
    seized: '<path d="M4 6L20 6L20 8L4 8Z"/><path d="M6 10L10 18H14L18 10H18L14 4H10L6 10H6Z"/><circle cx="12" cy="12" r="1"/>',
    flagged: '<path d="M12 2L14 8H20L15 12L17 18L12 15L7 18L9 12L4 8L10 8Z"/>',
    megaphone: '<path d="M11 5L15 12L11 19V14H4V10H11V5Z"/><path d="M15 12L20 9V15L15 12Z"/>',
    people: '<circle cx="10" cy="9" r="3"/><path d="M2 20C2 17 5 15 9 15C13 15 16 17 16 20"/><circle cx="18" cy="9" r="3"/><path d="M22 20C22 17 19 15 19 15C20 15 20 16 20 16"/>',
    person: '<circle cx="12" cy="8" r="4"/><path d="M6 20C6 17.79 8.24 16 11 16H13C15.76 16 18 17.79 18 20H6Z"/>',
    crown: '<path d="M5 15L7 11L9 15H5Z"/><path d="M7 11L9 9L11 11H7Z"/><path d="M9 9L11 7L13 9H9Z"/><path d="M11 7L13 5L15 9H11Z"/><path d="M15 9L13 11L15 15L13 11Z"/><path d="M5 18H19L15 14L13 16L11 14L9 16L5 18Z"/>',
    robot: '<circle cx="9" cy="9" r="4"/><circle cx="15" cy="9" r="4"/><path d="M6 15C6 15 8 18 12 18C16 18 18 15 18 15V5H6V15Z"/>',
    link: '<path d="M10 14L14 10M14 10L10 10M14 10V14M14 10H18M10 6L14 6M14 6V10M14 6L10 10M14 6L10 10L10 10M10 6L10 10"/>',
    email: '<path d="M4 6H20V8L12 12L4 8V6Z"/><path d="M4 8V18H20V8"/><path d="M8 12L12 15L16 12"/>',
    phone: '<path d="M20 15.5C19 14.5 17.5 13 16 12C15 11.5 14 11.5 13 12V10C14.5 9.5 16 8.5 17 7.5C16 6.5 15 5.5 14 4.5C14.5 3.5 15.5 2.5 17 2C17.5 1.5 18 1 18 0.5C18 0.2 17.8 0 17.5 0C16.8 0 16.2 0.5 16 1C14.2 2.5 14 4 14 5.5C14 6.5 15 7.5 16 8C17.5 8 18.5 7.5 20 6C20.5 5.5 21 5 21 4.5C21 4 20.8 3.5 20.5 3C20.2 2.8 20 2.5 20 2C20 1.5 19.5 1 19 1C18.5 0.7 18 0.5 18 0.2C18 0 18.5 0 19 0.5C18 0.5 17.5 1 17 2C15.5 3.2 14 5 14 6.5C14 7.8 15 9 16 10C17.8 10.5 19.5 10 20 9C20.5 8.5 21 8 21 7.5C21 7.2 20.8 7 20.5 6.8C20.2 6.5 20 6 20 5.5V5.5C20 6 20 6.5 20 7C20 7.5 20 8 20 8.5V9C20 10 19.3 10.8 18.5 11.2C17.7 11.7 17 12 16 12.5C15 13 14.3 13.2 13 13C12 13.5 11.2 14 10 14C9 14 8 14 7 14C6 14 5 14 4 14C4.8 15 5.3 15.8 6 16C6.7 16.2 7.3 16.5 8 16.5C9 16.5 10 16 11 15.5C12 15 13 14.5 14 14Z"/>',
    alert: '<path d="M1 16H23L12 2L1 16Z"/><path d="M12 12V12"/><path d="M12 16L12 16L12 16"/>',
    warning: '<path d="M10.29 3.86L1 20H23L13.71 3.86C13 2.79 11.31 2.79 10.29 3.86Z"/><line x1="12" y1="9" x2="12" y2="13"/><circle cx="12" cy="17" r="1"/>',
    info: '<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
    search: '<circle cx="11" cy="11" r="6" fill="none" stroke="currentColor" stroke-width="2"/><line x1="16.6" y1="16.6" x2="21" y2="21"/>',
    copy: '<path d="M19 1H9C8.4 1 8 1.4 8 2V7H9C9 5.9 9.9 5 11 5H17V2C17 1.4 16.6 1 16 1H15V6H15.5C15.7 6 15.9 6.1 16 6.4L16 16C16 16.6 15.6 17 15 17H10L9.3 11H6L5.5 6H2V2C2 1.4 2.4 1 3 1H4V6H4.5C4.7 6 4.9 6.1 5 6.4L5 19C5 19.6 5.4 20 6 20H16L17 9L16 1V2Z"/>',
    send: '<path d="M22 2L11 13"><path d="M22 2L11 13"/><path d="M2 7L11 13L15 3L2 7Z"/><path d="M11 13L2 22L7 7L11 13Z"/>',
    add: '<path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    remove: '<path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    expand: '<path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2"/>',
    collapse: '<path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2"/>',
    layers: '<path d="M12 2L2 7V17L12 22L22 17V7L12 2Z"/><path d="M12 22V12"/><path d="M2 7L12 12L22 7"/>',
    breach: '<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 12L11 15L16 9"/><path d="M2 12L7 12M17 12L22 12"/>',
    record: '<rect x="4" y="6" width="16" height="12" rx="1"/><line x1="4" y1="10" x2="20" y2="10"/><line x1="8" y1="14" x2="8.01" y2="14"/>',
    portal: '<circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 6L12 18M6 12L18 12M9 9L12 12L15 15"/>',
    device: '<path d="M4 6H20V8H4Z"/><rect x="6" y="10" width="12" height="8" rx="1"/><circle cx="9" cy="15" r="1"/><circle cx="15" cy="15" r="1"/>',
    bubble: '<circle cx="12" cy="12" r="8" fill="currentColor" fill-opacity="0.2"/><circle cx="12" cy="12" r="4"/>',
    forward: '<path d="M5 12L19 12L14 7M19 12L14 17" stroke="currentColor" stroke-width="2" fill="none"/>',
    invite: '<path d="M12 5L19 12L12 19V13L7 12L12 11V5Z" fill="currentColor"/>',
    member: '<path d="M12 12C14.76 12 17 9.76 17 7C17 4.24 14.76 2 12 2C9.24 2 7 4.24 7 7C7 9.76 9.24 12 12 12Z"/><path d="M12 14C8.13 14 5 17.13 5 21H19C19 17.13 15.87 14 12 14Z"/>',
    payment: '<path d="M20 6H4V8L8 12L4 16V18H20V16L16 12L20 8V6Z"/><circle cx="12" cy="10" r="2"/>',
    menu: '<path d="M3 6H21M3 12H21M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    close: '<path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    settings: '<circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 1L12 5M12 19L12 23M4.27 4.27L7.05 7.05M16.95 16.95L19.73 19.73M1 12L5 12M19 12L23 12M4.27 19.73L7.05 16.95M16.95 7.05L19.73 4.27"/>',
    download: '<path d="M12 2L12 14M12 2L8 6M12 2L16 6" stroke="currentColor" stroke-width="2" fill="none"/><path d="M4 20H20V16H4V20Z"/>',
    upload: '<path d="M12 22L12 8M12 22L8 16M12 22L16 16" stroke="currentColor" stroke-width="2" fill="none"/><path d="M4 4H20V8H4V4Z"/>',
    save: '<path d="M6 6H18V8H6V6Z"/><path d="M9 10H15V14H9V10Z"/><path d="M4 18H20V20H4V18Z"/>',
    'export-png': '<path d="M4 4H20V6H4V4Z"/><path d="M6 8H18V16H6V8Z"/><path d="M9 12L12 15L15 12" stroke="currentColor" stroke-width="2" fill="none"/>',
    'export-json': '<path d="M4 4H20V6H4V4Z"/><path d="M6 8H18V16H6V8Z"/><path d="M9 12H15V12"/><circle cx="12" cy="14" r="1"/>',
    delete: '<path d="M6 6L18 18M18 6L6 18" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="16" r="4" fill="none" stroke="currentColor"/>',
    rename: '<path d="M8 12L2 18V22H6L12 16M12 16L9 13L16 6L18 8L11 15L12 16ZM12 16L9 13M16 6L18 8M16 6L13 9M16 6L18 8"/>',
    duplicate: '<path d="M9 9H9C8.5 9 8 9.5 8 10V15C8 15.5 8.5 16 9 16H14C14.5 16 15 15.5 15 15V15"/><path d="M15 15L15 9C15 8.5 14.5 8 14 8H10L15 13"/><path d="M15 8V4C15 3.5 14.5 3 14 3H10C9.5 3 9 3.5 9 4V8"/>',
    confirm: '<path d="M9 16.17L4.83 12L9 9.83L13.17 14L20.17 6.83L21 8.5L13.17 16.17Z" fill="currentColor"/>',
    question: '<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
    help: '<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
    refresh: '<path d="M4 12C4 9.79 5.79 8 8 8C10.21 8 12 9.79 12 12C12 14.21 10.21 16 8 16C5.79 16 4 14.21 4 12Z"/><path d="M12 4V8M12 4L10 6M12 4L14 6"/>',
    sync: '<path d="M4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20C7.58 20 4 16.42 4 12M6 12C6 15.31 8.69 20 12 20C15.31 20 18 17.31 18 14C18 10.69 15.31 8 12 8M8 12C8 9.79 9.79 8 12 8C14.21 8 16 9.79 16 12"/>',
    check: '<path d="M9 16.17L4.83 12L9 9.83L13.17 14L20.17 6.83L21 8.5L13.17 16.17Z" fill="currentColor"/>',
    star: '<path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21L12 17.77L5.82 21L7 14.14L2 9.27L8.91 8.26L12 2Z"/>',
    badge: '<path d="M12 2L14 8H20L15 12L17 18L12 15L7 18L9 12L4 8L10 8L12 2Z"/>',
    trace: '<path d="M17 13C16.5 13 16 13.5 16 14C16 14.5 16.5 15 17 15C17.5 15 18 14.5 18 14C18 13.5 17.5 13 17 13M17 8C16.5 8 16 8.5 16 9C16 9.5 16.5 10 17 10C17.5 10 18 9.5 18 9C18 8.5 17.5 8 17 8M17 3C16.5 3 16 3.5 16 4C16 4.5 16.5 5 17 5C17.5 5 18 4.5 18 4C18 3.5 17.5 3 17 3Z"/><path d="M17 13L13 13V9L17 7V3"/><line x1="9" y1="13" x2="3" y2="13"/>',
    identity: '<circle cx="12" cy="8" r="4"/><path d="M6 20C6 17.79 8.24 16 11 16H13C15.76 16 18 17.79 18 20"/><line x1="12" y1="12" x2="16" y2="16"/><line x1="12" y1="12" x2="8" y2="16"/>',
    eye: '<path d="M1 12S9 2 12 2S23 12 23 12S15 22 12 22S1 12 1 12Z"/><circle cx="12" cy="12" r="3"/>',
    map: '<path d="M4 4L12 2L20 4V12L12 22L4 12V4Z"/><path d="M8 8L12 10L16 8"/><path d="M12 10L12 14"/>',
    'list-view': '<path d="M4 7H20M4 12H20M4 17H20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    'grid-view': '<path d="M4 4H10V10H4V4Z"/><path d="14 4H20V10H14V4Z"/><path d="4 14H10V20H4V14Z"/><path d="14 14H20V20H14V14Z"/>',
    timeline: '<path d="M12 2V22M6 6H18M6 6V2M18 6V2M6 18H18M6 18V14M18 18V14M6 14L9 11M18 14L15 11"/>',
    matrix: '<path d="M4 4H20V6H4V4Z"/><path d="M4 10H20V12H4V10Z"/><path d="M4 16H20V18H4V16Z"/>',
    bot: '<circle cx="9" cy="9" r="4"/><circle cx="15" cy="9" r="4"/><path d="M12 13C10.9 13 10 12.1 10 11C10 9.9 10.9 9 12 9C13.1 9 14 9.9 14 11C14 12.1 13.1 13 12 13Z"/><path d="M6 17L6 13"/><path d="M18 17L18 13"/>',
    'co-membership': '<circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><circle cx="12" cy="14" r="3"/><path d="M8 8L12 14M16 8L12 14"/>',
    sankey: '<path d="M5 18H10V10H15V18H20L12 4L4 10V18Z"/><path d="M5 18L12 4M12 4L20 18"/>',
    constellation: '<circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" stroke-width="1"/><circle cx="12" cy="6" r="2" fill="none" stroke="currentColor"/><circle cx="6" cy="12" r="2" fill="none" stroke="currentColor"/><circle cx="18" cy="12" r="2" fill="none" stroke="currentColor"/>',
    radar: '<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="1"/><path d="M12 12L20 12"/><path d="M12 4L12 20"/><path d="M8 8L16 16"/><path d="M16 8L8 16"/>',
    terminal: '<rect x="3" y="4" width="18" height="16" rx="1"/><line x1="6" y1="8" x2="18" y2="8"/><line x1="6" y1="12" x2="15" y2="12"/><line x1="6" y1="16" x2="12" y2="16"/>',
    ethics: '<path d="M12 2L2 7V12C2 16.42 6.58 21 11.05 22C11.02 21.88 11 21.74 11 21.6C11 21.46 11.02 21.31 11.05 21.17C6 20.67 2 18 2 13.05V7.72L12 3.72L22 7.72V12C22 19.35 14 21.75 14 22A10 10 0 0 0 22 7.72V6C22 4.62 20.64 4 20 4H4C3.36 4 2 4.62 2 6V7.72"/>',
    sim: '<path d="M4 4H20V6H4V4Z"/><path d="M6 8H18V16H6V8Z"/><path d="M9 12H12V14H9V12Z"/><circle cx="15" cy="12" r="1"/>',
    day: '<circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2V4M12 20V22M4 12L2 12M22 12L20 12M5.6 5.6L4.2 4.2M19.4 18.6L20.8 20M5.6 18.4L4.2 20M19.4 5.4L20.8 4"/>',
    night: '<circle cx="12" cy="12" r="5" fill="currentColor"/><path d="M12 2V4M12 20V22M4 12L2 12M22 12L20 12M5.6 5.6L4.2 4.2M19.4 18.6L20.8 20M5.6 18.4L4.2 20M19.4 5.4L20.8 4"/>',
    sun: '<circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2V4M12 20V22M4 12L2 12M22 12L20 12M5.6 5.6L4.2 4.2M19.4 18.6L20.8 20M5.6 18.4L4.2 20M19.4 5.4L20.8 4"/>',
    moon: '<path d="M21 12.79A9 9 0 0 1 11.21 3 7 7 0 0 0 21 12.79Z" fill="currentColor"/>',
    contrast: '<path d="M12 22C17.52 22 22 17.52 22 12S17.52 2 12 2S2 6.48 2 12S6.48 22 12 22Z"/><path d="M12 4L12 20"/><path d="M4 12L20 12"/>',
    keyboard: '<rect x="4" y="6" width="16" height="14" rx="1"/><line x1="4" y1="10" x2="20" y2="10"/><line x1="8" y1="14" x2="8.01" y2="14"/><line x1="12" y1="14" x2="12.01" y2="14"/><line x1="16" y1="14" x2="16.01" y2="14"/>',
    skip: '<path d="M5 6L19 12L5 18V6Z" fill="currentColor"/>',
    reset: '<path d="M12 5V2L8 6L12 10V5Z"/><circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 12L12 18"/>',
    filter: '<path d="M4 7L12 15L20 7V3H4V7Z" fill="currentColor"/>',
    sort: '<path d="M6 9L12 15L18 9H6Z" fill="currentColor"/>',
    count: '<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12 8V12L15 15"/><line x1="12" y1="4" x2="12" y2="20"/>',
    gauge: '<circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 12L12 7"/><path d="12 12L16 12M12 12L8 12"/>',
    'bar-chart': '<path d="M4 18H8V10H4V18Z"/><path d="M12 18H16V6H12V18Z"/><path d="M20 18H20V2H16V18Z"/>',
    radial: '<circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 5L12 12L18 12"/>',
    confidence: '<path d="M4 12L10 18L20 6" stroke="currentColor" stroke-width="3" fill="none"/>',
    cross: '<path d="M12 2L2 22H22L12 2Z"/>',
    arrow: '<path d="M6 6L18 18M18 18L6 18M18 18L18 6" stroke="currentColor" stroke-width="2" fill="none"/>',
    'arrow-right': '<path d="M5 12L19 12M12 7L17 12M12 7L17 12L17 17M17 12L12 17M17 12L12 7" stroke="currentColor" stroke-width="2" fill="none"/>',
    'arrow-down': '<path d="M12 5L12 19M7 14L12 19M7 14L12 19L17 14" stroke="currentColor" stroke-width="2" fill="none"/>',
    plus: '<path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    minus: '<path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    pin: '<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 4L12 12L8 16"/>',
    tag: '<path d="M20 12L10 2L2 10L10 18L22 18L20 12Z"/><circle cx="8" cy="8" r="1"/>',
    tags: '<path d="M17 6L7 6L7 8L17 8M17 14L7 14L7 16L17 16M17 10L7 10L7 12L17 12" fill="currentColor"/>',
    file: '<path d="M6 2H14L18 6V20C18 21.1 17.1 22 16 22H8C6.9 22 6 21.1 6 20V2Z"/><path d="M14 2L14 6C14 6.6 14.4 7 15 7H18"/>',
    files: '<path d="M6 6H10V10H6V6Z"/><path d="M10 6H14V10H10V6Z"/><path d="M14 6H18V10H14V6Z"/><path d="M6 10H10V14H6V10Z"/><path d="M10 10H14V14H10V10Z"/><path d="M14 10H18V14H14V10Z"/><path d="M6 14H10V18H6V14Z"/><path d="M10 14H14V18H10V14Z"/><path d="M14 14H18V18H14V14Z"/>',
    cloud: '<path d="M19.35 10.04C18.67 6.59 15.64 4 12 4C8.14 4 4.95 6.61 4.19 10.07C2.36 10.38 1 11.99 1 14C1 16.76 3.24 19 6 19H18C20.76 19 23 16.76 23 14C23 11.71 21.66 9.72 19.35 10.04Z"/>',
    server: '<path d="M4 8H20V4C18.9 4 18 3.1 18 2H6C5 2.9 4.1 3.83 4 4.83V8Z"/><path d="M4 12H20V16C18.9 16 18 16.9 18 18H6C5 17.1 4 16.1 4 15.17V12Z"/><rect x="7" y="8" width="2" height="8" rx="1"/><rect x="15" y="8" width="2" height="8" rx="1"/>',
    shield: '<path d="M12 22S20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" fill="none" stroke="currentColor" stroke-width="2"/>',
    activity: '<path d="M2 12L8 8L12 12L16 8L22 12" stroke="currentColor" stroke-width="2" fill="none"/>',
    clock: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7L12 12L15 15" stroke="currentColor" stroke-width="2"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 9L7 13M17 9L17 13M9 7L9 5M15 7L15 5M9 17L9 15M15 17L15 15"/>',
    users: '<path d="M12 12C14.76 12 17 9.76 17 7C17 4.24 14.76 2 12 2C9.24 2 7 4.24 7 7C7 9.76 9.24 12 12 12Z"/><path d="M12 14C8.13 14 5 17.13 5 21H19C19 17.13 15.87 14 12 14Z"/>',
    'user-check': '<path d="M12 12C14.76 12 17 9.76 17 7C17 4.24 14.76 2 12 2C9.24 2 7 4.24 7 7C7 9.76 9.24 12 12 12Z"/><circle cx="9" cy="9" r="1"/><path d="M15 10L16 11L18 9"/><path d="M6 20C6 17.79 8.24 16 11 16H13C15.76 16 18 17.79 18 20H6Z"/>',
    'user-x': '<path d="M12 12C14.76 12 17 9.76 17 7C17 4.24 14.76 2 12 2C9.24 2 7 4.24 7 7C7 9.76 9.24 12 12 12Z"/><path d="M9 9L15 15M15 9L9 15"/><path d="M6 20C6 17.79 8.24 16 11 16H13C15.76 16 18 17.79 18 20H6Z"/>',
    external: '<path d="M18 13V19C18 20.1 17.1 21 16 21H8C6.9 21 6 20.1 6 19V11C6 9.9 6.9 9 8 9H12V7L16 11L12 15V12H8V19H16V15L20 15L20 11L16 7M13 3L17 7L13 11M17 7L9 7M13 3L17 7"/>',
    internal: '<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 8L12 12L16 16"/>',
    split: '<path d="M12 2L2 12L12 22L22 12L12 2Z"/><path d="M12 8L12 16"/><line x1="8" y1="12" x2="16" y2="12"/>',
    merge: '<path d="M8 8L2 12L8 16"/><path d="M16 8L22 12L16 16"/><path d="M2 12L22 12"/>',
    'zoom-in': '<path d="M4 4L20 20"/><circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" stroke-width="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>',
    'zoom-out': '<circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" stroke-width="2"/><line x1="8" y1="12" x2="16" y2="12"/>',
    fit: '<path d="M4 16L12 8L20 16"/><path d="M8 12L12 8"/><path d="M16 12L12 8"/>',
    fullscreen: '<path d="M4 4H8V6H6V10H4V4Z"/><path d="M16 4H20V10H16V4Z"/><path d="M4 14H6V18H8V20H4V14Z"/><path d="M16 20H18V16H20V14H16V20Z"/>',
    volume: '<path d="M4 9V15H8L12 19V5L8 9H4Z"/><path d="M15 7A5 5 0 0 1 19 12A5 5 0 0 1 15 17V7Z"/><path d="M17 4A8 8 0 0 1 21 12A8 8 0 0 1 17 20V4Z"/>',
    'volume-x': '<path d="M4 9V15H8L12 19V5L8 9H4Z"/><path d="M17 5L21 9M21 5L17 9M17 5V9M17 9V13"/><path d="M21 9L17 13M17 9L21 13"/>',
    play: '<path d="M10 6L10 18L16 12L10 6Z" fill="currentColor"/>',
    pause: '<path d="M6 6H10V18H6V6Z"/><path d="M14 6H18V18H14V6Z" fill="currentColor"/>',
    'skip-back': '<path d="M6 6V18L15 12L6 6V18Z"/><line x1="18" y1="6" x2="18" y2="18"/>',
    'skip-forward': '<path d="M18 6V18L9 12L18 6V18Z"/><line x1="6" y1="6" x2="6" y2="18"/>',
    'more-vertical': '<circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/><circle cx="12" cy="5" r="1"/>',
    'more-horizontal': '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    'chevron-left': '<path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" fill="none"/>',
    'chevron-right': '<path d="M9 6L15 12L9 18" stroke="currentColor" stroke-width="2" fill="none"/>',
    'chevron-down': '<path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" fill="none"/>',
    'chevron-up': '<path d="M18 15L12 9L6 15" stroke="currentColor" stroke-width="2" fill="none"/>',
    'corner-down-left': '<path d="M17 6L7 6L7 16M7 6L13 12M13 12L17 16" stroke="currentColor" stroke-width="2" fill="none"/>',
    'send-to-graph': '<path d="M5 12L12 5L19 12L12 19L5 12Z"/><path d="M12 12L16 12"/><path d="M12 12L12 16"/>'
  };

  function get(name, opts = {}) {
    const size = opts.size || 'md';
    const sizes = { sm: 16, md: 20, lg: 24, xl: 32 };
    const dim = sizes[size];
    const cls = opts.class || '';
    const label = opts.label ? ` aria-label="${opts.label}"` : '';
    const role = opts.label ? ' role="img"' : ' aria-hidden="true"';

    const fallback = FALLBACKS[name] || FALLBACKS['help'];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${dim}" height="${dim}" viewBox="0 0 24 24" class="${cls}"${label}${role}>${fallback}</svg>`;
    return svg;
  }

  function raw(name) {
    return FALLBACKS[name] || FALLBACKS['help'];
  }

  function loadFromFile(name, callback) {
    const url = `/assets/icons/${name}.svg`;
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = function () {
      if (xhr.status === 200 && xhr.responseText) {
        callback(null, xhr.responseText.trim());
      } else {
        callback(null, null);
      }
    };
    xhr.onerror = function () { callback(null, null); };
    xhr.send();
  }

  return {
    get,
    raw,
    loadFromFile,
    ICON_SET,
    FALLBACKS
  };
})();