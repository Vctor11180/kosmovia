'use client';

import React from 'react';
import { WalletTransaction } from '../types';

/**
 * Notificaciones de pagos en el panel derecho (como Miembros): queda abierto
 * mientras sigues chateando. Mismos estilos que la actividad de Mi Wallet.
 */
export function NotificationsPanel({ transactions, onClose }: { transactions: WalletTransaction[]; onClose: () => void }) {
  const recent = transactions.slice(0, 30);
  return (
    <aside className="member-sidebar kv-docked-panel" aria-label="Notificaciones de pagos">
      <div className="kv-panel-head">
        <div className="kv-panel-head-title">
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
          <span className="member-section-header" style={{ padding: 0, margin: 0, fontSize: '13px', fontWeight: 700 }}>
            Notificaciones
          </span>
        </div>
        <button
          type="button"
          className="wallet-close-btn"
          onClick={onClose}
          onTouchEnd={(e) => {
            e.preventDefault();
            onClose();
          }}
          aria-label="Cerrar notificaciones"
          title="Cerrar"
        >
          ✕
        </button>
      </div>
      <div className="wallet-tx-list">
        {recent.length === 0 ? (
          <p className="wallet-empty-text">Todavía no hay pagos. Cuando envíes o recibas dinero, aparece aquí.</p>
        ) : (
          recent.map((tx) => (
            <div key={tx.id} className="wallet-tx-item">
              <div className={`wallet-tx-icon ${tx.type}`}>{tx.type === 'sent' ? '↗' : '↙'}</div>
              <div className="wallet-tx-info">
                <span className="wallet-tx-user">
                  {tx.type === 'sent' ? `Enviaste a ${tx.counterparty}` : `Recibiste de ${tx.counterparty}`}
                </span>
                <span className="wallet-tx-time">{tx.timestamp}</span>
              </div>
              <div className="wallet-tx-amount-col">
                <span className={`wallet-tx-amount ${tx.type}`}>
                  {tx.type === 'sent' ? '-' : '+'}
                  {tx.amount} {tx.asset}
                </span>
                <a
                  href={`https://stellar.expert/explorer/testnet/tx/${tx.hash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="wallet-explorer-link"
                >
                  Ver en la red ↗
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
