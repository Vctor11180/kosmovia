'use client';

import React, { useState } from 'react';

interface QuickInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number, concept: string) => void;
}

export function QuickInvoiceModal({
  isOpen,
  onClose,
  onSubmit,
}: QuickInvoiceModalProps) {
  const [amount, setAmount] = useState('25');
  const [concept, setConcept] = useState('Servicios de Desarrollo B2B');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return;
    onSubmit(num, concept.trim());
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h3 className="modal-title">Emitir Solicitud de Cobro (B2B)</h3>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </header>

        <form onSubmit={handleSubmit} className="modal-body">
          <p className="settings-tab-desc">
            Crea una tarjeta de pago en Stellar (USDC) visible para los miembros de este canal.
          </p>

          <div className="form-group">
            <label className="form-label">Monto (USDC)</label>
            <input
              type="number"
              min="1"
              step="0.5"
              className="form-input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Concepto o Detalle de Factura</label>
            <input
              type="text"
              className="form-input"
              placeholder="ej: Factura #204 - Bienes Raíces / Concesionaria"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={!amount}
            >
              Publicar Cobro en Chat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
