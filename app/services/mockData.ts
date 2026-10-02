import { Community, Message, SettlementRecord, User, WalletTransaction } from '../types';

export const INITIAL_USER: User = {
  id: 'usr-1',
  username: '@victor',
  displayName: 'Victor',
  role: 'builder',
  isOnline: true,
  bio: 'Frontend Lead & Builder en Kosmovia.',
};

export const TEAM_MEMBERS: User[] = [
  INITIAL_USER,
  {
    id: 'usr-2',
    username: '@alejandro',
    displayName: 'Alejandro',
    role: 'admin',
    isOnline: true,
    bio: 'Product & Full Stack en Kosmovia.',
  },
  {
    id: 'usr-3',
    username: '@roberto',
    displayName: 'Roberto',
    role: 'builder',
    isOnline: true,
    bio: 'Backend, Soroban smart contracts y tiempo real.',
  },
  {
    id: 'usr-4',
    username: '@carla',
    displayName: 'Carla',
    role: 'member',
    isOnline: true,
    bio: 'Diseño UX/UI, marca y marketing.',
  },
  {
    id: 'usr-5',
    username: '@stellar_bot',
    displayName: 'Kosmovia Bot',
    role: 'admin',
    isOnline: false,
    bio: 'Bot de bienvenida y notificaciones automáticas.',
  },
];

export const INITIAL_COMMUNITIES: Community[] = [
  {
    id: 'comm-1',
    name: 'Kosmovia Hub',
    slug: 'kosmovia',
    icon: '🌌',
    description: 'La comunidad principal de Kosmovia en Stellar.',
    channels: [
      { id: 'chan-1', communityId: 'comm-1', name: 'general', topic: 'Charlas generales de Kosmovia y el ecosistema', type: 'text' },
      { id: 'chan-2', communityId: 'comm-1', name: 'anuncios', topic: 'Novedades oficiales del proyecto', type: 'announcement' },
      { id: 'chan-3', communityId: 'comm-1', name: 'ideas', topic: 'Propuestas de la comunidad', type: 'text' },
    ],
    members: TEAM_MEMBERS,
  },
  {
    id: 'comm-2',
    name: 'Stellar Elite Bolivia',
    slug: 'stellar-bolivia',
    icon: '🇧🇴',
    description: 'Comunidad del chapter Bolivia en TechRebel.',
    channels: [
      { id: 'chan-4', communityId: 'comm-2', name: 'general', topic: 'Comunidad de desarrolladores de Bolivia', type: 'text' },
      { id: 'chan-5', communityId: 'comm-2', name: 'hackathon', topic: 'Coordinación para Stellar Apex y premios', type: 'text' },
      { id: 'chan-6', communityId: 'comm-2', name: 'soroban-dev', topic: 'Smart contracts y Rust en testnet', type: 'text' },
    ],
    members: [INITIAL_USER, TEAM_MEMBERS[1], TEAM_MEMBERS[2]],
  },
  {
    id: 'comm-3',
    name: 'Empresas Bolivia · B2B',
    slug: 'empresas-bolivia',
    icon: '🏢',
    description: 'Espacio para empresas bolivianas con cobros y pagos en Stellar.',
    channels: [
      { id: 'chan-7', communityId: 'comm-3', name: 'pagos-b2b', topic: 'Cobros instantáneos en USDC y validación de facturas', type: 'text' },
      { id: 'chan-8', communityId: 'comm-3', name: 'verificacion-kyc', topic: 'Consultas sobre validación de identidad empresarial', type: 'text' },
    ],
    members: [INITIAL_USER, TEAM_MEMBERS[1], TEAM_MEMBERS[2]],
  },
];

export const INITIAL_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'tx-1',
    type: 'received',
    counterparty: '@alejandro',
    amount: 50,
    asset: 'USDC',
    timestamp: 'Hace 2 horas',
    hash: '6be268a284eee59916485c32eadc2d89d092c1b14c60443969cb504996147181',
  },
  {
    id: 'tx-2',
    type: 'sent',
    counterparty: '@roberto',
    amount: 15,
    asset: 'USDC',
    timestamp: 'Ayer',
    hash: '8f73b9e82047d2fka912837bc9910248cba00184719283746192837465910293',
  },
];

