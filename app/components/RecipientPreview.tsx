'use client';

import React, { useEffect, useState } from 'react';
import { User } from '../types';
import { profileService } from '../services';
import { AvatarFace } from './AvatarFace';

const WALLET_RE = /^G[A-Z2-7]{55}$/;
const HANDLE_RE = /^@?[a-z0-9_]{3,20}$/i;

type State =
  | { step: 'idle' }
  | { step: 'searching' }
  | { step: 'found'; user: User }
  | { step: 'wallet' }
  | { step: 'missing'; text: string };

/**
 * Debajo del campo "Destinatario": reconoce a quién le envías mientras escribes
 * un @usuario o pegas una wallet, y muestra su Kosmonauta antes de transferir.
 */
export function RecipientPreview({ value, selfWallet }: { value: string; selfWallet?: string }) {
  const [state, setState] = useState<State>({ step: 'idle' });

  useEffect(() => {
    const raw = value.trim();
    const isWallet = WALLET_RE.test(raw.toUpperCase());
    if (!raw) return setState({ step: 'idle' });
    if (isWallet && selfWallet && raw.toUpperCase() === selfWallet) return setState({ step: 'missing', text: 'Esa es tu propia wallet.' });
    if (!isWallet && !HANDLE_RE.test(raw)) return setState({ step: 'missing', text: 'Escribe un @usuario o pega una dirección G….' });
    setState({ step: 'searching' });
    let cancelled = false;
    const timer = setTimeout(() => {
      profileService
        .getPublicProfile(raw)
        .then((user) => {
          if (cancelled) return;
          if (user) setState({ step: 'found', user });
          else if (isWallet) setState({ step: 'wallet' });
          else setState({ step: 'missing', text: `No existe ${raw.startsWith('@') ? raw : `@${raw}`}.` });
        })
        .catch(() => !cancelled && setState({ step: 'missing', text: 'No pudimos buscar ahora. Intenta de nuevo.' }));
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [value, selfWallet]);

  if (state.step === 'idle') return null;
  if (state.step === 'searching') return <span className="form-hint" aria-live="polite">Buscando…</span>;
  if (state.step === 'missing') return <span className="form-hint" style={{ color: '#f87171' }} aria-live="polite">{state.text}</span>;
  if (state.step === 'wallet') return <span className="form-hint" aria-live="polite">Wallet de Stellar · no es un usuario de Kosmovia</span>;

  const { user } = state;
  return (
    <div className="member-item" aria-live="polite" style={{ marginTop: 6 }}>
      <div className="member-avatar-wrapper">
        <div className="member-avatar">
          <AvatarFace avatar={user.avatar} name={user.displayName} seed={user.username} />
        </div>
      </div>
      <div className="member-details">
        <div className="member-name-row">
          <span className="member-name">{user.displayName}</span>
        </div>
        <span className="member-tag">
          {user.username}
          {user.wallet ? ` · ${user.wallet.slice(0, 4)}…${user.wallet.slice(-4)}` : ''}
        </span>
      </div>
    </div>
  );
}
