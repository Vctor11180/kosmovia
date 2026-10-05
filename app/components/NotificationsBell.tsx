'use client';

import React, { useEffect, useRef, useState } from 'react';
import { WalletTransaction } from '../types';

interface NotificationsBellProps {
  /** Pagos enviados y recibidos, más nuevos primero. */
  transactions: WalletTransaction[];
  /** Cuántos llegaron desde la última vez que abriste la campana. */
  unread: number;
  /** Se llama al abrir: marca todo como visto. */
  onOpen: () => void;
}

/**
 * Campana del encabezado: el número son los movimientos nuevos (enviados y
 * recibidos) y al abrirla se ve la lista, con los mismos estilos de la
 * actividad de Mi Wallet.
 */
export function NotificationsBell({ transactions, unread, onOpen }: NotificationsBellProps) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const toggle = () => {
    if (!open) onOpen();
    setOpen((prev) => !prev);
  };

  const recent = transactions.slice(0, 15);

  return (
    <div ref={boxRef} style={{ position: 'relative' }}>
      <button
        type="button"
        className={`header-icon-btn ${open ? 'active' : ''}`}
        onClick={toggle}
        aria-label={unread > 0 ? `Notificaciones: ${unread} nuevas` : 'Notificaciones'}
        aria-expanded={open}
        title="Notificaciones de pagos"
        style={{ position: 'relative' }}
      >
        🔔
        {unread > 0 ? (
          <span className="tab-pending-badge" style={{ position: 'absolute', top: -6, right: -6 }}>
            {unread > 9 ? '9+' : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Notificaciones de pagos"
          className="wallet-drawer"
          style={{
            position: 'absolute',
            top: 40,
            right: 0,
            width: 'min(340px, 86vw)',
            height: 'auto',
            maxHeight: '60vh',
            overflowY: 'auto',
            zIndex: 100,
            borderRadius: 12,
            border: '1px solid var(--line)',
            animation: 'none',
          }}
        >
          <div className="wallet-tx-section" style={{ padding: 14 }}>
            <h3 className="wallet-tx-title">Notificaciones</h3>
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
                        Explorer ↗
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