export const INITIAL_SETTLEMENTS: SettlementRecord[] = [
  {
    id: 'stl-1',
    orderId: 'ORD-8921',
    concept: 'Factura #204 - Bienes Raíces Santa Cruz',
    client: 'Inmobiliaria Urbana S.R.L.',
    totalUSDC: 450.0,
    feeUSDC: 2.25,
    netUSDC: 447.75,
    status: 'COMPLETED',
    settlementTxHash: '6be268a284eee59916485c32eadc2d89d092c1b14c60443969cb504996147181',
    createdAt: '30 Sep 2026, 18:40',
  },
  {
    id: 'stl-2',
    orderId: 'ORD-8922',
    concept: 'Servicios de Consultoría Tecnológica & Smart Contracts',
    client: 'TechRebel Chapter Bolivia',
    totalUSDC: 250.0,
    feeUSDC: 1.25,
    netUSDC: 248.75,
    status: 'COMPLETED',
    settlementTxHash: '8f73b9e82047d2fka912837bc9910248cba00184719283746192837465910293',
    createdAt: '30 Sep 2026, 21:15',
  },
  {
    id: 'stl-3',
    orderId: 'ORD-8923',
    concept: 'Cobro B2B - Distribuidora Andina La Paz',
    client: 'Distribuidora Andina',
    totalUSDC: 85.0,
    feeUSDC: 0.42,
    netUSDC: 84.58,
    status: 'PENDING',
    settlementTxHash: '4a1b9c2837461829374619283746591029384719283746192837465910293847',
    createdAt: 'Hoy, 09:20',
  },
];

export const INITIAL_MESSAGES: Record<string, Message[]> = {
  'chan-1': [
    {
      id: 'm-1',
      channelId: 'chan-1',
      author: TEAM_MEMBERS[1],
      content: '¡Bienvenidos a Kosmovia! Arrancamos oficialmente con la nueva paleta turquesa y enfoque B2B.',
      createdAt: '19:10',
    },
    {
      id: 'm-2',
      channelId: 'chan-1',
      author: TEAM_MEMBERS[2],
      content: 'Excelente, ya dejamos planteada la infraestructura en Firebase y Polar para billetera y pagos.',
      createdAt: '19:12',
    },
    {
      id: 'm-3',
      channelId: 'chan-1',
      author: TEAM_MEMBERS[3],
      content: 'El diseño con turquesa, negro y blanco se ve mucho más profesional y vivo para la demo del viernes.',
      createdAt: '19:14',
    },
    {
      id: 'm-4',
      channelId: 'chan-1',
      author: INITIAL_USER,
      content: '¡Exacto! El frontend ya tiene la landing, acceso con KYC y este cliente web listo.',
      createdAt: '19:15',
    },
  ],
  'chan-4': [
    {
      id: 'm-401',
      channelId: 'chan-4',
      author: TEAM_MEMBERS[1],
      content: '¡Hola a toda la comunidad de Stellar Elite Bolivia! 🇧🇴 Bienvenidos a la coordinación.',
      createdAt: '10:00',
    },
    {
      id: 'm-402',
      channelId: 'chan-4',
      author: INITIAL_USER,
      content: '¡Buenas! Con el frontend listo podemos probar transferencias y emisión de pagos en testnet.',
      createdAt: '10:04',
    },
    {
      id: 'm-403',
      channelId: 'chan-4',
      author: TEAM_MEMBERS[2],
      content: 'Excelente, los smart contracts de Soroban ya están desplegados para las liquidaciones B2B.',
      createdAt: '10:08',
    },
  ],
  'chan-7': [
    {
      id: 'm-701',
      channelId: 'chan-7',
      author: TEAM_MEMBERS[1],
      content: 'Canal de cobros para empresas bolivianas. Cada orden emitida deduce 0.5% de fee y se liquida en USDC.',
      createdAt: '09:00',
    },
    {
      id: 'm-702',
      channelId: 'chan-7',
      author: INITIAL_USER,
      content: '[COBRO_B2B:{"amount":75,"concept":"Factura #205 - Servicios Cloud & Pasarela B2B"}]',
      createdAt: '09:15',
    },
  ],
};
