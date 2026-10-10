'use client';

import React from 'react';
import Link from 'next/link';
import { KosmoviaCosmicBanner } from '../components/KosmoviaCosmicBanner';

export default function LandingPage() {
  return (
    <div className="landing-wrapper">
      {/* 1. Barra de Navegación */}
      <header className="landing-nav">
        <Link href="/" className="landing-brand">
          <img
            src="/brand/kosmovia-logo.png"
            alt="Kosmovia"
            width={28}
            height={28}
            style={{ borderRadius: 6, display: 'block' }}
          />
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

      {/* 2. Hero Dividido: Letras 100% legibles a la izquierda + Gran Escenario Cósmico 3D a la derecha */}
      <main className="landing-hero-split">
        <div className="landing-hero-content">
          <div className="landing-tag-badge">
            <span className="tag-dot" />
            <span>Stellar Elite Bolivia · Infraestructura B2B</span>
          </div>

          <h1 className="landing-hero-title">
            Comunidades, Billetera y Pagos en Stellar{' '}
            <span className="highlight">para Empresas</span>
          </h1>

          <p className="landing-hero-desc">
            La plataforma financiera y social para Bolivia: comunidades descentralizadas estilo Towns/Discord,
            cobros instantáneos en USDC sin comisiones de gas y validación KYC empresarial con contratos Soroban.
          </p>

          <div className="landing-telemetry-strip">
            <div className="telemetry-pill">
              <span className="telemetry-dot" />
              <span>Stellar Horizon Testnet</span>
            </div>
            <div className="telemetry-pill">
              <span>Finalidad 3.5s · Comisiones patrocinadas</span>
            </div>
            <div className="telemetry-pill">
              <span>Billeteras Passkeys sin custodia</span>
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
        </div>

        {/* 3. El Escenario Cósmico 3D en Grande ("Todo lo que pusiste") */}
        <div className="landing-hero-stage-col">
          <KosmoviaCosmicBanner />
        </div>
      </main>

      {/* 4. Tarjetas de Características con Íconos SVG Profesionales */}
      <section className="landing-grid" aria-label="Características de la plataforma">
        <article className="landing-card">
          <div className="landing-card-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="6" width="18" height="13" rx="3" />
              <path d="M3 10h18" />
              <circle cx="16.5" cy="14.5" r="1" />
            </svg>
          </div>
          <h2 className="landing-card-title">Billetera No Custodia</h2>
          <p className="landing-card-desc">
            Crea tu wallet al registrarte con Passkeys (WebAuthn). Sin frases semilla ni extensiones complicadas, con comisiones patrocinadas en Stellar.
          </p>
        </article>

        <article className="landing-card">
          <div className="landing-card-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 16V4m0 0L3 8m4-4l4 4" />
              <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </div>
          <h2 className="landing-card-title">Pagos B2B en Bolivia</h2>
          <p className="landing-card-desc">
            Cobros y transferencias instantáneas entre empresas, concesionarias y comercios mediante activos en Stellar (USDC) con comprobantes verificables.
          </p>
        </article>

        <article className="landing-card">
          <div className="landing-card-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <h2 className="landing-card-title">Verificación KYC Empresa</h2>
          <p className="landing-card-desc">
            Identidad corporativa respaldada en la nube para operar con entidades financieras y generar credibilidad institucional.
          </p>
        </article>
      </section>

      {/* 5. Footer */}
      <footer className="landing-footer">
        <p>
          Kosmovia © 2026 · Construido en el programa Stellar Elite Bolivia (TechRebel) · Testnet
        </p>
      </footer>
    </div>
  );
}
