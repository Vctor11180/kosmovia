'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { KosmoviaCosmicBanner } from '../components/KosmoviaCosmicBanner';

export default function LandingPage() {
  const [backgroundMode, setBackgroundMode] = useState<'showcase' | 'hero'>('showcase');

  return (
    <div className={`landing-wrapper ${backgroundMode === 'hero' ? 'immersive-bg-active' : ''}`}>
      {/* Fondo Inmersivo Cósmico Opcional */}
      {backgroundMode === 'hero' && (
        <KosmoviaCosmicBanner mode="hero" showControls={false} />
      )}

      <header className="landing-nav" style={{ position: 'relative', zIndex: 10 }}>
        <Link href="/" className="landing-brand">
          <span className="landing-brand-logo">🌌</span>
          <span>Kosmovia</span>
        </Link>
        <div className="landing-nav-actions">
          <button
            type="button"
            onClick={() => setBackgroundMode((m) => (m === 'showcase' ? 'hero' : 'showcase'))}
            className="btn-nav-login"
            title="Alternar entre modo banner 16:9 y fondo cósmico completo"
            style={{ cursor: 'pointer' }}
          >
            {backgroundMode === 'showcase' ? '🌌 Modo Fondo Cósmico' : '🖼️ Modo Banner 16:9'}
          </button>
          <Link href="/login" className="btn-nav-login">
            Iniciar Sesión
          </Link>
          <Link href="/plataforma" className="btn-nav-primary">
            Abrir Plataforma
          </Link>
        </div>
      </header>

      <main className="landing-hero" style={{ position: 'relative', zIndex: 10 }}>
        <div className="landing-tag-badge">
          <span>🇧🇴 Stellar Elite Bolivia · Infraestructura B2B</span>
        </div>

        <h1 className="landing-hero-title">
          Comunidades, Billetera y Pagos en Stellar{' '}
          <span className="highlight">para Empresas</span>
        </h1>

        <p className="landing-hero-desc">
          La red social y financiera para Bolivia: comunidades estilo Towns/Discord,
          cobros instantáneos en USDC sin comisiones abusivas y validación de identidad KYC empresarial.
        </p>

        <div className="landing-cta-row">
          <Link href="/login" className="btn-cta-main">
            Ingresar a Kosmovia
          </Link>
          <Link href="/plataforma" className="btn-cta-secondary">
            Ver Demo de Comunidades →
          </Link>
        </div>

        {/* Banner Cósmico Interactivo Oficial (Modo Tarjeta 16:9 Showcase) */}
        {backgroundMode === 'showcase' && (
          <section className="landing-banner-section" aria-label="Banner animado interactivo oficial">
            <KosmoviaCosmicBanner
              mode="showcase"
              showControls={true}
              onExploreClick={() => {
                window.location.href = '/plataforma';
              }}
            />
          </section>
        )}
      </main>

      <section className="landing-grid" aria-label="Características de la plataforma" style={{ position: 'relative', zIndex: 10 }}>
        <article className="landing-card">
          <div className="landing-card-icon">⚡</div>
          <h2 className="landing-card-title">Billetera No Custodia</h2>
          <p className="landing-card-desc">
            Crea tu wallet al registrarte con Passkeys (WebAuthn). Sin frases semilla ni extensiones complicadas, con comisiones patrocinadas en Stellar.
          </p>
        </article>

        <article className="landing-card">
          <div className="landing-card-icon">🏢</div>
          <h2 className="landing-card-title">Pagos B2B en Bolivia</h2>
          <p className="landing-card-desc">
            Cobros y transferencias instantáneas entre empresas, concesionarias y comercios mediante activos en Stellar (USDC) con comprobantes verificables.
          </p>
        </article>

        <article className="landing-card">
          <div className="landing-card-icon">🛡️</div>
          <h2 className="landing-card-title">Verificación KYC Empresa</h2>
          <p className="landing-card-desc">
            Identidad corporativa respaldada en la nube para operar con entidades financieras y generar credibilidad institucional.
          </p>
        </article>
      </section>

      <footer className="landing-footer" style={{ position: 'relative', zIndex: 10 }}>
        <p>
          Kosmovia © 2026 · Construido en el programa Stellar Elite Bolivia (TechRebel) · Testnet
        </p>
      </footer>
    </div>
  );
}
