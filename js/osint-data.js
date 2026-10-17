window.CF = window.CF || {};

CF.Data = (function () {
  'use strict';

  const SIM = true;

  const telegramSeed = {
    nodes: [
      { id: 'tg-ch-01', type: 'channel', label: 'ShadowNet Leaks', handle: 'shadownet_official', subscribers: 8742, created: '2021-03-14', risk: 85, simulated: SIM, icons: ['megaphone'], links: [{ target: 'tg-user-01', type: 'admin' }, { target: 'tg-wallet-01', type: 'wallet' }], desc: 'Primary leak distribution channel. Reposts from multiple sources.' },
      { id: 'tg-ch-02', type: 'channel', label: 'CryptoDrop Market', handle: 'cryptodrop_market', subscribers: 15300, created: '2020-11-22', risk: 92, simulated: SIM, icons: ['megaphone'], links: [{ target: 'tg-user-03', type: 'admin' }], desc: 'Dark web marketplace announcements and promotions.' },
      { id: 'tg-ch-03', type: 'channel', label: 'InfoSec Daily', handle: 'infosec_daily_news', subscribers: 22100, created: '2019-01-05', risk: 25, simulated: SIM, icons: ['megaphone'], links: [{ target: 'tg-user-06', type: 'admin' }], desc: 'Security news aggregation. Low risk, high traffic.' },

      { id: 'tg-grp-01', type: 'group', label: 'Shadow Brokers', handle: 'shadow_brokers_chat', members: 342, created: '2021-05-03', risk: 78, simulated: SIM, icons: ['people'], links: [{ target: 'tg-user-01', type: 'member' }, { target: 'tg-user-02', type: 'member' }, { target: 'tg-user-04', type: 'member' }], desc: 'Closed discussion group for brokers and vendors.' },
      { id: 'tg-grp-02', type: 'group', label: 'RansomNegotiations', handle: 'ransom_talk_room', members: 156, created: '2022-08-19', risk: 65, simulated: SIM, icons: ['people'], links: [{ target: 'tg-user-03', type: 'member' }, { target: 'tg-user-05', type: 'member' }], desc: 'Ransomware negotiation coordination.' },

      { id: 'tg-user-01', type: 'person', label: 'Alexei V.', handle: 'alex_shadow', verified: true, role: 'admin', risk: 88, simulated: SIM, links: [{ target: 'tg-email-01', type: 'email' }, { target: 'tg-wallet-01', type: 'wallet' }], aliases: ['alex_shadow', 'admin_shadownet'], desc: 'Primary admin of ShadowNet Leaks.' },
      { id: 'tg-user-02', type: 'person', label: 'Mikhail K.', handle: 'misha_broker', role: 'member', risk: 72, simulated: SIM, links: [{ target: 'tg-wallet-01', type: 'wallet' }], aliases: ['misha_broker'], desc: 'Known broker, frequent forwarder.' },
      { id: 'tg-user-03', type: 'person', label: 'D3m0nHunt3r', handle: 'd3m0nhunt3r', verified: true, role: 'admin', risk: 95, simulated: SIM, links: [{ target: 'tg-pgp-01', type: 'pgp' }, { target: 'dw-vendor-03', type: 'darknet-vendor' }], aliases: ['d3m0nhunt3r', 'demonhunter'], desc: 'High-risk admin of CryptoDrop Market.' },
      { id: 'tg-user-04', type: 'person', label: 'Zara Q.', handle: 'zara_q', role: 'member', risk: 60, simulated: SIM, aliases: ['zara_q'], desc: 'Group member, occasional forwarder.' },
      { id: 'tg-user-05', type: 'person', label: 'RansomOps', handle: 'ransom_ops', role: 'member', risk: 70, simulated: SIM, aliases: ['ransom_ops'], desc: 'Affiliated with RansomNegotiations group.' },
      { id: 'tg-user-06', type: 'person', label: 'NewsBot', handle: 'infosec_news_bot', role: 'admin', risk: 5, simulated: SIM, aliases: ['infosec_news_bot'], bot: true, desc: 'Automated news posting bot.' },

      { id: 'tg-bot-01', type: 'bot', label: 'LeakVerifier Bot', handle: 'leakverifier_bot', risk: 40, simulated: SIM, aliases: ['leakverifier_bot'], desc: 'Verifies posted leak authenticity via checksum.' },
      { id: 'tg-bot-02', type: 'bot', label: 'WalletGuard Bot', handle: 'walletguard_bot', risk: 35, simulated: SIM, aliases: ['walletguard_bot'], desc: 'Automated wallet balance tracker.' },

      { id: 'tg-wallet-01', type: 'wallet', label: 'bc1q...shadow01', chain: 'bitcoin', balance: '2.34 BTC', risk: 75, simulated: SIM, desc: 'Bitcoin wallet linked to ShadowNet admins.' },
      { id: 'tg-email-01', type: 'email', label: 'alex@shadow.net', address: 'alex@shadow.net', risk: 80, simulated: SIM, desc: 'Email address linked to tg-user-01.' },
      { id: 'tg-pgp-01', type: 'pgp', label: '0xA1B2C3D4E5F6', fingerprint: 'A1B2C3D4E5F6A1B2C3D4E5F6A1B2C3D4E5F6', risk: 90, simulated: SIM, desc: 'PGP key for tg-user-03.' }
    ],

    edges: [
      { id: 'tg-e-01', source: 'tg-ch-01', target: 'tg-user-01', type: 'admin', weight: 1 },
      { id: 'tg-e-02', source: 'tg-ch-01', target: 'tg-wallet-01', type: 'wallet', weight: 0.8 },
      { id: 'tg-e-03', source: 'tg-ch-02', target: 'tg-user-03', type: 'admin', weight: 1 },
      { id: 'tg-e-04', source: 'tg-ch-03', target: 'tg-user-06', type: 'admin', weight: 0.6 },
      { id: 'tg-e-05', source: 'tg-grp-01', target: 'tg-user-01', type: 'member', weight: 0.9 },
      { id: 'tg-e-06', source: 'tg-grp-01', target: 'tg-user-02', type: 'member', weight: 0.8 },
      { id: 'tg-e-07', source: 'tg-grp-01', target: 'tg-user-04', type: 'member', weight: 0.5 },
      { id: 'tg-e-08', source: 'tg-grp-02', target: 'tg-user-03', type: 'member', weight: 0.9 },
      { id: 'tg-e-09', source: 'tg-grp-02', target: 'tg-user-05', type: 'member', weight: 0.7 },
      { id: 'tg-e-10', source: 'tg-user-01', target: 'tg-email-01', type: 'email', weight: 0.9 },
      { id: 'tg-e-11', source: 'tg-user-01', target: 'tg-wallet-01', type: 'wallet', weight: 1 },
      { id: 'tg-e-12', source: 'tg-user-03', target: 'tg-pgp-01', type: 'pgp', weight: 1 },
      { id: 'tg-e-13', source: 'tg-ch-01', target: 'tg-grp-01', type: 'forward', weight: 0.7 },
      { id: 'tg-e-14', source: 'tg-ch-01', target: 'tg-user-02', type: 'forward', weight: 0.3 }
    ],

    messages: [
      { id: 'tg-msg-01', channel: 'tg-ch-01', author: 'tg-user-01', text: '[LEAK] New database dump — 1.2M records. Checksum: 0xa1b2c3d4. Verify with @leakverifier_bot', time: '2023-06-15 22:14', excerpt: 'New database dump — 1.2M records' },
      { id: 'tg-msg-02', channel: 'tg-ch-01', author: 'tg-user-02', text: 'Repost: CryptoDrop updated mirror links. See pinned. Wallet balances: Market cold = 45.2 BTC, escrow = 12.8 BTC', time: '2023-06-12 18:32', excerpt: 'CryptoDrop updated mirror links' },
      { id: 'tg-msg-03', channel: 'tg-ch-02', author: 'tg-user-03', text: 'New listing: CVV2 Fullz — $15 each. 500+ in stock. TG: @d3m0nhunt3r for bulk orders', time: '2023-06-18 15:07', excerpt: 'New listing: CVV2 Fullz' },
      { id: 'tg-msg-04', channel: 'tg-grp-01', author: 'tg-user-04', text: 'Anyone got the latest Contoso leak? Looking for payroll data specifically.', time: '2023-06-10 09:21', excerpt: 'Looking for Contoso payroll data' },
      { id: 'tg-msg-05', channel: 'tg-grp-01', author: 'tg-user-01', text: 'Forwarded from @infosec_daily_news: New zero-day in Microsoft Exchange', time: '2023-06-09 06:55', excerpt: 'Forwarded: zero-day in Microsoft Exchange' },
      { id: 'tg-msg-06', channel: 'tg-ch-03', author: 'tg-user-06', text: 'Daily digest: 12 breaches reported today. Top: Healthcare.gov (2.3M records)', time: '2023-06-17 08:00', excerpt: '12 breaches reported today' },
      { id: 'tg-msg-07', channel: 'tg-grp-02', author: 'tg-user-05', text: 'LockBit hit Contoso Corp. Ransom: 50 BTC. Payment window: 72h. Contact: @d3m0nhunt3r', time: '2023-06-16 14:42', excerpt: 'LockBit hit Contoso Corp' },
      { id: 'tg-msg-08', channel: 'tg-grp-02', author: 'tg-user-03', text: 'Contoso negotiations progressing. They are checking backups. Advise patience.', time: '2023-06-17 02:15', excerpt: 'Contoso negotiations progressing' },
      { id: 'tg-msg-09', channel: 'tg-ch-01', author: 'tg-user-01', text: 'WalletGuard Bot: bc1q...shadow01 balance updated +0.5 BTC from sale.', time: '2023-06-18 21:03', excerpt: 'Wallet balance +0.5 BTC' },
      { id: 'tg-msg-10', channel: 'tg-ch-02', author: 'tg-user-03', text: 'CryptoDrop v2 launched. All vendors re-register. Old escrow drained.', time: '2023-06-01 00:00', excerpt: 'CryptoDrop v2 launched' },
      { id: 'tg-msg-11', channel: 'tg-ch-01', author: 'tg-bot-01', text: 'Checksum verified: Contoso dump 0xa1b2c3d4 matches leaked file.', time: '2023-06-15 22:20', excerpt: 'Checksum verified' },
      { id: 'tg-msg-12', channel: 'tg-grp-01', author: 'tg-user-02', text: 'Forwarded from @cryptodrop_market: Market maintenance scheduled 06/19 02:00-04:00 UTC', time: '2023-06-18 10:00', excerpt: 'Market maintenance scheduled' }
    ],

    forwardChains: [
      { id: 'tg-fc-01', name: 'ShadowNet → Broker Discussion', steps: ['tg-ch-01', 'tg-grp-01', 'tg-user-02'], active: true, messages: 3 },
      { id: 'tg-fc-02', name: 'Contoso Breach Flow', steps: ['tg-grp-01', 'tg-grp-02', 'tg-ch-01'], active: true, messages: 5 }
    ]
  };

  const darkwebSeed = {
    markets: [
      { id: 'dw-mkt-01', name: 'CryptoDrop Market', onion: 'crypt0drop[.]onion', trust: 0.82, listed: 2020, flagged: false, seized: false, exitScam: false, simulated: SIM, desc: 'Established market with escrow system.', vendorCount: 6, walletRef: 'dw-wallet-01', forumRef: 'dw-for-01' },
      { id: 'dw-mkt-02', name: 'BlackVault Bazaars', onion: 'blackvau1t[.]onion', trust: 0.15, listed: 2021, flagged: true, seized: true, exitScam: true, simulated: SIM, desc: 'Exit scam detected. Admin vanished with escrow funds.', vendorCount: 4, walletRef: 'dw-wallet-02', forumRef: null }
    ],
    vendors: [
      { id: 'dw-vendor-01', name: 'ZeroDayLabs', alias: 'ZeroDayLabs', market: 'dw-mkt-01', trust: 0.91, joined: '2021-06', feedback: 1247, pgp: 'B2C3D4E5F6A1B2C3D4E5F6A2C3D4E5F6A1B2C3D4', simulated: SIM, links: [{ target: 'tg-user-03', type: 'telegram', confidence: 0.88 }], listings: ['dw-list-01','dw-list-02'], desc: 'Software exploits and zero-days. PGP: B2C3D4...' },
      { id: 'dw-vendor-02', name: 'CardShack', alias: 'CardShack', market: 'dw-mkt-01', trust: 0.67, joined: '2022-01', feedback: 532, pgp: 'C3D4E5F6A1B0C3D4E5F6A2C3D4E5F6A1B0C3D4', simulated: SIM, listings: ['dw-list-04'], desc: 'Stolen credit cards and banking data.' },
      { id: 'dw-vendor-03', name: 'D3m0nHunt3r', alias: 'd3m0nhunt3r', market: 'dw-mkt-01', trust: 0.94, joined: '2020-12', feedback: 3801, pgp: 'A1B2C3D4E5F6A1B2C3D4E5F6A1B2C3D4E5F6A1B2', simulated: SIM, links: [{ target: 'tg-user-03', type: 'telegram', confidence: 0.95 }, { target: 'tg-email-01', type: 'email', confidence: 0.82 }], listings: ['dw-list-01','dw-list-03'], desc: 'High-trust vendor, also admin of CryptoDrop on Telegram.' },
      { id: 'dw-vendor-04', name: 'PhishKing', alias: 'PhishKing', market: 'dw-mkt-01', trust: 0.55, joined: '2023-02', feedback: 210, pgp: 'D4E5F6A1B0C3D4E5F6A2C3D4E5F6A1B0C3D4E5', simulated: SIM, listings: ['dw-list-05'], desc: 'Phishing kits and compromised accounts.' },
      { id: 'dw-vendor-05', name: 'BioGhost', alias: 'BioGhost', market: 'dw-mkt-01', trust: 0.73, joined: '2022-08', feedback: 405, pgp: 'E5F6A1B0C3D4E5F6A2C3D4E5F6A1B0C3D4E5F6A', simulated: SIM, listings: ['dw-list-06'], desc: 'Stolen medical records and healthcare data.' },
      { id: 'dw-vendor-06', name: 'LockBitRansom', alias: 'LockBitOps', market: 'dw-mkt-02', trust: 0.30, joined: '2022-06', feedback: 89, pgp: 'F6A1B0C3D4E5F6A2C3D4E5F6A1B0C3D4E5F6A1', simulated: SIM, listings: ['dw-list-01','dw-list-03'], desc: 'Ransomware-as-a-service. Flagged for exit scam attempts.' },
      { id: 'dw-vendor-07', name: 'ForgeDoc', alias: 'ForgeDocPro', market: 'dw-mkt-02', trust: 0.45, joined: '2021-09', feedback: 156, pgp: 'A0B1C2D3E4F5A0B1C2D3E4F5A0B1C2D3E4F5A0B', simulated: SIM, listings: ['dw-list-02'], desc: 'Forged documents, passports, visas.' }
    ],
    listings: [
      { id: 'dw-list-01', vendor: 'dw-vendor-01', title: 'Windows 11 Zero-Day (CVE-2023-XXXX)', category: 'data', price: '8.5 BTC', stock: 3, risk: 95, simulated: SIM, desc: 'Privilege escalation exploit, kernel-level.' },
      { id: 'dw-list-02', vendor: 'dw-vendor-03', title: 'Contoso Corp Network Access', category: 'data', price: '12 BTC', stock: 1, risk: 90, simulated: SIM, desc: 'Full domain admin access to Contoso Corp servers.' },
      { id: 'dw-list-03', vendor: 'dw-vendor-03', title: 'Contoso Payroll Database Leak', category: 'data', price: '15 BTC', stock: 1, risk: 92, simulated: SIM, desc: '1.2M employee records including SSNs and banking data.' },
      { id: 'dw-list-04', vendor: 'dw-vendor-02', title: 'CVV2 Fullz Bundle (1000)', category: 'cards', price: '2.2 BTC', stock: 15, risk: 85, simulated: SIM, desc: '1000 credit card records with CVV2.' },
      { id: 'dw-list-05', vendor: 'dw-vendor-04', title: 'Corporate Phishing Kit v3', category: 'accounts', price: '0.8 BTC', stock: 42, risk: 75, simulated: SIM, desc: 'Clone of Microsoft login portal.' },
      { id: 'dw-list-06', vendor: 'dw-vendor-05', title: 'Contoso Medical Records (50K)', category: 'data', price: '5.5 BTC', stock: 1, risk: 88, simulated: SIM, desc: '50,000 patient records from Contoso Health Systems.' },
      { id: 'dw-list-07', vendor: 'dw-vendor-01', title: 'Exploit Builder Toolkit', category: 'data', price: '3.2 BTC', stock: 8, risk: 90, simulated: SIM, desc: 'Automated exploit generation framework.' },
      { id: 'dw-list-08', vendor: 'dw-vendor-06', title: 'LockBit 3.0 Ransomware Source', category: 'data', price: '10 BTC', stock: 2, risk: 98, simulated: SIM, desc: 'Full source code with deployment scripts.' },
      { id: 'dw-list-09', vendor: 'dw-vendor-07', title: 'Passport Template Pack (EU/US)', category: 'forged-docs', price: '1.5 BTC', stock: 20, risk: 70, simulated: SIM, desc: 'Editable PSD templates with hologram guides.' }
    ],
    wallets: [
      { id: 'dw-wallet-01', address: 'bc1qcrypt0drop00001', chain: 'bitcoin', balance: '45.2 BTC', risk: 85, market: 'dw-mkt-01', simulated: SIM, flows: ['dw-flow-01'], desc: 'CryptoDrop market cold wallet.' },
      { id: 'dw-wallet-02', address: 'bc1qblackvau1t00002', chain: 'bitcoin', balance: '0 BTC', risk: 98, market: 'dw-mkt-02', simulated: SIM, flows: ['dw-flow-02'], desc: 'BlackVault wallet — drained during exit scam.' },
      { id: 'dw-wallet-03', address: 'bc1qvend0r03mixer1', chain: 'bitcoin', balance: '12.8 BTC', risk: 75, market: 'dw-mkt-01', simulated: SIM, flows: ['dw-flow-01'], desc: 'Vendor escrow wallet.' },
      { id: 'dw-wallet-04', address: 'bc1qmixer0004clean', chain: 'bitcoin', balance: '5.4 BTC', risk: 65, market: 'dw-mkt-01', simulated: SIM, flows: ['dw-flow-03'], desc: 'Mixer withdrawal wallet.' },
      { id: 'dw-wallet-05', address: 'bc1qexch4nge00056', chain: 'bitcoin', balance: '0.028 BTC', risk: 70, market: 'dw-mkt-01', simulated: SIM, flows: ['dw-flow-04'], desc: 'Exchange deposit address.' }
    ],
    mirrors: [
      { id: 'dw-mir-01', market: 'dw-mkt-01', onion: 'crypt0drop2[.]onion', firstSeen: '2022-08-15', lastSeen: '2023-06-18', status: 'active', simulated: SIM, desc: 'Primary mirror of CryptoDrop Market.' },
      { id: 'dw-mir-02', market: 'dw-mkt-02', onion: 'blackvau1t5[.]onion', firstSeen: '2022-03-10', lastSeen: '2022-11-28', status: 'takedown', simulated: SIM, desc: 'Mirror seized by law enforcement.' }
    ],
    forums: [
      { id: 'dw-for-01', name: 'DarkNet Forum', onion: 'darknetf0rum[.]onion', threads: 8423, members: 12500, simulated: SIM, desc: 'General dark web discussion forum.' }
    ],
    flows: [
      { id: 'dw-flow-01', from: 'dw-wallet-03', to: 'dw-wallet-04', amount: '3.1 BTC', label: 'Vendor → Mixer', steps: ['dw-vendor-03'], risk: 70, simulated: SIM },
      { id: 'dw-flow-02', from: 'dw-wallet-02', to: null, amount: '0 BTC', label: 'Exit Scam — Wallet Drained', steps: ['dw-vendor-06'], risk: 98, simulated: SIM },
      { id: 'dw-flow-03', from: 'dw-wallet-04', to: 'dw-wallet-05', amount: '2.7 BTC', label: 'Mixer → Exchange', steps: ['dw-vendor-01', 'dw-vendor-03'], risk: 65, simulated: SIM },
      { id: 'dw-flow-04', from: 'dw-wallet-05', to: 'bc1qoffsh0re00067', amount: '0.028 BTC', label: 'Exchange → Offshore', steps: [], risk: 75, simulated: SIM }
    ],
    timeline: [
      { id: 'dw-tl-01', service: 'dw-mkt-01', event: 'Market Launched', date: '2020-11-22', type: 'created' },
      { id: 'dw-tl-02', service: 'dw-mkt-02', event: 'Market Flagged', date: '2021-08-15', type: 'flagged' },
      { id: 'dw-tl-03', service: 'dw-mkt-02', event: 'Exit Scam', date: '2022-11-28', type: 'exit-scam' },
      { id: 'dw-tl-04', service: 'dw-mir-02', event: 'Mirror Takedown', date: '2022-11-28', type: 'takedown' },
      { id: 'dw-tl-05', service: 'dw-mkt-01', event: 'v2.0 Update', date: '2023-06-01', type: 'update' },
      { id: 'dw-tl-06', service: 'dw-mkt-01', event: 'Last Seen', date: '2023-06-18', type: 'active' }
    ]
  };

  const deepwebSeed = {
    layers: [
      { id: 'dw-l-01', name: 'Public Databases', depth: 0, color: 'var(--dw-depth-1)', desc: 'Freely accessible databases and directories.', simulated: SIM },
      { id: 'dw-l-02', name: 'Academic Repositories', depth: 1, color: 'var(--dw-depth-2)', desc: 'University and research publications.', simulated: SIM },
      { id: 'dw-l-03', name: 'Government Records', depth: 2, color: 'var(--dw-depth-3)', desc: 'Public government databases and filings.', simulated: SIM },
      { id: 'dw-l-04', name: 'Corporate Intranets', depth: 3, color: 'var(--dw-depth-4)', desc: 'Internal corporate resources (gated).', simulated: SIM },
      { id: 'dw-l-05', name: 'Subscription Archives', depth: 4, color: 'var(--dw-depth-5)', desc: 'Paywalled academic, legal, or media archives.', simulated: SIM },
      { id: 'dw-l-06', name: 'Medical/Legal Records', depth: 5, color: 'var(--dw-depth-6)', desc: 'Sensitive personal records (leaked or gated).', simulated: SIM },
      { id: 'dw-l-07', name: 'IoT/Device Panels', depth: 6, color: 'var(--dw-depth-7)', desc: 'Exposed IP cameras, routers, industrial panels.', simulated: SIM },
      { id: 'dw-l-border', name: 'Dark Web Border Zone', depth: 7, color: 'var(--dw-depth-border)', desc: 'Interface point to darknet markets and vendors.', simulated: SIM }
    ],
    nodes: [
      { id: 'dw-node-01', layer: 'dw-l-01', type: 'database', label: 'NASA Technical Reports Server', access: 'open', records: 5400000, risk: 5, simulated: SIM, desc: 'Public NASA technical documents.' },
      { id: 'dw-node-02', layer: 'dw-l-02', type: 'document', label: 'IEEE Xplore', access: 'gated', records: 5200000, risk: 10, simulated: SIM, desc: 'IEEE publications and conference papers.' },
      { id: 'dw-node-03', layer: 'dw-l-03', type: 'record', label: 'SEC EDGAR Filings', access: 'open', records: 18000000, risk: 15, simulated: SIM, desc: 'Public company financial filings.' },
      { id: 'dw-node-04', layer: 'dw-l-04', type: 'portal', label: 'Contoso Internal Wiki', access: 'leaked', records: 500, risk: 75, simulated: SIM, emailRef: 'tg-email-01', desc: 'Contoso Corp internal wiki, appears in breach dump.' },
      { id: 'dw-node-05', layer: 'dw-l-04', type: 'portal', label: 'Contoso HR Portal', access: 'gated', records: 12000, risk: 80, simulated: SIM, emailRef: 'tg-email-01', desc: 'Contoso Corp employee HR portal — email match.' },
      { id: 'dw-node-06', layer: 'dw-l-05', type: 'archive', label: 'Dehashed Breach Index', access: 'paywalled', records: 150000000, risk: 40, simulated: SIM, desc: 'Aggregated breach credential index.' },
      { id: 'dw-node-07', layer: 'dw-l-06', type: 'leak', label: 'Contoso Health Breach', access: 'leaked', records: 50000, risk: 92, simulated: SIM, desc: '50K medical records from Contoso Health Systems breach.' },
      { id: 'dw-node-08', layer: 'dw-l-07', type: 'device', label: 'IoT Camera 01', access: 'open', records: '24/7 stream', risk: 30, simulated: SIM, ip: '192.168.1.100', desc: 'Exposed IP camera feed (simulated).' },
      { id: 'dw-node-09', layer: 'dw-l-07', type: 'device', label: 'Industrial SCADA Panel', access: 'open', records: 'control interface', risk: 60, simulated: SIM, ip: '10.0.0.1', desc: 'Exposed industrial control panel.' },
      { id: 'dw-node-10', layer: 'dw-l-03', type: 'record', label: 'CourtListener Opinion DB', access: 'open', records: 35000000, risk: 5, simulated: SIM, desc: 'US court opinions and filings.' },
      { id: 'dw-node-11', layer: 'dw-l-02', type: 'database', label: 'arXiv Preprint Server', access: 'open', records: 1900000, risk: 8, simulated: SIM, desc: 'Physics, mathematics, computer science preprints.' },
      { id: 'dw-node-12', layer: 'dw-l-05', type: 'document', label: 'Contoso Financial Records', access: 'paywalled', records: 5, risk: 85, simulated: SIM, desc: 'Paywalled financial records related to Contoso breach.' }
    ],
    breaches: [
      { id: 'dw-br-01', name: 'Contoso Health Systems', year: 2023, records: 50000, exposed: ['name', 'ssn', 'dob', 'diagnosis', 'insurance'], relevance: 0.92, simulated: SIM, desc: 'Medical records breach. Email alex@shadow.net exposed.' },
      { id: 'dw-br-02', name: 'Contoso Corp', year: 2023, records: 1200000, exposed: ['name', 'email', 'ssn', 'phone', 'payroll'], relevance: 0.95, simulated: SIM, desc: 'Corporate breach. Email alex@shadow.net and PGP A1B2... linked.' },
      { id: 'dw-br-03', name: 'CityBank Data Leak', year: 2022, records: 8700000, exposed: ['card_number', 'cvv', 'expiry', 'name'], relevance: 0.70, simulated: SIM, desc: 'Credit card data leak. Wallet bc1q...shadow01 seen in related transactions.' },
      { id: 'dw-br-04', name: 'MediSecure Patient Portal', year: 2023, records: 150000, exposed: ['name', 'dob', 'condition', 'medication'], relevance: 0.65, simulated: SIM, desc: 'Healthcare patient portal breach.' }
    ],
    discoveries: [
      { id: 'dw-disc-01', name: 'Contoso Trace Path', steps: ['dw-node-04', 'tg-email-01', 'dw-br-02', 'dw-vendor-03', 'dw-wallet-01', 'dw-mir-02', 'dw-tl-04'], active: true, simulated: SIM, desc: 'Email → Breach → Vendor → Wallet → Mirror → Takedown' }
    ]
  };

  const traceChainSeed = {
    chains: [
      {
        id: 'chain-demo-01',
        name: 'Operation Contoso',
        hops: [
          { id: 'hop-1', entityRef: 'tg-ch-01', module: 'telegram', label: 'ShadowNet Leaks channel', confidence: 1.0, ts: '2023-06-15 22:14', note: 'Original leak announcement' },
          { id: 'hop-2', entityRef: 'tg-email-01', module: 'telegram', label: 'alex@shadow.net', confidence: 0.90, ts: '2023-06-15 22:20', note: 'Email linked to channel admin' },
          { id: 'hop-3', entityRef: 'dw-br-02', module: 'deepweb', label: 'Contoso Corp Breach', confidence: 0.95, ts: '2023-06-10', note: 'Breach dump 1.2M records' },
          { id: 'hop-4', entityRef: 'dw-vendor-03', module: 'darkweb', label: 'D3m0nHunt3r vendor alias', confidence: 0.95, ts: '2023-06-12', note: 'Shared PGP and Telegram handle' },
          { id: 'hop-5', entityRef: 'dw-wallet-01', module: 'darkweb', label: 'CryptoDrop cold wallet bc1q...', confidence: 0.98, ts: '2023-06-01', note: 'Market cold wallet' },
          { id: 'hop-6', entityRef: 'dw-mir-02', module: 'darkweb', label: 'BlackVault mirror onion', confidence: 0.85, ts: '2022-11-28', note: 'Mirror of seized market' },
          { id: 'hop-7', entityRef: 'dw-tl-04', module: 'darkweb', label: 'Mirror Takedown', confidence: 1.0, ts: '2022-11-28', note: 'Law enforcement seized mirror' }
        ],
        confidence: 0.72,
        createdAt: '2023-06-18',
        notes: 'Full chain from initial leak to law enforcement takedown.'
      }
    ]
  };

  function seedAll() {
    CF.Storage.seed('telegramNodes', telegramSeed.nodes.map(n => ({ ...n, _source: 'telegram' })));
    CF.Storage.seed('telegramEdges', telegramSeed.edges);
    CF.Storage.seed('telegramMessages', telegramSeed.messages);
    CF.Storage.seed('telegramForwardChains', telegramSeed.forwardChains);

    CF.Storage.seed('darkwebMarkets', darkwebSeed.markets);
    CF.Storage.seed('darkwebVendors', darkwebSeed.vendors);
    CF.Storage.seed('darkwebListings', darkwebSeed.listings);
    CF.Storage.seed('darkwebWallets', darkwebSeed.wallets);
    CF.Storage.seed('darkwebMirrors', darkwebSeed.mirrors);
    CF.Storage.seed('darkwebForums', darkwebSeed.forums);
    CF.Storage.seed('darkwebFlows', darkwebSeed.flows);
    CF.Storage.seed('darkwebTimeline', darkwebSeed.timeline);

    CF.Storage.seed('deepwebLayers', deepwebSeed.layers);
    CF.Storage.seed('deepwebNodes', deepwebSeed.nodes);
    CF.Storage.seed('deepwebBreaches', deepwebSeed.breaches);
    CF.Storage.seed('deepwebDiscoveries', deepwebSeed.discoveries);

    CF.Storage.seed('traceChains', traceChainSeed.chains);
    CF.Storage.seed('cases', []);

    localStorage.setItem('cf.dd.v', '1');
  }

  return {
    SIM,
    telegramSeed,
    darkwebSeed,
    deepwebSeed,
    traceChainSeed,
    seedAll
  };
})();