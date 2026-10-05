export interface User {
  id: string;
  username: string; // e.g. "@victor"
  displayName: string;
  avatar?: string;
  role?: 'admin' | 'builder' | 'member';
  isOnline?: boolean;
  bio?: string;
  statusText?: string;
  // Campos de core (mismo contrato que core/types/index.ts)
  wallet?: string; // dirección Stellar (G...)
  trustLevel?: 0 | 1 | 2; // 0 wallet · 1 social (X verificado) · 2 empresa
}

export interface Channel {
  id: string;
  communityId: string;
  name: string; // e.g. "general"
  topic?: string;
  type: 'text' | 'announcement';
}

export interface Community {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  channels: Channel[];
  members: User[];
}

export interface Message {
  id: string;
  channelId: string;
  author: User;
  content: string;
  createdAt: string;
}

export interface WalletTransaction {
  id: string;
  type: 'sent' | 'received';
  counterparty: string; // e.g. "@roberto"
  amount: number;
  asset: 'USDC' | 'XLM';
  timestamp: string;
  hash: string;
}

export interface SettlementRecord {
  id: string;
  orderId: string;
  concept: string;
  client: string;
  totalUSDC: number;
  feeUSDC: number; // 0.5% comision pasarela
  netUSDC: number;
  status: 'COMPLETED' | 'PENDING';
  settlementTxHash: string;
  createdAt: string;
}

