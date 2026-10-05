'use client';

import React, { useMemo, useState } from 'react';
import { apiRequest } from '../lib/core/api-client.ts';
import { aleatorio, azarFijo, codificar, hash32, svg } from '../lib/core/avatar/kosmonautas.ts';
import { sugerirUsernames, usernameAleatorio } from '../lib/core/usernames.ts';

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

/**
 * Crear perfil en modo api, con los estilos del login de Victor: un @usuario
 * del espacio (sugerencias de core) y un Kosmonauta al azar. El editor
 * completo de rasgos sigue en core (/perfil).
 */
export function CoreCreateProfile({ address, onCreated }: { address: string; onCreated: () => void }) {
  const seed = useMemo(() => hash32(address), [address]);
  const [suggestions, setSuggestions] = useState(() => sugerirUsernames(4, azarFijo(seed)));
  const [username, setUsername] = useState(suggestions[0] ?? '');
  const [displayName, setDisplayName] = useState('');
  const [avatar, setAvatar] = useState(() => aleatorio(undefined, {}, azarFijo(seed + 1)));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clean = username.trim().replace(/^@/, '').toLowerCase();
  const valid = USERNAME_RE.test(clean);
  const preview = useMemo(() => `data:image/svg+xml;utf8,${encodeURIComponent(svg(avatar))}`, [avatar]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || saving) return;
    setSaving(true);
    setError(null);
    const res = await apiRequest('/api/profile', {
      method: 'POST',
      body: { username: clean, displayName: displayName.trim() || clean, avatarSeed: codificar(avatar), avatarStyle: 'kosmonauta' },
    });
    setSaving(false);
    if (res.ok) return onCreated();
    setError(res.error);
  };

  return (
    <div className="login-page-container">
      <div className="login-box">
        <div className="login-header">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Tu Kosmonauta" width={96} height={96} style={{ imageRendering: 'pixelated', borderRadius: 20, margin: '0 auto 8px', display: 'block' }} />
          <h1 className="login-title">Crea tu perfil</h1>
          <p className="login-subtitle">Elige tu @usuario y tu Kosmonauta</p>
        </div>
        <form onSubmit={onSubmit}>
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
            />
            <span className="form-hint">
              {valid ? 'De 3 a 20: minúsculas, números y guion bajo.' : 'Usa de 3 a 20 minúsculas, números o guion bajo.'}
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              {suggestions.map((s) => (
                <button key={s} type="button" className="btn-secondary" onClick={() => setUsername(s)}>
                  @{s}
                </button>
              ))}
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setSuggestions(sugerirUsernames(4));
                  setUsername(usernameAleatorio());
                }}
              >
                🎲 Otros
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
          <button type="button" className="btn-secondary" style={{ marginBottom: 12 }} onClick={() => setAvatar(aleatorio())}>
            🎲 Otro Kosmonauta
          </button>
          {error ? (
            <p className="form-hint" role="alert" style={{ color: '#f87171' }}>
              {error}
            </p>
          ) : null}
          <button type="submit" className="btn-login-submit" disabled={!valid || saving}>
            {saving ? 'Creando…' : 'Crear perfil →'}
          </button>
        </form>
      </div>
    </div>
  );
}
