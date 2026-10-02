'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Channel, Community, Message } from '../types';

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
  onPayInvoice?: (amount: number, concept: string) => void;
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
}: ChatAreaProps) {
  const [inputText, setInputText] = useState('');
  const [paidInvoices, setPaidInvoices] = useState<Record<string, boolean>>({});
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

  const handlePay = (msgId: string, amount: number, concept: string) => {
    if (paidInvoices[msgId]) return;
    setPaidInvoices((prev) => ({ ...prev, [msgId]: true }));
    if (onPayInvoice) {
      onPayInvoice(amount, concept);
    }
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
              title="Abrir Billetera Stellar"
            >
              <span className="wallet-dot" />
              <span>{balanceUSDC !== undefined ? balanceUSDC.toFixed(2) : '150.00'} USDC</span>
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
                const raw = msg.content.replace('[COBRO_B2B:', '').replace(']', '');
                invoiceData = JSON.parse(raw);
              } catch {
                invoiceData = null;
              }
            }

            const isPaid = paidInvoices[msg.id];

            return (
              <article key={msg.id} className="message-item">
                <div className="msg-avatar">
                  {msg.author.displayName.charAt(0)}
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
                        onClick={() => invoiceData && handlePay(msg.id, invoiceData.amount, invoiceData.concept)}
                        disabled={isPaid}
                      >
                        {isPaid ? '✓ Pago Confirmado en Testnet' : `Pagar ${invoiceData.amount} USDC`}
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
