'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Channel, Community, Message } from '../types';
import { AvatarFace } from './AvatarFace';

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
            <span className="chat-header-topic">{channel.topic}</span>
          )}
        </div>
        <div className="chat-header-actions">
          {onOpenWallet && (
            <button
              type="button"
              className="header-wallet-pill"
              onClick={onOpenWallet}
              title={isWalletOpen ? 'Cerrar Mi Wallet' : 'Abrir Mi Wallet'}
              aria-expanded={isWalletOpen}
              style={isWalletOpen ? { position: 'relative', zIndex: 95 } : undefined}
            >
              <span className="wallet-dot" />
              <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15, textAlign: 'left' }}>
                <span>Mi Wallet</span>
                <small style={{ fontSize: 11, fontWeight: 600, opacity: 0.8 }}>
                  {balanceUSDC !== undefined ? `${balanceUSDC.toFixed(2)} USDC` : '…'}
                </small>
              </span>
            </button>
          )}

          {onToggleTheme && (
            <button
              type="button"
              className="header-icon-btn"
              onClick={onToggleTheme}
              title={theme === 'light' ? 'Cambiar a Modo Oscuro' : 'Cambiar a Modo Claro'}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          )}

          <div className="header-badge">{community.name}</div>

          {onToggleMemberList && (
            <button
              type="button"
              className={`header-icon-btn ${isMemberListOpen ? 'active' : ''}`}
              onClick={onToggleMemberList}
              title="Mostrar/Ocultar lista de miembros"
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
          messages.map((msg) => {
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

            const isPaid = paidInvoices[msg.id];
            const isMine = currentUserId !== undefined && msg.author.id === currentUserId;
            const isPaying = payingInvoice === msg.id;

            return (
              <article key={msg.id} className="message-item">
                <div className="msg-avatar">
                  <AvatarFace avatar={msg.author.avatar} name={msg.author.displayName} />
                </div>
                <div className="msg-body">
                  <div className="msg-header">
                    <span className="msg-author">{msg.author.displayName}</span>
                    {msg.author.role && (
                      <span className={`msg-role-tag ${msg.author.role}`}>{msg.author.role}</span>
                    )}
                    <time className="msg-time">{msg.createdAt}</time>
                  </div>

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
          {onOpenQuickInvoice && (
            <button
              type="button"
              className="btn-quick-tip"
              onClick={onOpenQuickInvoice}
              title="Emitir solicitud de cobro B2B en USDC"
            >
              💸
            </button>
          )}
          <input
            type="text"
            className="chat-input-field"
            maxLength={2000}
            placeholder={`Enviar mensaje a #${channel.name}... (o usa 💸 para emitir un cobro)`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
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
