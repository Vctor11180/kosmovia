'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SERVICES_MODE } from '../../services';
import { CoreLogin } from './CoreLogin';
import { WarpLoginPortal } from '../../components/WarpLoginPortal';

export default function LoginPage() {
  // Modo api: login real con Pollar. Modo demo: el login de siempre.
  if (SERVICES_MODE === 'api') return <CoreLogin />;
  return <DemoLogin />;
}

function DemoLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('@victor');
  const [isWarping, setIsWarping] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setIsWarping(true);
  };

  const handleWarpComplete = () => {
    // Redirección fluida a la plataforma tras la secuencia holográfica
    router.push('/plataforma');
  };

  return (
    <div className="login-page-container">
      {/* Fondo estelar 3D interactivo y portal HUD durante el salto hiperespacial */}
      <WarpLoginPortal
        isWarping={isWarping}
        username={username.startsWith('@') ? username : `@${username}`}
        onComplete={handleWarpComplete}
      />

      <div
        className="login-box"
        style={{
          opacity: isWarping ? 0 : 1,
          transform: isWarping ? 'scale(0.92)' : 'scale(1)',
          pointerEvents: isWarping ? 'none' : 'auto',
        }}
      >
        <div className="login-header">
          <span className="login-brand-icon">
            <img src="/brand/kosmovia-logo.png" alt="" width={56} height={56} className="kv-brand-img" />
          </span>
          <h1 className="login-title">Ingresar a Kosmovia</h1>
          <p className="login-subtitle">
            Comunidades, canales y chat en Stellar
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '18px' }}>
            <label className="form-label">Identidad @usuario</label>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ej: @usuario"
              required
              disabled={isWarping}
            />
            <span className="form-hint">
              Acceso descentralizado sin contraseña con Passkeys.
            </span>
          </div>

          <button
            type="submit"
            className="btn-login-submit"
            disabled={isWarping}
          >
            {isWarping ? 'Iniciando Salto Estelar...' : 'Ingresar a la Plataforma →'}
          </button>
        </form>

        <Link href="/" className="login-back-link">
          ← Volver a la página principal
        </Link>
      </div>
    </div>
  );
}
