'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CommunityBar } from '../../components/CommunityBar';
import { ChannelList } from '../../components/ChannelList';
import { ChatArea } from '../../components/ChatArea';
import { MemberList } from '../../components/MemberList';
import { ProfileModal } from '../../components/ProfileModal';
import { WalletDrawer } from '../../components/WalletDrawer';
import { CreateChannelModal } from '../../components/CreateChannelModal';
import { QuickInvoiceModal } from '../../components/QuickInvoiceModal';
import { Channel, Community, Message, User, WalletTransaction } from '../../types';

const INITIAL_USER: User = {
  id: 'usr-1',
  username: '@victor',
  displayName: 'Victor',
  role: 'builder',
  isOnline: true,
  bio: 'Frontend Lead & Builder en Kosmovia.',
};

const TEAM_MEMBERS: User[] = [
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

const INITIAL_COMMUNITIES: Community[] = [
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

const INITIAL_TRANSACTIONS: WalletTransaction[] = [
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

const INITIAL_MESSAGES: Record<string, Message[]> = {
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
};

export default function PlataformaPage() {
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USER);
  const [communities, setCommunities] = useState<Community[]>(INITIAL_COMMUNITIES);
  const [activeCommunityId, setActiveCommunityId] = useState<string>('comm-1');
  const [activeChannelId, setActiveChannelId] = useState<string>('chan-1');
  const [messagesByChannel, setMessagesByChannel] = useState<Record<string, Message[]>>(INITIAL_MESSAGES);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [isMemberListOpen, setIsMemberListOpen] = useState<boolean>(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  // Tema Claro / Oscuro (Turquesa + Negro/Blanco)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Modales de creación de canal y cobro B2B
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState<boolean>(false);
  const [isQuickInvoiceOpen, setIsQuickInvoiceOpen] = useState<boolean>(false);

  // Estados de Billetera Stellar
  const [isWalletOpen, setIsWalletOpen] = useState<boolean>(false);
  const [balanceUSDC, setBalanceUSDC] = useState<number>(185.0);
  const [balanceXLM] = useState<number>(42.8);
  const [publicKey] = useState<string>('GD26UBYVEYYVVOVCMOLPMIKPWQRFV34LK3I7LHBNTUGYHYIKFMEREH2A');
  const [transactions, setTransactions] = useState<WalletTransaction[]>(INITIAL_TRANSACTIONS);

  // Sincronizar tema con atributo en documentElement
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const activeCommunity = communities.find((c) => c.id === activeCommunityId) || communities[0];
  const activeChannel = activeCommunity.channels.find((ch) => ch.id === activeChannelId) || activeCommunity.channels[0];

  const handleSelectCommunity = (communityId: string) => {
    setActiveCommunityId(communityId);
    const targetCommunity = communities.find((c) => c.id === communityId);
    if (targetCommunity && targetCommunity.channels.length > 0) {
      setActiveChannelId(targetCommunity.channels[0].id);
    }
  };

  const handleSelectChannel = (channelId: string) => {
    setActiveChannelId(channelId);
    setIsMobileOpen(false);
  };

  const handleSendMessage = (text: string) => {
    const newMessage: Message = {
      id: `m-${Date.now()}`,
      channelId: activeChannel.id,
      author: currentUser,
      content: text,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessagesByChannel((prev) => ({
      ...prev,
      [activeChannel.id]: [...(prev[activeChannel.id] || []), newMessage],
    }));
  };

  const handleCreateChannel = (name: string, topic: string) => {
    const newChannel: Channel = {
      id: `chan-${Date.now()}`,
      communityId: activeCommunity.id,
      name,
      topic: topic || 'Canal creado por la comunidad',
      type: 'text',
    };

    setCommunities((prev) =>
      prev.map((c) =>
        c.id === activeCommunity.id
          ? { ...c, channels: [...c.channels, newChannel] }
          : c
      )
    );

    setActiveChannelId(newChannel.id);

    const welcomeMsg: Message = {
      id: `m-init-${Date.now()}`,
      channelId: newChannel.id,
      author: currentUser,
      content: `🎉 Canal #${name} creado con éxito. ¡Inicia la conversación!`,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessagesByChannel((prev) => ({
      ...prev,
      [newChannel.id]: [welcomeMsg],
    }));
  };

  const handleCreateInvoice = (amount: number, concept: string) => {
    const payload = JSON.stringify({ amount, concept });
    handleSendMessage(`[COBRO_B2B:${payload}]`);
  };

  const handlePayInvoice = (amount: number, concept: string) => {
    setBalanceUSDC((prev) => Math.max(0, prev - amount));

    const newTx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      type: 'sent',
      counterparty: `#${activeChannel.name}`,
      amount,
      asset: 'USDC',
      timestamp: 'Ahora mismo',
      hash: '6be268a284eee59916485c32eadc2d89d092c1b14c60443969cb504996147181',
    };

    setTransactions((prev) => [newTx, ...prev]);

    const paidMsg: Message = {
      id: `m-pay-inv-${Date.now()}`,
      channelId: activeChannel.id,
      author: currentUser,
      content: `✅ Cobro saldado: ${amount} USDC por "${concept}". Transacción confirmada en Stellar Testnet.`,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessagesByChannel((prev) => ({
      ...prev,
      [activeChannel.id]: [...(prev[activeChannel.id] || []), paidMsg],
    }));
  };

  const handleUpdateProfile = (updated: { displayName: string; bio: string }) => {
    setCurrentUser((prev) => ({
      ...prev,
      displayName: updated.displayName,
      bio: updated.bio,
    }));
  };

  const handleSendPayment = (to: string, amount: number, asset: 'USDC' | 'XLM') => {
    if (asset === 'USDC') {
      setBalanceUSDC((prev) => Math.max(0, prev - amount));
    }

    const newTx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      type: 'sent',
      counterparty: to,
      amount,
      asset,
      timestamp: 'Ahora mismo',
      hash: '6be268a284eee59916485c32eadc2d89d092c1b14c60443969cb504996147181',
    };

    setTransactions((prev) => [newTx, ...prev]);

    const paymentMsg: Message = {
      id: `m-pay-${Date.now()}`,
      channelId: activeChannel.id,
      author: currentUser,
      content: `💸 He transferido ${amount} ${asset} a ${to} mediante Stellar Testnet (Tx verificada).`,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessagesByChannel((prev) => ({
      ...prev,
      [activeChannel.id]: [...(prev[activeChannel.id] || []), paymentMsg],
    }));
  };

  const currentMembers = (activeCommunity.members || []).map((m) =>
    m.id === currentUser.id ? { ...m, ...currentUser } : m
  );

  return (
    <div className={`app-container ${isMobileOpen ? 'mobile-open' : ''}`}>
      <div
        className="mobile-backdrop"
        onClick={() => setIsMobileOpen(false)}
        aria-hidden="true"
      />

      <CommunityBar
        communities={communities}
        activeCommunityId={activeCommunity.id}
        onSelectCommunity={handleSelectCommunity}
      />

      <ChannelList
        community={activeCommunity}
        activeChannelId={activeChannel.id}
        onSelectChannel={handleSelectChannel}
        currentUser={currentUser}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenCreateChannel={() => setIsCreateChannelOpen(true)}
      />

      <ChatArea
        channel={activeChannel}
        community={activeCommunity}
        messages={messagesByChannel[activeChannel.id] || []}
        onSendMessage={handleSendMessage}
        onToggleMobileMenu={() => setIsMobileOpen((prev) => !prev)}
        onToggleMemberList={() => setIsMemberListOpen((prev) => !prev)}
        isMemberListOpen={isMemberListOpen}
        onOpenWallet={() => setIsWalletOpen(true)}
        balanceUSDC={balanceUSDC}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenQuickInvoice={() => setIsQuickInvoiceOpen(true)}
        onPayInvoice={handlePayInvoice}
      />

      <MemberList
        members={currentMembers}
        isOpen={isMemberListOpen}
      />

      <ProfileModal
        user={currentUser}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSave={handleUpdateProfile}
        stellarAddress={publicKey}
      />

      <WalletDrawer
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        balanceUSDC={balanceUSDC}
        balanceXLM={balanceXLM}
        publicKey={publicKey}
        transactions={transactions}
        onSend={handleSendPayment}
      />

      <CreateChannelModal
        isOpen={isCreateChannelOpen}
        onClose={() => setIsCreateChannelOpen(false)}
        onCreate={handleCreateChannel}
      />

      <QuickInvoiceModal
        isOpen={isQuickInvoiceOpen}
        onClose={() => setIsQuickInvoiceOpen(false)}
        onSubmit={handleCreateInvoice}
      />
    </div>
  );
}
