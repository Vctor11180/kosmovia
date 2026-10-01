'use client';

import React from 'react';
import { Community, User } from '../types';

interface ChannelListProps {
  community: Community;
  activeChannelId: string;
  onSelectChannel: (id: string) => void;
  currentUser: User;
  onOpenProfile?: () => void;
  onOpenCreateChannel?: () => void;
}

export function ChannelList({
  community,
  activeChannelId,
  onSelectChannel,
  currentUser,
  onOpenProfile,
  onOpenCreateChannel,
}: ChannelListProps) {
  return (
    <aside className="channel-sidebar" aria-label="Canales">
      <div className="community-header">
        <h2 className="community-title">{community.name}</h2>
      </div>

      <div className="channel-list-scroll">
        <div className="channel-category-row">
          <span className="channel-category-label">Canales de Texto</span>
          {onOpenCreateChannel && (
            <button
              type="button"
              className="btn-add-channel"
              onClick={onOpenCreateChannel}
              title="Crear un canal nuevo"
            >
              +
            </button>
          )}
        </div>
        {community.channels.map((channel) => {
          const isActive = channel.id === activeChannelId;
          return (
            <button
              key={channel.id}
              type="button"
              className={`channel-item-btn ${isActive ? 'active' : ''}`}
              onClick={() => onSelectChannel(channel.id)}
            >
              <span className="channel-hash">#</span>
              <span>{channel.name}</span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="user-profile-bar"
        onClick={onOpenProfile}
        title="Ver y editar mi perfil"
      >
        <div className="user-avatar-badge">
          {currentUser.displayName.charAt(0)}
          <span className="status-dot" />
        </div>
        <div className="user-info">
          <span className="user-name">{currentUser.displayName}</span>
          <span className="user-tag">{currentUser.username}</span>
        </div>
        <span className="user-gear-icon">⚙️</span>
      </button>
    </aside>
  );
}
