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
}: ChatAreaProps) {
  const [inputText, setInputText] = useState('');
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
        {messages.map((msg) => (
          <article key={msg.id} className="message-item">
            <div className="msg-avatar">
              {msg.author.displayName.charAt(0)}
            </div>
            <div className="msg-body">
              <div className="msg-header">
                <span className="msg-author">{msg.author.displayName}</span>
                {msg.author.role && (
                  <span className="msg-role-tag">{msg.author.role}</span>
                )}
                <time className="msg-time">{msg.createdAt}</time>
              </div>
              <p className="msg-content">{msg.content}</p>
            </div>
          </article>
        ))}
        <div ref={messagesEndRef} />
      </section>

      <footer className="chat-input-container">
        <form onSubmit={handleSubmit} className="chat-input-box">
          <input
            type="text"
            className="chat-input-field"
            placeholder={`Enviar mensaje a #${channel.name}...`}
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
