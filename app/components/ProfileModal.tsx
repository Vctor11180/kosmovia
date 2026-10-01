'use client';

import React, { useState } from 'react';
import { User } from '../types';

interface ProfileModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: { displayName: string; bio: string }) => void;
  stellarAddress?: string;
}

export function ProfileModal({
  user,
  isOpen,
  onClose,
  onSave,
  stellarAddress = 'GD26UBYVEYYVVOVCMOLPMIKPWQRFV34LK3I7LHBNTUGYHYIKFMEREH2A',
}: ProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'wallets' | 'kyc'>('profile');
  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio || 'Frontend Lead & Builder en Kosmovia.');

  // Estados de billeteras externas vinculadas
  const [isFreighterConnected, setIsFreighterConnected] = useState(false);
  const [isMetaMaskConnected, setIsMetaMaskConnected] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ displayName, bio });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card profile-settings-card" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <div className="settings-header-title">
            <h3 className="modal-title">Configuración de Cuenta</h3>
            <span className="user-tag">{user.username}</span>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </header>

        {/* Pestañas de Navegación de Configuración */}
        <div className="settings-tabs">
          <button
            type="button"
            className={`settings-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            👤 Mi Perfil
          </button>
          <button
            type="button"
            className={`settings-tab-btn ${activeTab === 'wallets' ? 'active' : ''}`}
            onClick={() => setActiveTab('wallets')}
          >
            💳 Billeteras Vinculadas
          </button>
          <button
            type="button"
            className={`settings-tab-btn ${activeTab === 'kyc' ? 'active' : ''}`}
            onClick={() => setActiveTab('kyc')}
          >
            🛡️ Identidad & KYC
          </button>
        </div>

        {/* Tab 1: Perfil */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSubmit} className="modal-body">
            <div className="profile-banner">
              <div className="profile-avatar-large">
                {displayName.charAt(0)}
                <span className="profile-online-badge" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Identidad Kosmovia (@usuario)</label>
              <input
                type="text"
                className="form-input readonly"
                value={user.username}
                disabled
                title="El usuario no se puede cambiar"
              />
              <span className="form-hint">Tu identificador único e inmutable en la red.</span>
            </div>

            <div className="form-group">
              <label className="form-label">Nombre visible</label>
              <input
                type="text"
                className="form-input"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Biografía</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Contanos qué estás construyendo en Kosmovia..."
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary">
                Guardar cambios
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Billeteras Vinculadas */}
        {activeTab === 'wallets' && (
          <div className="modal-body">
            <p className="settings-tab-desc">
              Conectá billeteras adicionales para importar activos, firmar transacciones o validar tu identidad Web3.
            </p>

            <div className="wallets-list">
              {/* Billetera Nativa Kosmovia */}
              <div className="wallet-connect-card active">
                <div className="wallet-card-header">
                  <div className="wallet-card-info">
                    <span className="wallet-card-icon">🌌</span>
                    <div>
                      <h4 className="wallet-card-name">Billetera Kosmovia (Passkey)</h4>
                      <span className="wallet-badge-primary">Principal · Stellar Testnet</span>
                    </div>
                  </div>
                  <span className="wallet-status-connected">Conectada</span>
                </div>
                <p className="wallet-card-address">{stellarAddress}</p>
              </div>

              {/* Billetera Externa: Freighter */}
              <div className="wallet-connect-card">
                <div className="wallet-card-header">
                  <div className="wallet-card-info">
                    <span className="wallet-card-icon">🚀</span>
                    <div>
                      <h4 className="wallet-card-name">Freighter Wallet</h4>
                      <span className="wallet-badge-sub">Billetera oficial de Stellar</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className={`btn-connect-wallet ${isFreighterConnected ? 'connected' : ''}`}
                    onClick={() => setIsFreighterConnected((prev) => !prev)}
                  >
                    {isFreighterConnected ? 'Desconectar' : 'Conectar'}
                  </button>
                </div>
                {isFreighterConnected && (
                  <p className="wallet-card-address">
                    GA7K...FREIGHTER...92KL (Vinculada con tu cuenta)
                  </p>
                )}
              </div>

              {/* Billetera Externa: MetaMask / EVM */}
              <div className="wallet-connect-card">
                <div className="wallet-card-header">
                  <div className="wallet-card-info">
                    <span className="wallet-card-icon">🦊</span>
                    <div>
                      <h4 className="wallet-card-name">MetaMask / EVM</h4>
                      <span className="wallet-badge-sub">Ethereum, Arbitrum, Polygon</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className={`btn-connect-wallet ${isMetaMaskConnected ? 'connected' : ''}`}
                    onClick={() => setIsMetaMaskConnected((prev) => !prev)}
                  >
                    {isMetaMaskConnected ? 'Desconectar' : 'Conectar'}
                  </button>
                </div>
                {isMetaMaskConnected && (
                  <p className="wallet-card-address">
                    0x71C...METAMASK...3b1A (Vinculada para swaps multi-cadena)
                  </p>
                )}
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cerrar
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Identidad & KYC */}
        {activeTab === 'kyc' && (
          <div className="modal-body">
            <div className="kyc-summary-box">
              <div className="kyc-badge-row">
                <span className="kyc-icon-badge">🛡️</span>
                <div>
                  <h4 className="kyc-title">Estado de Identidad</h4>
                  <span className="kyc-level-tag">Nivel 2: Verificado en Stellar Testnet</span>
                </div>
              </div>
            </div>

            <div className="kyc-perks-list">
              <div className="kyc-perk-item">
                <span className="perk-check">✓</span>
                <div>
                  <strong>Comisiones patrocinadas</strong>
                  <p>OpenZeppelin Relayer asume tus tarifas en la red Stellar.</p>
                </div>
              </div>

              <div className="kyc-perk-item">
                <span className="perk-check">✓</span>
                <div>
                  <strong>Pagos y Cobros B2B para Bolivia</strong>
                  <p>Habilitado para emitir cobros en USDC con comprobantes verificables.</p>
                </div>
              </div>

              <div className="kyc-perk-item">
                <span className="perk-check">✓</span>
                <div>
                  <strong>Autenticación Passkeys (WebAuthn)</strong>
                  <p>Acceso seguro biométrico sin custodiar claves privadas.</p>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Entendido
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
