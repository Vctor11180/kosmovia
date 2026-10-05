'use client';

import React, { useState } from 'react';
import { slugify } from '../lib/image-resize';
import { CommunityPhotoPicker } from './CommunityPhotoPicker';

interface CreateCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** true si se creó; false deja el modal abierto (el error lo muestra la página). */
  onCreate: (input: { name: string; slug: string; description: string; image?: string }) => Promise<boolean>;
}

/** Crear una comunidad con su foto, con el estilo de los modales de la app. */
export function CreateCommunityModal({ isOpen, onClose, onCreate }: CreateCommunityModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;
  const slug = slugify(name);
  const valid = name.trim().length >= 2 && name.trim().length <= 50 && slug.length >= 3;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || saving) return;
    setSaving(true);
    const ok = await onCreate({ name: name.trim(), slug, description: description.trim(), image: image ?? undefined });
    setSaving(false);
    if (!ok) return;
    setName('');
    setDescription('');
    setImage(null);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Crear comunidad">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h3 className="modal-title">Crear comunidad</h3>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </header>
        <form onSubmit={submit} className="modal-body">
          <CommunityPhotoPicker name={name} value={image} onChange={setImage} />
          <div className="form-group">
            <label className="form-label" htmlFor="cc-name">Nombre</label>
            <input
              id="cc-name"
              type="text"
              className="form-input"
              maxLength={50}
              placeholder="ej: Builders de La Paz"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
            />
            <span className="form-hint">{slug ? `Enlace: kosmovia/${slug}` : 'De 2 a 50 caracteres.'}</span>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="cc-desc">Descripción (opcional)</label>
            <input
              id="cc-desc"
              type="text"
              className="form-input"
              maxLength={280}
              placeholder="¿De qué se trata?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={!valid || saving}>
              {saving ? 'Creando…' : 'Crear comunidad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
