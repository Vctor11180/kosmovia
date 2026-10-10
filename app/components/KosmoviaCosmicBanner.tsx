'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseVx: number;
  baseVy: number;
  radius: number;
  alpha: number;
  baseAlpha: number;
  pulseAngle: number;
  pulseSpeed: number;
  color: string;
}

interface Meteor {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  alpha: number;
  life: number;
  maxLife: number;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  speed: number;
}

export interface KosmoviaCosmicBannerProps {
  className?: string;
  onExploreClick?: () => void;
}

/**
 * KosmoviaCosmicBanner:
 * Escenario cósmico 3D y Canvas interactivo a 60 FPS.
 * - Planeta celestial con halo y emblema K neón.
 * - Anillos orbitales en 3D con satélites reales de USDC, Stellar Core y Soroban Escrow.
 * - Red de constelaciones Canvas a 60 FPS con física gravitatoria al cursor/tacto.
 * - Estrellas fugaces periódicas y ondas de choque al hacer clic o tocar.
 * - Cero emojis, tipografía fintech sobria y diseño de alta gama.
 */
export function KosmoviaCosmicBanner({
  className = '',
  onExploreClick,
}: KosmoviaCosmicBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const pointerRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -999,
    y: -999,
    active: false,
  });

  const shockwavesRef = useRef<Shockwave[]>([]);
  const meteorsRef = useRef<Meteor[]>([]);

  // Disparar onda gravitacional luminosa
  const triggerShockwave = useCallback((x?: number, y?: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const spawnX = x !== undefined ? x : rect.width * 0.5;
    const spawnY = y !== undefined ? y : rect.height * 0.5;

    shockwavesRef.current.push({
      x: spawnX,
      y: spawnY,
      radius: 6,
      maxRadius: Math.max(rect.width, rect.height) * 0.6,
      alpha: 0.85,
      speed: 6.5,
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const particles: Particle[] = [];
    const colors = ['#2DD4BF', '#5EEAD4', '#14B8A6', '#F2FBFA', '#38BDF8'];

    const initCanvasSize = () => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      width = Math.max(rect.width, 300);
      height = Math.max(rect.height, 300);
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);

      // Partículas adaptativas según pantalla
      const count = width < 500 ? 36 : 60;
      particles.length = 0;

      for (let i = 0; i < count; i++) {
        const vx = (Math.random() - 0.5) * 0.4;
        const vy = (Math.random() - 0.5) * 0.4;
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx,
          vy,
          baseVx: vx,
          baseVy: vy,
          radius: Math.random() * 2 + 0.8,
          alpha: Math.random() * 0.7 + 0.25,
          baseAlpha: Math.random() * 0.5 + 0.25,
          pulseAngle: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * 0.025 + 0.012,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    initCanvasSize();

    const resizeObserver = new ResizeObserver(() => {
      initCanvasSize();
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    let nextMeteorTime = Date.now() + 2000;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const pointer = pointerRef.current;
      const now = Date.now();

      // 1. Meteoros periódicos
      if (now > nextMeteorTime && meteorsRef.current.length < 2) {
        meteorsRef.current.push({
          x: Math.random() * (width * 0.85),
          y: Math.random() * (height * 0.45),
          length: Math.random() * 65 + 40,
          speed: Math.random() * 7 + 7,
          angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2,
          alpha: 0.95,
          life: 0,
          maxLife: 42,
        });
        nextMeteorTime = now + Math.random() * 4500 + 2800;
      }

      for (let m = meteorsRef.current.length - 1; m >= 0; m--) {
        const meteor = meteorsRef.current[m];
        meteor.life++;
        meteor.x += Math.cos(meteor.angle) * meteor.speed;
        meteor.y += Math.sin(meteor.angle) * meteor.speed;
        meteor.alpha = Math.max(0, 0.95 * (1 - meteor.life / meteor.maxLife));

        const tailX = meteor.x - Math.cos(meteor.angle) * meteor.length;
        const tailY = meteor.y - Math.sin(meteor.angle) * meteor.length;

        const grad = ctx.createLinearGradient(meteor.x, meteor.y, tailX, tailY);
        grad.addColorStop(0, `rgba(94, 234, 212, ${meteor.alpha})`);
        grad.addColorStop(0.35, `rgba(45, 212, 191, ${meteor.alpha * 0.55})`);
        grad.addColorStop(1, 'rgba(6, 19, 20, 0)');

        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(meteor.x, meteor.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        ctx.fillStyle = `rgba(242, 251, 250, ${meteor.alpha})`;
        ctx.beginPath();
        ctx.arc(meteor.x, meteor.y, 2.2, 0, Math.PI * 2);
        ctx.fill();

        if (meteor.life >= meteor.maxLife) {
          meteorsRef.current.splice(m, 1);
        }
      }

      // 2. Ondas gravitacionales al interactuar
      for (let w = shockwavesRef.current.length - 1; w >= 0; w--) {
        const wave = shockwavesRef.current[w];
        wave.radius += wave.speed;
        wave.alpha = Math.max(0, 0.85 * (1 - wave.radius / wave.maxRadius));

        ctx.strokeStyle = `rgba(94, 234, 212, ${wave.alpha * 0.8})`;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
        ctx.stroke();

        if (wave.radius >= wave.maxRadius) {
          shockwavesRef.current.splice(w, 1);
        }
      }

      // 3. Partículas y física gravitatoria
      const numParticles = particles.length;
      for (let i = 0; i < numParticles; i++) {
        const p = particles[i];

        p.pulseAngle += p.pulseSpeed;
        p.alpha = Math.min(1, Math.max(0.18, p.baseAlpha + Math.sin(p.pulseAngle) * 0.28));

        // Expansión por ondas gravitacionales
        for (const wave of shockwavesRef.current) {
          const wdx = p.x - wave.x;
          const wdy = p.y - wave.y;
          const wdist = Math.sqrt(wdx * wdx + wdy * wdy);
          if (Math.abs(wdist - wave.radius) < 30) {
            const push = (1 - Math.abs(wdist - wave.radius) / 30) * 2.2;
            p.vx += (wdx / (wdist || 1)) * push * 0.18;
            p.vy += (wdy / (wdist || 1)) * push * 0.18;
            p.alpha = 1;
          }
        }

        // Gravedad con cursor/touch
        if (pointer.active && pointer.x > 0 && pointer.y > 0) {
          const pdx = p.x - pointer.x;
          const pdy = p.y - pointer.y;
          const pdist = Math.sqrt(pdx * pdx + pdy * pdy);
          const maxDist = 110;

          if (pdist < maxDist && pdist > 1) {
            const force = (1 - pdist / maxDist) * 1.4;
            p.vx += (pdx / pdist) * force * 0.2;
            p.vy += (pdy / pdist) * force * 0.2;
          }
        }

        p.vx = p.vx * 0.95 + p.baseVx * 0.05;
        p.vy = p.vy * 0.95 + p.baseVy * 0.05;

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
      }

      // 4. Red de constelaciones
      const connectDist = width < 500 ? 80 : 110;
      for (let i = 0; i < numParticles; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < numParticles; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectDist) {
            const lineAlpha = (1 - dist / connectDist) * 0.24;
            ctx.strokeStyle = `rgba(45, 212, 191, ${lineAlpha})`;
            ctx.lineWidth = 0.9;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // 5. Dibujar estrellas
      for (let i = 0; i < numParticles; i++) {
        const p = particles[i];
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        if (p.radius > 2) {
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 0.45, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    pointerRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    };
  };

  const handlePointerLeave = () => {
    pointerRef.current.active = false;
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    triggerShockwave(e.clientX - rect.left, e.clientY - rect.top);
  };

  return (
    <div
      ref={containerRef}
      className={`kosmo-cosmic-stage ${className}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
      role="region"
      aria-label="Escenario estelar interactivo en 3D de Kosmovia"
    >
      {/* 1. Fondo Artwork Oficial sutilmente difuminado */}
      <div className="stage-artwork-backdrop">
        <img
          src="/brand/kosmovia-banner.jpg"
          alt=""
          className="stage-artwork-img"
          loading="eager"
        />
        <div className="stage-nebula-glow" />
        <div className="stage-vignette-radial" />
      </div>

      {/* 2. Canvas interactivo de constelaciones y meteoros */}
      <canvas ref={canvasRef} className="stage-canvas-layer" />

      {/* 3. Sistema Planetario 3D con Anillos Orbitales y Satélites */}
      <div className="stage-celestial-system" aria-hidden="true">
        {/* Anillo Orbital Externo 3D (USDC Settlement) */}
        <div className="stage-orbit-ring outer-orbit">
          <div className="stage-orbit-node sat-usdc">
            <span className="node-glow-dot" />
            <span className="node-badge">USDC Instantáneo</span>
          </div>
        </div>

        {/* Anillo Orbital Medio 3D (Stellar Core) */}
        <div className="stage-orbit-ring mid-orbit">
          <div className="stage-orbit-node sat-stellar">
            <span className="node-glow-dot cyan" />
            <span className="node-badge">Stellar Core</span>
          </div>
        </div>

        {/* Anillo Orbital Interno 3D (Soroban Escrow) */}
        <div className="stage-orbit-ring inner-orbit">
          <div className="stage-orbit-node sat-soroban">
            <span className="node-glow-dot" />
            <span className="node-badge">Soroban Escrow</span>
          </div>
        </div>

        {/* Esfera Planetaria Celestial */}
        <div className="stage-planet-sphere">
          <div className="stage-planet-atmosphere" />
          <div className="stage-planet-core-light" />

          {/* Emblema K Futurista Oficial */}
          <div className="stage-planet-emblem">
            <svg viewBox="0 0 48 48" fill="none" className="stage-emblem-svg">
              <path
                d="M14 8V40M14 24L32 8M18 20L34 40"
                stroke="#5EEAD4"
                strokeWidth="4.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* 4. Telemetría HUD de Infraestructura (Limpia, sin emojis) */}
      <div className="stage-hud-overlay">
        <div className="stage-hud-row top">
          <div className="stage-hud-pill">
            <span className="hud-status-dot" />
            <span>Horizon Testnet Online</span>
          </div>
          <div className="stage-hud-pill">
            <span>Consenso: 3.5s</span>
          </div>
        </div>

        <div className="stage-hud-row bottom">
          <div className="stage-hud-pill">
            <span>0 Gas · Pollar Sponsored</span>
          </div>
          <span className="stage-hud-hint">Toca para emitir pulsos estelares</span>
        </div>
      </div>
    </div>
  );
}
