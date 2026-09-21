'use client';

import React from 'react';
import { Community, User } from '../types';

interface ChannelListProps {
  community: Community;
  activeChannelId: string;
  onSelectChannel: (id: string) => void;
  currentUser: User;
}

export function ChannelList({
  community,
  activeChannelId,
  onSelectChannel,
  currentUser,
}: ChannelListProps) {
  return (
    <aside className="channel-sidebar" aria-label="Canales">
      <div className="community-header">
        <h2 className="community-title">{community.name}</h2>
      </div>

      <div className="channel-list-scroll">
        <span className="channel-category-label">Canales de Texto</span>
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

      <div className="user-profile-bar">
        <div className="user-avatar-badge">
          {currentUser.displayName.charAt(0)}
          <span className="status-dot" />
        </div>
        <div className="user-info">
          <span className="user-name">{currentUser.displayName}</span>
          <span className="user-tag">{currentUser.username}</span>
        </div>
      </div>
    </aside>
  );
}
