'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<'personal' | 'empresa'>('personal');
  const [username, setUsername] = useState('@victor');
  const [companyName, setCompanyName] = useState('Tech Solutions S.R.L.');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      router.push('/plataforma');
    }, 600);
  };

  return (
    <div className="login-page-container">
      <div className="login-box">
        <div className="login-header">
          <span className="login-brand-icon">🌌</span>
          <h1 className="login-title">Ingresar a Kosmovia</h1>
          <p className="login-subtitle">
            Comunidades, billetera integrada y pagos en Stellar
          </p>
        </div>

        <div className="account-type-tabs" role="tablist">
          <button
            type="button"
            className={`account-tab-btn ${accountType === 'personal' ? 'active' : ''}`}
            onClick={() => setAccountType('personal')}
          >
            Personal
          </button>
          <button
            type="button"
            className={`account-tab-btn ${accountType === 'empresa' ? 'active' : ''}`}
            onClick={() => setAccountType('empresa')}
          >
            Empresa (Bolivia)
          </button>
        </div>

        {accountType === 'empresa' && (
          <div className="kyc-info-banner">
            <span className="kyc-status-pill">KYC Activo</span>
            <span>Habilitado para pagos B2B, cobros y facturación en Bolivia.</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {accountType === 'empresa' ? (
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label">Razón Social o Empresa</label>
              <input
                type="text"
                className="form-input"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>
          ) : null}

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">Identidad @usuario</label>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ej: @usuario"
              required
            />
            <span className="form-hint">
              Acceso sin contraseña mediante Passkeys (WebAuthn).
            </span>
          </div>

          <button
            type="submit"
            className="btn-login-submit"
            disabled={isLoading}
          >
            {isLoading ? 'Autenticando con Passkey...' : 'Ingresar con Passkey'}
          </button>
        </form>

        <Link href="/" className="login-back-link">
          ← Volver a la página principal
        </Link>
      </div>
    </div>
  );
}
