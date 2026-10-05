'use client';

import React, { useMemo, useState } from 'react';
import { apiRequest } from '../lib/core/api-client.ts';
import { aleatorio, azarFijo, codificar, hash32 } from '../lib/core/avatar/kosmonautas.ts';
import { sugerirUsernames, usernameAleatorio } from '../lib/core/usernames.ts';
import { KosmonautaPicker } from './KosmonautaPicker.tsx';
import './kosmonauta.css';

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

/**
 * Crear perfil en modo api, en 2 pasos con los estilos del login de Victor:
 * 1) @usuario y nombre visible, 2) editor completo del Kosmonauta.
 */
export function CoreCreateProfile({ address, onCreated }: { address: string; onCreated: () => void }) {
  const seed = useMemo(() => hash32(address), [address]);
  const [step, setStep] = useState<1 | 2>(1);
  const [suggestions, setSuggestions] = useState(() => sugerirUsernames(4, azarFijo(seed)));
  const [username, setUsername] = useState(suggestions[0] ?? '');
  const [displayName, setDisplayName] = useState('');
  const [avatarCode, setAvatarCode] = useState(() => codificar(aleatorio(undefined, {}, azarFijo(seed + 1))));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clean = username.trim().replace(/^@/, '').toLowerCase();
  const valid = USERNAME_RE.test(clean);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (valid) {
        setError(null);
        setStep(2);
      }
      return;
    }
    if (!valid || saving) return;
    setSaving(true);
    setError(null);
    const res = await apiRequest('/api/profile', {
      method: 'POST',
      body: { username: clean, displayName: displayName.trim() || clean, avatarSeed: avatarCode, avatarStyle: 'kosmonauta' },
    });
    setSaving(false);
    if (res.ok) return onCreated();
    setError(res.error);
    if (/usuario|username|@/i.test(res.error ?? '')) setStep(1);
  };

  const stepState = (n: 1 | 2) => (step === n ? 'active' : step > n ? 'done' : 'todo');

  return (
    <div className="login-page-container">
      <div className="login-box" style={step === 2 ? { maxWidth: 560, width: '100%' } : undefined}>
        <div className="login-header">
          <h1 className="login-title">Crea tu perfil</h1>
          <p className="login-subtitle">
            {step === 1 ? 'Elige tu @usuario y cómo te verán los demás' : 'Arma tu Kosmonauta'}
          </p>
        </div>
        <ol className="kv-stepper" aria-label="Pasos">
          <li className="kv-step" data-state={stepState(1)} aria-current={step === 1 ? 'step' : undefined}>
            1. Usuario
          </li>
          <li className="kv-step" data-state={stepState(2)} aria-current={step === 2 ? 'step' : undefined}>
            2. Kosmonauta
          </li>
        </ol>
        <form onSubmit={onSubmit}>
          {step === 1 ? (
            <>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label" htmlFor="new-username">@usuario</label>
                <input
                  id="new-username"
                  type="text"
                  className="form-input"
                  value={username}
                  maxLength={21}
                  autoCapitalize="none"
                  spellCheck={false}
                  onChange={(e) => setUsername(e.target.value)}
                  aria-invalid={!valid}
                  aria-describedby="new-username-hint"
                />
                <span className="form-hint" id="new-username-hint" role={error ? 'alert' : undefined}>
                  {error
                    ? error
                    : valid
                      ? 'De 3 a 20: minúsculas, números y guion bajo.'
                      : 'Usa de 3 a 20 minúsculas, números o guion bajo.'}
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {suggestions.map((s) => (
                    <button key={s} type="button" className="btn-secondary" style={{ minHeight: 40 }} onClick={() => setUsername(s)}>
                      @{s}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ minHeight: 40 }}
                    onClick={() => setUsername(usernameAleatorio())}
                  >
                    Aleatorio
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ minHeight: 40 }}
                    onClick={() => setSuggestions(sugerirUsernames(4))}
                  >
                    Otras
                  </button>
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label" htmlFor="new-name">Nombre visible</label>
                <input
                  id="new-name"
                  type="text"
                  className="form-input"
                  maxLength={40}
                  placeholder="Cómo te verán los demás"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-login-submit" disabled={!valid}>
                Siguiente
              </button>
            </>
          ) : (
            <>
              <KosmonautaPicker address={address} initial={avatarCode} onChange={setAvatarCode} />
              {error ? (
                <p className="form-hint kv-error" role="alert" style={{ marginTop: 12 }}>
                  {error}
                </p>
              ) : null}
              <div className="kv-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={saving}
                  onClick={() => {
                    setError(null);
                    setStep(1);
                  }}
                >
                  Atrás
                </button>
                <button type="submit" className="btn-login-submit" style={{ marginTop: 0 }} disabled={!valid || saving}>
                  {saving ? 'Creando…' : 'Crear perfil'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
