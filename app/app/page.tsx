'use client';

import React, { useState } from 'react';
import { CommunityBar } from '../components/CommunityBar';
import { ChannelList } from '../components/ChannelList';
import { ChatArea } from '../components/ChatArea';
import { MemberList } from '../components/MemberList';
import { ProfileModal } from '../components/ProfileModal';
import { Community, Message, User } from '../types';

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
    name: 'Builders Club',
    slug: 'builders',
    icon: '⚡',
    description: 'Espacio para builders creando mini apps y herramientas.',
    channels: [
      { id: 'chan-7', communityId: 'comm-3', name: 'showcase', topic: 'Muestra lo que estás construyendo', type: 'text' },
      { id: 'chan-8', communityId: 'comm-3', name: 'feedback', topic: 'Pedí y da feedback de producto', type: 'text' },
    ],
    members: [INITIAL_USER, TEAM_MEMBERS[1], TEAM_MEMBERS[3]],
  },
];

const INITIAL_MESSAGES: Record<string, Message[]> = {
  'chan-1': [
    {
      id: 'm-1',
      channelId: 'chan-1',
      author: TEAM_MEMBERS[1],
      content: '¡Bienvenidos a Kosmovia! Arrancamos oficialmente la Etapa A con base social.',
      createdAt: '19:10',
    },
    {
      id: 'm-2',
      channelId: 'chan-1',
      author: TEAM_MEMBERS[2],
      content: 'Buenas gente, ya preparando la base de datos y esquemas para el tiempo real en Supabase.',
      createdAt: '19:12',
    },
    {
      id: 'm-3',
      channelId: 'chan-1',
      author: TEAM_MEMBERS[3],
      content: 'Genial! Ya estoy terminando de pulir los componentes de Figma para compartirlos con Victor.',
      createdAt: '19:14',
    },
    {
      id: 'm-4',
      channelId: 'chan-1',
      author: INITIAL_USER,
      content: '¡Excelente! Ya tenemos la base del cliente web en app funcionando y mobile-first.',
      createdAt: '19:15',
    },
  ],
};

export default function AppHomePage() {
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USER);
  const [communities] = useState<Community[]>(INITIAL_COMMUNITIES);
  const [activeCommunityId, setActiveCommunityId] = useState<string>('comm-1');
  const [activeChannelId, setActiveChannelId] = useState<string>('chan-1');
  const [messagesByChannel, setMessagesByChannel] = useState<Record<string, Message[]>>(INITIAL_MESSAGES);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [isMemberListOpen, setIsMemberListOpen] = useState<boolean>(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

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

  const handleUpdateProfile = (updated: { displayName: string; bio: string }) => {
    setCurrentUser((prev) => ({
      ...prev,
      displayName: updated.displayName,
      bio: updated.bio,
    }));
  };

  // Actualizar el usuario actual dentro de la lista de miembros de la comunidad activa
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
      />

      <ChatArea
        channel={activeChannel}
        community={activeCommunity}
        messages={messagesByChannel[activeChannel.id] || []}
        onSendMessage={handleSendMessage}
        onToggleMobileMenu={() => setIsMobileOpen((prev) => !prev)}
        onToggleMemberList={() => setIsMemberListOpen((prev) => !prev)}
        isMemberListOpen={isMemberListOpen}
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
      />
    </div>
  );
}
