'use client';

import React from 'react';
import Link from 'next/link';
import { KosmoviaCosmicBanner } from '../components/KosmoviaCosmicBanner';

export default function LandingPage() {
  return (
    <div className="landing-wrapper" style={{ position: 'relative', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* 1. Fondo Cósmico Animado (Canvas 60FPS + Artwork Oficial, 100% no-bloqueante) */}
      <KosmoviaCosmicBanner />

      {/* 2. Barra de Navegación */}
      <header className="landing-nav" style={{ position: 'relative', zIndex: 10 }}>
        <Link href="/" className="landing-brand">
          <span className="landing-brand-logo">🌌</span>
          <span>Kosmovia</span>
        </Link>
        <div className="landing-nav-actions">
          <Link href="/login" className="btn-nav-login">
            Iniciar Sesión
          </Link>
          <Link href="/plataforma" className="btn-nav-primary">
            Abrir Plataforma
          </Link>
        </div>
      </header>

      {/* 3. Hero Section */}
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

        {/* Badges de Telemetría de Red Stellar */}
        <div className="landing-telemetry-strip">
          <div className="telemetry-pill">
            <span className="telemetry-dot" />
            <span>Stellar Horizon · Testnet</span>
          </div>
          <div className="telemetry-pill">
            <span>⚡ Finalidad 3.5s · 0 Gas Pollar</span>
          </div>
          <div className="telemetry-pill">
            <span>🛡️ Billeteras Passkeys No Custodia</span>
          </div>
        </div>

        <div className="landing-cta-row">
          <Link href="/login" className="btn-cta-main">
            Ingresar a Kosmovia
          </Link>
          <Link href="/plataforma" className="btn-cta-secondary">
            Ver Demo de Comunidades →
          </Link>
        </div>
      </main>

      {/* 4. Tarjetas de Características */}
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

      {/* 5. Footer */}
      <footer className="landing-footer" style={{ position: 'relative', zIndex: 10 }}>
        <p>
          Kosmovia © 2026 · Construido en el programa Stellar Elite Bolivia (TechRebel) · Testnet
        </p>
      </footer>
    </div>
  );
}
