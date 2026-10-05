'use client';

import React, { useEffect, useState } from 'react';
import { Community } from '../types';
import { CommunityPhotoPicker } from './CommunityPhotoPicker';

/** Configuración de la comunidad (solo dueño). Por ahora: la foto. */
export function CommunitySettingsModal({
  community,
  isOpen,
  onClose,
  onSaveImage,
}: {
  community: Community;
  isOpen: boolean;
  onClose: () => void;
  onSaveImage: (image: string | null) => Promise<boolean>;
}) {
  const [image, setImage] = useState<string | null>(community.image ?? null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) setImage(community.image ?? null);
  }, [isOpen, community.image]);

  if (!isOpen) return null;
  const changed = (image ?? null) !== (community.image ?? null);

  const save = async () => {
    if (!changed || saving) return;
    setSaving(true);
    const ok = await onSaveImage(image);
    setSaving(false);
    if (ok) onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label={`Configuración de ${community.name}`}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h3 className="modal-title">Configuración · {community.name}</h3>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </header>
        <div className="modal-body">
          <CommunityPhotoPicker name={community.name} value={image} onChange={setImage} />
          <p className="form-hint">Nombre, descripción y permisos de canales llegan pronto.</p>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="button" className="btn-primary" onClick={() => void save()} disabled={!changed || saving}>
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
