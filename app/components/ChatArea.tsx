'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Channel, Community, Message, User } from '../types';
import { AvatarFace } from './AvatarFace';
import { ComposerPlus } from './ComposerPlus';
import { EmojiPicker } from './EmojiPicker';
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
          {onToggleMemberList && (
            <button
              type="button"
              className={`header-icon-btn ${isMemberListOpen ? 'active' : ''}`}
              onClick={onToggleMemberList}
              aria-label={isMemberListOpen ? 'Ocultar miembros' : 'Mostrar miembros'}
              aria-pressed={isMemberListOpen}
              title="Miembros"
            >
              👥
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

            const prev = index > 0 ? messages[index - 1] : null;
            const grouped =
              !invoiceData && prev !== null && prev.author.id === msg.author.id && !prev.content.startsWith('[COBRO_B2B:');
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
