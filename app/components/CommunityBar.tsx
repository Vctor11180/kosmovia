'use client';

import React from 'react';
import { Community, WalletTransaction } from '../types';
import { CommunityAvatar } from './CommunityAvatar';
import { NotificationsBell } from './NotificationsBell';

interface CommunityBarProps {
  communities: Community[];
  activeCommunityId: string;
  onSelectCommunity: (id: string) => void;
  /** "+ Crear comunidad". */
  onCreateCommunity?: () => void;
  /** Abajo: billetera, notificaciones y tema (fuera del encabezado, como en Towns). */
  onOpenWallet?: () => void;
  isWalletOpen?: boolean;
  balanceUSDC?: number;
  notifications?: { transactions: WalletTransaction[]; unread: number; onOpen: () => void };
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

/**
 * Barra izquierda: logo de Kosmovia, Mensajes directos y Explorar, las
 * comunidades donde estás (con su foto y el relieve "portal") y "+ Crear".
 * Abajo, las acciones generales: notificaciones, Mi Wallet y modo claro/oscuro.
 */
export function CommunityBar({
  communities,
  activeCommunityId,
  onSelectCommunity,
  onCreateCommunity,
  onOpenWallet,
  isWalletOpen,
  balanceUSDC,
  notifications,
  theme = 'dark',
  onToggleTheme,
}: CommunityBarProps) {
  return (
    <aside className="community-bar" aria-label="Comunidades">
      <button
        type="button"
        className="kv-rail-logo"
        title="Kosmovia"
        aria-label="Kosmovia: inicio"
        onClick={() => communities[0] && onSelectCommunity(communities[0].id)}
      >
        <svg viewBox="0 0 64 64" width="30" height="30" aria-hidden="true">
          <circle cx="32" cy="32" r="18" fill="none" stroke="currentColor" strokeWidth="5" />
          <circle cx="32" cy="32" r="5" fill="currentColor" />
        </svg>
      </button>

      <button type="button" className="kv-rail-btn" disabled title="Mensajes directos · próximamente" aria-label="Mensajes directos (próximamente)">
        💬
      </button>
      <button type="button" className="kv-rail-btn" disabled title="Explorar comunidades · próximamente" aria-label="Explorar comunidades (próximamente)">
        🧭
      </button>

      <div className="divider" />

      <nav className="kv-rail-communities" aria-label="Tus comunidades">
        {communities.map((community) => {
          const isActive = community.id === activeCommunityId;
          return (
            <button
              key={community.id}
              type="button"
              title={community.name}
              aria-label={community.name}
              aria-current={isActive ? 'page' : undefined}
              className={`community-icon-btn kv-community-btn ${isActive ? 'active' : ''}`}
              onClick={() => onSelectCommunity(community.id)}
            >
              <CommunityAvatar name={community.name} icon={community.icon} image={community.image} size={46} />
            </button>
          );
        })}
        {onCreateCommunity ? (
          <button type="button" className="kv-rail-btn kv-rail-add" onClick={onCreateCommunity} title="Crear comunidad" aria-label="Crear comunidad">
            +
          </button>
        ) : null}
      </nav>

      <div className="kv-rail-bottom">
        {notifications ? (
          <NotificationsBell
            transactions={notifications.transactions}
            unread={notifications.unread}
            onOpen={notifications.onOpen}
            placement="right"
          />
        ) : null}
        {onOpenWallet ? (
          <button
            type="button"
            className={`kv-rail-btn ${isWalletOpen ? 'active' : ''}`}
            onClick={onOpenWallet}
            aria-expanded={isWalletOpen}
            aria-label={balanceUSDC !== undefined ? `Mi Wallet: ${balanceUSDC.toFixed(2)} USDC` : 'Mi Wallet'}
            title="Mi Wallet"
          >
            👛
          </button>
        ) : null}
        {onToggleTheme ? (
          <button
            type="button"
            className="kv-rail-btn"
            onClick={onToggleTheme}
            aria-label={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
            title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        ) : null}
      </div>
    </aside>
  );
}
