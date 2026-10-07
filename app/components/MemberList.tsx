'use client';

import React from 'react';
import { User } from '../types';
import { AvatarFace } from './AvatarFace';

interface MemberListProps {
  members: User[];
  isOpen: boolean;
  /** Abre la tarjeta de perfil del miembro. */
  onOpenProfile?: (user: User) => void;
  /** Cierra el panel de miembros. */
  onClose?: () => void;
}

export function MemberList({ members, isOpen, onOpenProfile, onClose }: MemberListProps) {
  // Cada fila abre el perfil, con mouse o teclado.
  const open = (member: User) => ({
    role: 'button' as const,
    tabIndex: 0,
    style: { cursor: 'pointer' },
    title: `Ver perfil de ${member.username}`,
    onClick: () => onOpenProfile?.(member),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onOpenProfile?.(member);
      }
    },
  });
  if (!isOpen) return null;

  const onlineMembers = members.filter((m) => m.isOnline);
  const offlineMembers = members.filter((m) => !m.isOnline);

  return (
    <aside className="member-sidebar kv-docked-panel" aria-label="Miembros de la comunidad">
      <div className="kv-panel-head">
        <div className="kv-panel-head-title">
          {onClose ? (
            <button
              type="button"
              className="wallet-back-btn mobile-only"
              onClick={onClose}
              onTouchEnd={(e) => {
                e.preventDefault();
                onClose();
              }}
              aria-label="Volver al chat"
              title="Volver al chat"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
              <span>Chat</span>
            </button>
          ) : null}
          <span className="member-section-header" style={{ padding: 0, margin: 0, fontSize: '13px', fontWeight: 700 }}>
            Miembros ({members.length})
          </span>
        </div>
        {onClose ? (
          <button
            type="button"
            className="wallet-close-btn"
            onClick={onClose}
            onTouchEnd={(e) => {
              e.preventDefault();
              onClose();
            }}
            aria-label="Cerrar miembros"
            title="Cerrar"
          >
            ✕
          </button>
        ) : null}
      </div>

      <div className="member-section-header">
        EN LÍNEA — {onlineMembers.length}
      </div>
      <div className="member-list">
        {onlineMembers.map((member) => (
          <div key={member.id} className="member-item" {...open(member)}>
            <div className="member-avatar-wrapper">
              <div className="member-avatar">
                <AvatarFace avatar={member.avatar} name={member.displayName} seed={member.username || member.id} />
              </div>
              <span className="member-status-dot online" />
            </div>
            <div className="member-details">
              <div className="member-name-row">
                <span className="member-name">{member.displayName}</span>
                {member.role && member.role !== 'member' && (
                  <span className={`role-badge ${member.role}`}>
                    {{ owner: 'dueño', admin: 'admin', moderator: 'moderador', builder: 'builder' }[member.role] ?? member.role}
                  </span>
                )}
              </div>
              <span className="member-tag">{member.username}</span>
            </div>
          </div>
        ))}
      </div>

      {offlineMembers.length > 0 && (
        <>
          <div className="member-section-header">
            DESCONECTADOS — {offlineMembers.length}
          </div>
          <div className="member-list">
            {offlineMembers.map((member) => (
              <div key={member.id} className="member-item offline" {...open(member)}>
                <div className="member-avatar-wrapper">
                  <div className="member-avatar">
                    <AvatarFace avatar={member.avatar} name={member.displayName} seed={member.username || member.id} />
                  </div>
                  <span className="member-status-dot offline" />
                </div>
                <div className="member-details">
                  <div className="member-name-row">
                    <span className="member-name">{member.displayName}</span>
                  </div>
                  <span className="member-tag">{member.username}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </aside>
  );
}
