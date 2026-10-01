'use client';

import React, { useState } from 'react';
import { User } from '../types';

interface ProfileModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: { displayName: string; bio: string }) => void;
}

export function ProfileModal({
  user,
  isOpen,
  onClose,
  onSave,
}: ProfileModalProps) {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio || 'Desarrollador en el ecosistema Stellar.');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ displayName, bio });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h3 className="modal-title">Perfil de Usuario</h3>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </header>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="profile-banner">
            <div className="profile-avatar-large">
              {displayName.charAt(0)}
              <span className="profile-online-badge" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Identidad Kosmovia (@usuario)</label>
            <input
              type="text"
              className="form-input readonly"
              value={user.username}
              disabled
              title="El usuario no se puede cambiar"
            />
            <span className="form-hint">Tu identificador único en la red.</span>
          </div>

          <div className="form-group">
            <label className="form-label">Nombre visible</label>
            <input
              type="text"
              className="form-input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Biografía</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Contanos qué estás construyendo en Kosmovia..."
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
