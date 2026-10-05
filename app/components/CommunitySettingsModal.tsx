'use client';

import React, { useEffect, useState } from 'react';
import { Community, User } from '../types';
import { AvatarFace } from './AvatarFace';
import { CommunityPhotoPicker } from './CommunityPhotoPicker';

type AssignableRole = 'admin' | 'moderator' | 'member';
type MyRole = User['role'];

interface CommunitySettingsModalProps {
  community: Community;
  isOpen: boolean;
  onClose: () => void;
  /** Tu rol en esta comunidad: owner ve todo; admin, roles de moderador/miembro y canales. */
  myRole: MyRole;
  currentUserId: string;
  onSaveImage: (image: string | null) => Promise<boolean>;
  onChangeRole: (profileId: string, role: AssignableRole) => Promise<boolean>;
  onDeleteChannel: (channelId: string) => Promise<boolean>;
  onDeleteCommunity: () => Promise<boolean>;
}

const ROLE_LABEL: Record<string, string> = { owner: 'Dueño', admin: 'Admin', moderator: 'Moderador', member: 'Miembro', builder: 'Miembro' };

/**
 * Configuración de la comunidad (dueño o admin), con el estilo de los modales:
 * Foto · Roles · Canales · Borrar (solo el dueño). El servidor vuelve a revisar
 * cada permiso; aquí solo se muestran las opciones que tu rol puede usar.
 */
