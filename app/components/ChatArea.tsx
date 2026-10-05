'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Channel, Community, Message, User } from '../types';
import { AvatarFace } from './AvatarFace';
import { ComposerPlus } from './ComposerPlus';
import { EmojiPicker } from './EmojiPicker';
import { IconBell, IconUsers, IconWallet } from './Icons';
import { WalletTransaction } from '../types';

interface ChatAreaProps {
  channel: Channel;
  community: Community;
  messages: Message[];
  onSendMessage: (content: string) => void;
  onToggleMobileMenu: () => void;
  onToggleMemberList?: () => void;
  isMemberListOpen?: boolean;
  onOpenWallet?: () => void;
  balanceUSDC?: number;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  onOpenQuickInvoice?: () => void;
  /** Paga el cobro a quien lo emitió (`payee` = @usuario del autor). true si el pago salió. */
  onPayInvoice?: (amount: number, concept: string, payee: string) => Promise<boolean> | void;
  isWalletOpen?: boolean;
  currentUserId?: string;
  /** Abre la tarjeta de perfil de quien escribió (avatar o nombre). */
  onOpenProfile?: (user: User) => void;
  /** Botón de solo ícono para actualizar el saldo. */
  onRefreshWallet?: () => void;
  isRefreshingWallet?: boolean;
  /** Campana de pagos enviados y recibidos. */
  notifications?: { transactions: WalletTransaction[]; unread: number; onOpen: () => void };
  /** La campana abre/cierra las notificaciones en el panel derecho. */
  onToggleNotifications?: () => void;
  isNotificationsOpen?: boolean;
}

interface ParsedReceipt {
  kind: 'transfer' | 'settlement';
  amount: string;
  asset: string;
  recipient?: string;
  concept?: string;
  fee?: string;
}

function parseReceipt(content: string): ParsedReceipt | null {
  if (content.startsWith('💸 He transferido')) {
    const match = content.match(/^💸 He transferido\s+([\d.]+)\s+([A-Za-z]+)\s+a\s+(.+?)\s+mediante/);
    if (match) {
      return {
        kind: 'transfer',
        amount: match[1],
        asset: match[2],
        recipient: match[3].trim(),
      };
    }
  }

  if (content.startsWith('✅ Cobro saldado:')) {
    const match = content.match(/^✅ Cobro saldado:\s*([\d.]+)\s*([A-Za-z]+)\s*por\s*"([^"]+)"/);
    const feeMatch = content.match(/Fee\s*([\d.]+)\s*([A-Za-z]+)\s*deducido/);
    if (match) {
      return {
        kind: 'settlement',
        amount: match[1],
        asset: match[2],
        concept: match[3],
        fee: feeMatch ? `${feeMatch[1]} ${feeMatch[2]}` : '0.5%',
      };
    }
  }

  if (content.startsWith('[RECIBO_STELLAR:')) {
    try {
      const raw = content.slice('[RECIBO_STELLAR:'.length, content.lastIndexOf(']'));
      const parsed = JSON.parse(raw);
      if (parsed && parsed.amount) {
        return {
          kind: 'transfer',
          amount: String(parsed.amount),
          asset: parsed.asset || 'USDC',
          recipient: parsed.to,
          concept: parsed.concept,
          fee: parsed.fee,
        };
      }
    } catch {}
  }

  return null;
}

function PaymentReceiptCard({ receipt }: { receipt: ParsedReceipt }) {
  const [copied, setCopied] = useState(false);

  const displayRecipient = receipt.recipient
    ? receipt.recipient.startsWith('G') && receipt.recipient.length > 20
      ? `${receipt.recipient.slice(0, 6)}...${receipt.recipient.slice(-6)}`
      : receipt.recipient
    : null;

  const handleCopy = () => {
    if (!receipt.recipient) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(receipt.recipient);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="payment-receipt-card">
      <div className="receipt-sparkle-fx" aria-hidden="true">
        <span>✦</span>
        <span>★</span>
        <span>✦</span>
      </div>
      <div className="receipt-header">
        <div className="receipt-badge">
          <span className="stellar-dot-pulse" />
          <span>Stellar Testnet · Recibo On-Chain</span>
        </div>
        <span className="receipt-status-pill">✓ Confirmado</span>
      </div>

      <div className="receipt-main">
        <div className="receipt-amount-wrap">
          <span className="receipt-amount">{receipt.amount}</span>
          <span className="receipt-asset">{receipt.asset}</span>
        </div>
        <div className="receipt-subtitle">
          {receipt.kind === 'transfer' ? (
            <span>
              Transferencia confirmada a{' '}
              {displayRecipient ? (
                <button
                  type="button"
                  onClick={handleCopy}
                  title="Copiar dirección o usuario"
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    font: 'inherit',
                    color: 'var(--accent, #2dd4bf)',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontWeight: 700,
                  }}
                >
                  {displayRecipient} {copied ? '(¡copiado!)' : ''}
                </button>
              ) : (
                <strong>destinatario</strong>
              )}
            </span>
          ) : (
            <span>
              Cobro liquidado por <strong>&ldquo;{receipt.concept}&rdquo;</strong>
            </span>
          )}
        </div>
      </div>

      <div className="receipt-footer">
        <div className="receipt-detail">
          <span className="receipt-label">Comisión de Red</span>
          <span className="receipt-val">{receipt.fee || 'Patrocinada · 0.00 XLM'}</span>
        </div>
        <div className="receipt-detail">
          <span className="receipt-label">Liquidación</span>
          <span className="receipt-val">Pollar / Horizon</span>
        </div>
      </div>
    </div>
  );
}

