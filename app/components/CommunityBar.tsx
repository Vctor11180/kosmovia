'use client';

import React from 'react';
import { Community } from '../types';

interface CommunityBarProps {
  communities: Community[];
  activeCommunityId: string;
  onSelectCommunity: (id: string) => void;
}

export function CommunityBar({
  communities,
  activeCommunityId,
  onSelectCommunity,
}: CommunityBarProps) {
  return (
    <aside className="community-bar" aria-label="Comunidades">
      <button
        type="button"
        title="Inicio Kosmovia"
        className={`community-icon-btn ${activeCommunityId === communities[0]?.id ? 'active' : ''}`}
        onClick={() => communities[0] && onSelectCommunity(communities[0].id)}
      >
        🌌
      </button>

      <div className="divider" />

      {communities.slice(1).map((community) => {
        const isActive = community.id === activeCommunityId;
        return (
          <button
            key={community.id}
            type="button"
            title={community.name}
            className={`community-icon-btn ${isActive ? 'active' : ''}`}
            onClick={() => onSelectCommunity(community.id)}
          >
            {community.icon}
          </button>
        );
      })}
    </aside>
  );
}