export function CommunitySettingsModal({
  community,
  isOpen,
  onClose,
  myRole,
  currentUserId,
  onSaveImage,
  onChangeRole,
  onDeleteChannel,
  onDeleteCommunity,
}: CommunitySettingsModalProps) {
  const isOwner = myRole === 'owner';
  const [tab, setTab] = useState<'photo' | 'roles' | 'channels' | 'delete'>('photo');
  const [image, setImage] = useState<string | null>(community.image ?? null);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmChannel, setConfirmChannel] = useState<string | null>(null);
  const [confirmName, setConfirmName] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setImage(community.image ?? null);
    setTab('photo');
    setConfirmChannel(null);
    setConfirmName('');
  }, [isOpen, community.id, community.image]);

  if (!isOpen) return null;
  const photoChanged = (image ?? null) !== (community.image ?? null);

  /** Qué roles puede darle tu rol a esta persona (vacío = no puedes cambiarla). */
  const optionsFor = (member: User): AssignableRole[] => {
    if (member.id === currentUserId || member.role === 'owner') return [];
    if (isOwner) return ['admin', 'moderator', 'member'];
    if (myRole === 'admin' && member.role !== 'admin') return ['moderator', 'member'];
    return [];
  };

  const run = async (key: string, fn: () => Promise<boolean>) => {
    setBusy(key);
    const ok = await fn();
    setBusy(null);
    return ok;
  };

  const tabs: { id: typeof tab; label: string }[] = [
    { id: 'photo', label: 'Foto' },
    { id: 'roles', label: 'Roles' },
    { id: 'channels', label: 'Canales' },
    ...(isOwner ? [{ id: 'delete' as const, label: 'Borrar' }] : []),
  ];

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label={`Configuración de ${community.name}`}>
      <div className="modal-card profile-settings-card" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <div className="settings-header-title">
            <h3 className="modal-title">Configuración</h3>
            <span className="user-tag">{community.name}</span>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </header>

        <div className="settings-tabs" role="tablist">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={`settings-tab-btn ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'photo' && (
          <div className="modal-body">
            <CommunityPhotoPicker name={community.name} value={image} onChange={setImage} />
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cerrar
              </button>
              <button
                type="button"
                className="btn-primary"
                disabled={!photoChanged || busy !== null}
                onClick={() => void run('photo', () => onSaveImage(image))}
              >
                {busy === 'photo' ? 'Guardando…' : 'Guardar foto'}
              </button>
            </div>
          </div>
        )}

        {tab === 'roles' && (
          <div className="modal-body">
            <p className="settings-tab-desc">
              {isOwner
                ? 'Como dueño puedes nombrar admins, moderadores y miembros.'
                : 'Como admin puedes cambiar a moderadores y miembros. Solo el dueño nombra admins.'}
            </p>
            <div className="kv-settings-list">
              {community.members.map((m) => {
                const options = optionsFor(m);
                return (
                  <div key={m.id} className="kv-settings-row">
                    <div className="member-avatar" style={{ width: 34, height: 34, flexShrink: 0 }}>
                      <AvatarFace avatar={m.avatar} name={m.displayName} />
                    </div>
                    <div className="kv-settings-row-text">
                      <span className="member-name">{m.displayName}</span>
                      <span className="member-tag">{m.username}</span>
                    </div>
                    {options.length === 0 ? (
                      <span className={`role-badge ${m.role ?? 'member'}`}>{ROLE_LABEL[m.role ?? 'member']}</span>
                    ) : (
                      <select
                        className="form-select kv-role-select"
                        aria-label={`Rol de ${m.username}`}
                        value={m.role === 'admin' || m.role === 'moderator' ? m.role : 'member'}
                        disabled={busy !== null}
                        onChange={(e) => void run(`role:${m.id}`, () => onChangeRole(m.id, e.target.value as AssignableRole))}
                      >
                        {(['admin', 'moderator', 'member'] as AssignableRole[])
                          .filter((r) => options.includes(r) || r === m.role)
                          .map((r) => (
                            <option key={r} value={r} disabled={!options.includes(r)}>
                              {ROLE_LABEL[r]}
                            </option>
                          ))}
                      </select>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'channels' && (
          <div className="modal-body">
            <p className="settings-tab-desc">Borrar un canal borra todos sus mensajes. #general no se puede borrar.</p>
            <div className="kv-settings-list">
              {community.channels.map((ch) => (
                <div key={ch.id} className="kv-settings-row">
                  <span className="channel-hash">#</span>
                  <div className="kv-settings-row-text">
                    <span className="member-name">{ch.name}</span>
                    {ch.topic ? <span className="member-tag">{ch.topic}</span> : null}
                  </div>
                  {ch.name === 'general' ? (
                    <span className="member-tag">Protegido</span>
                  ) : confirmChannel === ch.id ? (
                    <span style={{ display: 'flex', gap: 6 }}>
                      <button type="button" className="btn-secondary" onClick={() => setConfirmChannel(null)} disabled={busy !== null}>
                        No
                      </button>
                      <button
                        type="button"
                        className="kv-danger-btn"
                        disabled={busy !== null}
                        onClick={() =>
                          void run(`ch:${ch.id}`, () => onDeleteChannel(ch.id)).then((ok) => ok && setConfirmChannel(null))
                        }
                      >
                        {busy === `ch:${ch.id}` ? 'Borrando…' : 'Sí, borrar'}
                      </button>
                    </span>
                  ) : (
                    <button type="button" className="kv-danger-btn ghost" onClick={() => setConfirmChannel(ch.id)}>
                      Borrar
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'delete' && isOwner && (
          <div className="modal-body">
            <div className="kv-danger-zone">
              <strong>Borrar {community.name}</strong>
              <p className="settings-tab-desc" style={{ margin: 0 }}>
                Se borran sus canales y todos los mensajes, y nadie más podrá entrar. No se puede deshacer. Los pagos en la red no se
                tocan.
              </p>
              <label className="form-label" htmlFor="kv-confirm-name">
                Escribe <b>{community.name}</b> para confirmar
              </label>
              <input
                id="kv-confirm-name"
                type="text"
                className="form-input"
                autoComplete="off"
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
              />
              <button
                type="button"
                className="kv-danger-btn"
                disabled={confirmName.trim() !== community.name || busy !== null}
                onClick={() => void run('delete', onDeleteCommunity).then((ok) => ok && onClose())}
              >
                {busy === 'delete' ? 'Borrando…' : 'Borrar comunidad para siempre'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