export function ChatArea({
  channel,
  community,
  messages,
  onSendMessage,
  onToggleMobileMenu,
  onToggleMemberList,
  isMemberListOpen,
  onOpenWallet,
  balanceUSDC,
  theme = 'dark',
  onToggleTheme,
  onOpenQuickInvoice,
  onPayInvoice,
  isWalletOpen,
  currentUserId,
  onOpenProfile,
  onRefreshWallet,
  isRefreshingWallet,
  notifications,
  onToggleNotifications,
  isNotificationsOpen,
}: ChatAreaProps) {
  const [inputText, setInputText] = useState('');
  const [paidInvoices, setPaidInvoices] = useState<Record<string, boolean>>({});
  const [payingInvoice, setPayingInvoice] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setInputText('');
  };

  // Se marca pagado solo si el pago salió de verdad.
  const handlePay = async (msgId: string, amount: number, concept: string, payee: string) => {
    if (paidInvoices[msgId] || payingInvoice || !onPayInvoice) return;
    setPayingInvoice(msgId);
    const ok = await onPayInvoice(amount, concept, payee);
    setPayingInvoice(null);
    if (ok !== false) setPaidInvoices((prev) => ({ ...prev, [msgId]: true }));
  };

  return (
    <main className="chat-area">
      <header className="chat-header">
        <div className="chat-header-info">
          <button
            type="button"
            className="menu-toggle-btn"
            onClick={onToggleMobileMenu}
            aria-label="Abrir menú de canales"
          >
            ☰
          </button>
          <div className="chat-header-title">
            <span className="channel-hash">#</span>
            <span>{channel.name}</span>
          </div>
          {channel.topic && (
            <span className="chat-header-topic" title={channel.topic}>
              {channel.topic}
            </span>
          )}
        </div>
        <div className="chat-header-actions">
          {notifications && onToggleNotifications && (
            <button
              type="button"
              className={`header-icon-btn ${isNotificationsOpen ? 'active' : ''}`}
              onClick={onToggleNotifications}
              aria-pressed={isNotificationsOpen}
              aria-label={notifications.unread > 0 ? `Notificaciones: ${notifications.unread} nuevas` : 'Notificaciones'}
              title="Notificaciones de pagos"
              style={{ position: 'relative' }}
            >
              <IconBell />
              {notifications.unread > 0 ? (
                <span className="tab-pending-badge" style={{ position: 'absolute', top: -6, right: -6 }}>
                  {notifications.unread > 9 ? '9+' : notifications.unread}
                </span>
              ) : null}
            </button>
          )}
          {onOpenWallet && (
            <button
              type="button"
              className={`header-icon-btn ${isWalletOpen ? 'active' : ''}`}
              onClick={onOpenWallet}
              aria-pressed={isWalletOpen}
              aria-label={balanceUSDC !== undefined ? `Mi Wallet: ${balanceUSDC.toFixed(2)} USDC` : 'Mi Wallet'}
              title={balanceUSDC !== undefined ? `Mi Wallet · ${balanceUSDC.toFixed(2)} USDC` : 'Mi Wallet'}
            >
              <IconWallet />
            </button>
          )}
          {onToggleMemberList && (
            <button
              type="button"
              className={`header-icon-btn ${isMemberListOpen ? 'active' : ''}`}
              onClick={onToggleMemberList}
              aria-label={isMemberListOpen ? 'Ocultar miembros' : 'Mostrar miembros'}
              aria-pressed={isMemberListOpen}
              title="Miembros"
            >
              <IconUsers />
            </button>
          )}
        </div>
      </header>

      <section className="message-feed" aria-label="Historial de mensajes">
        {messages.length === 0 ? (
          <div className="empty-chat-state">
            <div className="empty-chat-icon">💬</div>
            <h3 className="empty-chat-title">Bienvenido a #{channel.name}</h3>
            <p className="empty-chat-desc">
              {channel.topic || 'Este es el inicio del canal. ¡Sé el primero en enviar un mensaje o emitir un cobro B2B en Stellar!'}
            </p>
            <div className="empty-chat-actions">
              <button
                type="button"
                className="btn-empty-action"
                onClick={() => onSendMessage('👋 ¡Hola a todos! Arrancamos la conversación por acá.')}
              >
                👋 Saludar en el canal
              </button>
              {onOpenQuickInvoice && (
                <button
                  type="button"
                  className="btn-empty-action accent"
                  onClick={onOpenQuickInvoice}
                >
                  💸 Emitir Cobro B2B
                </button>
              )}
            </div>
          </div>
        ) : (
          messages.map((msg, index) => {
            // Detectar si el mensaje es una tarjeta de cobro B2B interactiva
            const isInvoice = msg.content.startsWith('[COBRO_B2B:');
            let invoiceData: { amount: number; concept: string } | null = null;
            if (isInvoice) {
              try {
                // El JSON va entre '[COBRO_B2B:' y el último ']' (el concepto puede tener corchetes).
                const raw = msg.content.slice('[COBRO_B2B:'.length, msg.content.lastIndexOf(']'));
                const parsed = JSON.parse(raw);
                invoiceData =
                  typeof parsed?.amount === 'number' && parsed.amount > 0 && typeof parsed?.concept === 'string'
                    ? { amount: parsed.amount, concept: parsed.concept }
                    : null;
              } catch {
                invoiceData = null;
              }
            }

            const receiptData = !invoiceData ? parseReceipt(msg.content) : null;
            const prev = index > 0 ? messages[index - 1] : null;
            const grouped =
              !invoiceData &&
              !receiptData &&
              prev !== null &&
              prev.author.id === msg.author.id &&
              !prev.content.startsWith('[COBRO_B2B:');
            const isPaid = paidInvoices[msg.id];
            const isMine = currentUserId !== undefined && msg.author.id === currentUserId;
            const isPaying = payingInvoice === msg.id;

            return (
              <article key={msg.id} className={`message-item ${grouped ? 'kv-grouped' : ''}`}>
                {grouped ? (
                  <div className="kv-avatar-spacer" aria-hidden="true">
                    <time className="kv-grouped-time">{msg.createdAt}</time>
                  </div>
                ) : (
                <div className="msg-avatar">
                  <button
                    type="button"
                    onClick={() => onOpenProfile?.(msg.author)}
                    aria-label={`Ver perfil de ${msg.author.username}`}
                    style={{ ...{ background: 'none', border: 0, padding: 0, cursor: 'pointer', fontFamily: 'inherit' }, width: '100%', height: '100%', borderRadius: 'inherit', color: 'inherit' }}
                  >
                    <AvatarFace avatar={msg.author.avatar} name={msg.author.displayName} />
                  </button>
                </div>
                )}
                <div className="msg-body">
                  {grouped ? null : (
                  <div className="msg-header">
                    <button
                      type="button"
                      className="msg-author"
                      onClick={() => onOpenProfile?.(msg.author)}
                      title={`Ver perfil de ${msg.author.username}`}
                      style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                      {msg.author.displayName}
                    </button>
                    {msg.author.role === 'admin' && <span className="msg-role-tag admin">admin</span>}
                    <time className="msg-time">{msg.createdAt}</time>
                  </div>
                  )}

                  {invoiceData ? (
                    <div className="invoice-card">
                      <div className="invoice-header-row">
                        <span className="invoice-tag">Cobro en Stellar</span>
                        <span className="invoice-amount-text">{invoiceData.amount} USDC</span>
                      </div>
                      <p className="invoice-concept">{invoiceData.concept}</p>
                      <button
                        type="button"
                        className={`btn-pay-invoice ${isPaid ? 'paid' : ''}`}
                        onClick={() => invoiceData && void handlePay(msg.id, invoiceData.amount, invoiceData.concept, msg.author.username)}
                        disabled={isPaid || isMine || isPaying || payingInvoice !== null}
                        title={isMine ? 'Es tu propio cobro' : undefined}
                      >
                        {isPaid
                          ? '✓ Pago Confirmado en Testnet'
                          : isMine
                            ? 'Tu cobro: esperando pago'
                            : isPaying
                              ? 'Pagando…'
                              : `Pagar ${invoiceData.amount} USDC a ${msg.author.username}`}
                      </button>
                    </div>
                  ) : receiptData ? (
                    <PaymentReceiptCard receipt={receiptData} />
                  ) : (
                    <p className="msg-content">{msg.content}</p>
                  )}
                </div>
              </article>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </section>

      <footer className="chat-input-container">
        <form onSubmit={handleSubmit} className="chat-input-box">
          <ComposerPlus onInvoice={onOpenQuickInvoice} />
          <input
            type="text"
            className="chat-input-field"
            maxLength={2000}
            placeholder={`Mensaje en #${channel.name}`}
            aria-label={`Mensaje en #${channel.name}`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <EmojiPicker onPick={(emoji) => setInputText((t) => t + emoji)} />
          <button
            type="submit"
            className="chat-send-btn"
            disabled={!inputText.trim()}
          >
            Enviar
          </button>
        </form>
      </footer>
    </main>
  );
}
