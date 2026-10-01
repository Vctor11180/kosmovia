'use client';

import React, { useState } from 'react';

interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, topic: string) => void;
}

export function CreateChannelModal({
  isOpen,
  onClose,
  onCreate,
}: CreateChannelModalProps) {
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim().toLowerCase().replace(/\s+/g, '-');
    if (!cleanName) return;
    onCreate(cleanName, topic.trim());
    setName('');
    setTopic('');
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h3 className="modal-title">Crear Nuevo Canal</h3>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </header>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label className="form-label">Nombre del Canal</label>
            <div className="channel-input-wrapper" style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="ej: facturas-octubre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>
            <span className="form-hint">
              Solo letras minúsculas, números y guiones.
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Tópico o Descripción (Opcional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="ej: Pagos B2B y facturación en Bolivia"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={!name.trim()}
            >
              Crear Canal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
