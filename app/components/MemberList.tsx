'use client';

import React from 'react';
import { User } from '../types';

interface MemberListProps {
  members: User[];
  isOpen: boolean;
}

export function MemberList({ members, isOpen }: MemberListProps) {
  if (!isOpen) return null;

  const onlineMembers = members.filter((m) => m.isOnline);
  const offlineMembers = members.filter((m) => !m.isOnline);

  return (
    <aside className="member-sidebar" aria-label="Miembros de la comunidad">
      <div className="member-section-header">
        EN LÍNEA — {onlineMembers.length}
      </div>
      <div className="member-list">
        {onlineMembers.map((member) => (
          <div key={member.id} className="member-item">
            <div className="member-avatar-wrapper">
              <div className="member-avatar">
                {member.displayName.charAt(0)}
              </div>
              <span className="member-status-dot online" />
            </div>
            <div className="member-details">
              <div className="member-name-row">
                <span className="member-name">{member.displayName}</span>
                {member.role && (
                  <span className={`role-badge ${member.role}`}>
                    {member.role}
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
              <div key={member.id} className="member-item offline">
                <div className="member-avatar-wrapper">
                  <div className="member-avatar">
                    {member.displayName.charAt(0)}
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
