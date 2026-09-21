'use client';

import React, { useState } from 'react';
import { CommunityBar } from '../components/CommunityBar';
import { ChannelList } from '../components/ChannelList';
import { ChatArea } from '../components/ChatArea';
import { Community, Message, User } from '../types';

const CURRENT_USER: User = {
  id: 'usr-1',
  username: '@victor',
  displayName: 'Victor',
  role: 'builder',
  isOnline: true,
};

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
  },
  {
    id: 'comm-3',
    name: 'Builders Club',
    slug: 'builders',
    icon: '⚡',
    description: 'Espacio para builders creando mini apps y herramientas.',
    channels: [
      { id: 'chan-7', communityId: 'comm-3', name: 'showcase', topic: 'Muestra lo que estás construyendo', type: 'text' },
      { id: 'chan-8', communityId: 'comm-3', name: 'feedback', topic: 'Pedí y da feedback de producto', type: 'text' },
    ],
  },
];

const INITIAL_MESSAGES: Record<string, Message[]> = {
  'chan-1': [
    {
      id: 'm-1',
      channelId: 'chan-1',
      author: {
        id: 'usr-2',
        username: '@alejandro',
        displayName: 'Alejandro',
        role: 'admin',
      },
      content: '¡Bienvenidos a Kosmovia! Arrancamos oficialmente la Etapa A con base social.',
      createdAt: '19:10',
    },
    {
      id: 'm-2',
      channelId: 'chan-1',
      author: {
        id: 'usr-3',
        username: '@roberto',
        displayName: 'Roberto',
        role: 'builder',
      },
      content: 'Buenas gente, ya preparando la base de datos y esquemas para el tiempo real en Supabase.',
      createdAt: '19:12',
    },
    {
      id: 'm-3',
      channelId: 'chan-1',
      author: {
        id: 'usr-4',
        username: '@carla',
        displayName: 'Carla',
        role: 'member',
      },
      content: 'Genial! Ya estoy terminando de pulir los componentes de Figma para compartirlos con Victor.',
      createdAt: '19:14',
    },
    {
      id: 'm-4',
      channelId: 'chan-1',
      author: CURRENT_USER,
      content: '¡Excelente! Ya tenemos la base del cliente web en app funcionando y mobile-first.',
      createdAt: '19:15',
    },
  ],
};

export default function AppHomePage() {
  const [communities] = useState<Community[]>(INITIAL_COMMUNITIES);
  const [activeCommunityId, setActiveCommunityId] = useState<string>('comm-1');
  const [activeChannelId, setActiveChannelId] = useState<string>('chan-1');
  const [messagesByChannel, setMessagesByChannel] = useState<Record<string, Message[]>>(INITIAL_MESSAGES);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

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
    setIsMobileOpen(false); // Cierra el menú en móvil al seleccionar canal
  };

  const handleSendMessage = (text: string) => {
    const newMessage: Message = {
      id: `m-${Date.now()}`,
      channelId: activeChannel.id,
      author: CURRENT_USER,
      content: text,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessagesByChannel((prev) => ({
      ...prev,
      [activeChannel.id]: [...(prev[activeChannel.id] || []), newMessage],
    }));
  };

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
        currentUser={CURRENT_USER}
      />

      <ChatArea
        channel={activeChannel}
        community={activeCommunity}
        messages={messagesByChannel[activeChannel.id] || []}
        onSendMessage={handleSendMessage}
        onToggleMobileMenu={() => setIsMobileOpen((prev) => !prev)}
      />
    </div>
  );
}
