'use client';

import React, { useState } from 'react';
import { User } from '../types';
import { QrCode } from './QrCode';

interface InvoiceCardProps {
  messageId: string;
  author: User;
  amount: number;
  concept: string;
  isPaid: boolean;
  isMine: boolean;
  isPaying: boolean;
  onPayDirect: () => void;
  onPayInWallet?: () => void;
}

/**
 * Tarjeta de Cobro B2B en Stellar con código QR interactivo (SEP-0007),
 * pago directo en 1 clic y opción de liquidar / pagar en la billetera.
 */
export function InvoiceCard({
  messageId,
  author,
  amount,
  concept,
  isPaid,
  isMine,
  isPaying,
  onPayDirect,
  onPayInWallet,
}: InvoiceCardProps) {
  const [showQr, setShowQr] = useState(false);
  const [copied, setCopied] = useState(false);

  // URI estándar Stellar SEP-0007 para billeteras externas (LOBSTR, Freighter, etc.)
  const targetAddress = author.wallet || author.username;
  const stellarPayUri = `web+stellar:pay?destination=${encodeURIComponent(targetAddress)}&amount=${amount}&asset_code=USDC&memo=${encodeURIComponent(concept)}`;

  const handleCopyUri = async () => {
    try {
      await navigator.clipboard.writeText(stellarPayUri);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className={`invoice-card ${isPaid ? 'paid' : ''}`} role="region" aria-label={`Cobro de ${amount} USDC por ${concept}`}>
      {/* Encabezado: Badge B2B, estado y monto */}
      <div className="invoice-header-row">
        <div className="invoice-badge-group">
          <span className="invoice-tag">Cobro B2B · Stellar</span>
          {isPaid ? (
            <span className="invoice-status-pill paid">
              <span className="invoice-status-dot" />
              Pagado On-Chain
            </span>
          ) : isMine ? (
            <span className="invoice-status-pill owner">
              <span className="invoice-status-dot pulse" />
              Esperando Cliente
            </span>
          ) : (
            <span className="invoice-status-pill pending">
              <span className="invoice-status-dot pulse" />
              Pendiente
            </span>
          )}
        </div>
        <div className="invoice-amount-block">
          <span className="invoice-amount-text">{amount.toFixed(2)} <span className="invoice-asset-unit">USDC</span></span>
          <span className="invoice-network-label">Stellar Testnet · 0 Gas</span>
        </div>
      </div>

      {/* Detalle y concepto */}
      <div className="invoice-details-box">
        <p className="invoice-concept">
          <span className="invoice-concept-quote">“</span>
          {concept}
          <span className="invoice-concept-quote">”</span>
        </p>
        <div className="invoice-meta-row">
          <span className="invoice-meta-item">
            <strong>Emisor:</strong> @{author.username}
          </span>
          <span className="invoice-meta-item">
            <strong>Fee:</strong> 0.00 USDC (Patrocinado)
          </span>
        </div>
      </div>

      {/* Desplegable de Código QR */}
      {showQr && (
        <div className="invoice-qr-container">
          <div className="invoice-qr-wrapper">
            <QrCode value={stellarPayUri} label={`QR de cobro de ${amount} USDC para ${author.username}`} size={168} />
          </div>
          <div className="invoice-qr-info">
            <span className="invoice-qr-hint">
              📱 Escanea con <strong>LOBSTR</strong>, <strong>Freighter</strong> o cualquier wallet de Stellar
            </span>
            <button
              type="button"
              className="btn-invoice-copy"
              onClick={handleCopyUri}
              aria-label="Copiar enlace de pago Stellar SEP-0007"
            >
              {copied ? '✓ Enlace SEP-0007 Copiado' : '📋 Copiar Enlace de Pago'}
            </button>
          </div>
        </div>
      )}

      {/* Barra de Acciones */}
      <div className="invoice-actions-row">
        {/* Toggle para ver / ocultar QR */}
        <button
          type="button"
          className={`btn-invoice-action outline ${showQr ? 'active' : ''}`}
          onClick={() => setShowQr((prev) => !prev)}
          aria-expanded={showQr}
          title={showQr ? 'Ocultar código QR' : 'Mostrar código QR para escanear'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
          <span>{showQr ? 'Ocultar QR' : isMine ? 'Mostrar QR a Cliente' : 'Ver QR'}</span>
        </button>

        {/* Acciones de Pago */}
        {isPaid ? (
          <div className="invoice-confirmed-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            <span>Cobro Liquidado Exitosamente</span>
          </div>
        ) : isMine ? (
          <div className="invoice-owner-controls">
            {onPayInWallet && (
              <button
                type="button"
                className="btn-invoice-action secondary"
                onClick={onPayInWallet}
                title="Abrir tu billetera y ver liquidaciones"
              >
                💳 Ver Billetera
              </button>
            )}
          </div>
        ) : (
          <div className="invoice-payer-controls">
            <button
              type="button"
              className="btn-pay-invoice"
              onClick={onPayDirect}
              disabled={isPaying}
              title={`Pagar ${amount} USDC en 1 clic`}
            >
              {isPaying ? (
                <span>Confirmando…</span>
              ) : (
                <>
                  <span>⚡ Pagar {amount} USDC</span>
                </>
              )}
            </button>

            {onPayInWallet && (
              <button
                type="button"
                className="btn-invoice-action secondary"
                onClick={onPayInWallet}
                disabled={isPaying}
                title="Abrir panel de billetera para pagar o liquidar con detalle"
              >
                💳 Pagar en Billetera
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
