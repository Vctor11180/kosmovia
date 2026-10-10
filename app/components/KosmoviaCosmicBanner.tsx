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

interface DataPacket {
  fromIndex: number;
  toIndex: number;
  progress: number;
  speed: number;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  speed: number;
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

export interface KosmoviaCosmicBannerProps {
  mode?: 'showcase' | 'hero' | 'minimal';
  showControls?: boolean;
  className?: string;
  onExploreClick?: () => void;
}

export function KosmoviaCosmicBanner({
  mode = 'showcase',
  showControls = true,
  className = '',
  onExploreClick,
}: KosmoviaCosmicBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isHyperdrive, setIsHyperdrive] = useState(false);
  const [activeTab, setActiveTab] = useState<'interactive' | 'telemetry'>('interactive');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [waveCount, setWaveCount] = useState(0);

  // Posición del cursor o toque para interacción gravitatoria
  const pointerRef = useRef<{ x: number; y: number; active: boolean; isHovering: boolean }>({
    x: -999,
    y: -999,
    active: false,
    isHovering: false,
  });

  const shockwavesRef = useRef<Shockwave[]>([]);
  const meteorsRef = useRef<Meteor[]>([]);
  const isHyperdriveRef = useRef(false);

  useEffect(() => {
    isHyperdriveRef.current = isHyperdrive;
  }, [isHyperdrive]);

  // Disparar un pulso estelar gravitatorio
  const triggerPulse = useCallback((x?: number, y?: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const spawnX = x !== undefined ? x : rect.width * 0.5;
    const spawnY = y !== undefined ? y : rect.height * 0.5;

    shockwavesRef.current.push({
      x: spawnX,
      y: spawnY,
      radius: 5,
      maxRadius: Math.max(rect.width, rect.height) * 0.65,
      alpha: 0.9,
      speed: isHyperdriveRef.current ? 9 : 5.5,
    });
    setWaveCount((prev) => prev + 1);
  }, []);

  // Motor de renderizado del Canvas interactivo a 60 FPS
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Configuración de partículas estelares
    const particles: Particle[] = [];
    const packets: DataPacket[] = [];
    const colors = ['#2DD4BF', '#5EEAD4', '#14B8A6', '#F2FBFA', '#38BDF8'];

    const initCanvasSize = () => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      width = Math.max(rect.width, 320);
      height = Math.max(rect.height, 220);
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);

      // Adaptar densidad según resolución (móviles 35 nodos, desktop 70 nodos)
      const count = width < 640 ? 32 : width < 1024 ? 52 : 72;
      particles.length = 0;

      for (let i = 0; i < count; i++) {
        const vx = (Math.random() - 0.5) * 0.45;
        const vy = (Math.random() - 0.5) * 0.45;
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx,
          vy,
          baseVx: vx,
          baseVy: vy,
          radius: Math.random() * 2 + 1,
          alpha: Math.random() * 0.7 + 0.3,
          baseAlpha: Math.random() * 0.5 + 0.3,
          pulseAngle: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * 0.03 + 0.015,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }

      // Inicializar paquetes de microtransacciones
      packets.length = 0;
      for (let p = 0; p < 8; p++) {
        packets.push({
          fromIndex: Math.floor(Math.random() * count),
          toIndex: Math.floor(Math.random() * count),
          progress: Math.random(),
          speed: Math.random() * 0.015 + 0.008,
        });
      }
    };

    initCanvasSize();

    // Resize observer para reactividad fluida
    const resizeObserver = new ResizeObserver(() => {
      initCanvasSize();
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Temporizador para meteoros/estrellas fugaces periódicas
    let nextMeteorTime = Date.now() + 2000;

    // Loop de animación 60FPS
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const speedFactor = isHyperdriveRef.current ? 2.6 : 1;
      const pointer = pointerRef.current;

      // 1. Manejo de meteoros (estrellas fugaces)
      const now = Date.now();
      if (now > nextMeteorTime && meteorsRef.current.length < 2) {
        meteorsRef.current.push({
          x: Math.random() * width * 0.85,
          y: Math.random() * (height * 0.4),
          length: Math.random() * 70 + 40,
          speed: Math.random() * 8 + 7,
          angle: Math.PI / 4 + (Math.random() - 0.5) * 0.25,
          alpha: 1,
          life: 0,
          maxLife: 45,
        });
        nextMeteorTime = now + Math.random() * 4500 + 2500;
      }

      // Render de meteoros
      for (let m = meteorsRef.current.length - 1; m >= 0; m--) {
        const meteor = meteorsRef.current[m];
        meteor.life++;
        meteor.x += Math.cos(meteor.angle) * meteor.speed;
        meteor.y += Math.sin(meteor.angle) * meteor.speed;
        meteor.alpha = Math.max(0, 1 - meteor.life / meteor.maxLife);

        const tailX = meteor.x - Math.cos(meteor.angle) * meteor.length;
        const tailY = meteor.y - Math.sin(meteor.angle) * meteor.length;

        const grad = ctx.createLinearGradient(meteor.x, meteor.y, tailX, tailY);
        grad.addColorStop(0, `rgba(94, 234, 212, ${meteor.alpha})`);
        grad.addColorStop(0.3, `rgba(45, 212, 191, ${meteor.alpha * 0.6})`);
        grad.addColorStop(1, 'rgba(6, 19, 20, 0)');

        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(meteor.x, meteor.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        // Cabeza brillante del meteoro
        ctx.fillStyle = `rgba(242, 251, 250, ${meteor.alpha})`;
        ctx.beginPath();
        ctx.arc(meteor.x, meteor.y, 2, 0, Math.PI * 2);
        ctx.fill();

        if (meteor.life >= meteor.maxLife) {
          meteorsRef.current.splice(m, 1);
        }
      }

      // 2. Ondas gravitacionales (shockwaves)
      for (let w = shockwavesRef.current.length - 1; w >= 0; w--) {
        const wave = shockwavesRef.current[w];
        wave.radius += wave.speed;
        wave.alpha = Math.max(0, 0.9 * (1 - wave.radius / wave.maxRadius));

        // Anillo exterior
        ctx.strokeStyle = `rgba(94, 234, 212, ${wave.alpha * 0.7})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Anillo sutil interior
        ctx.strokeStyle = `rgba(45, 212, 191, ${wave.alpha * 0.3})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, Math.max(0, wave.radius - 8), 0, Math.PI * 2);
        ctx.stroke();

        if (wave.radius >= wave.maxRadius) {
          shockwavesRef.current.splice(w, 1);
        }
      }

      // 3. Actualización y física de partículas
      const numParticles = particles.length;
      for (let i = 0; i < numParticles; i++) {
        const p = particles[i];

        // Oscilación de brillo
        p.pulseAngle += p.pulseSpeed * speedFactor;
        p.alpha = Math.min(1, Math.max(0.15, p.baseAlpha + Math.sin(p.pulseAngle) * 0.28));

        // Interacción con ondas gravitacionales
        for (const wave of shockwavesRef.current) {
          const wdx = p.x - wave.x;
          const wdy = p.y - wave.y;
          const wdist = Math.sqrt(wdx * wdx + wdy * wdy);
          if (Math.abs(wdist - wave.radius) < 28) {
            const push = (1 - Math.abs(wdist - wave.radius) / 28) * 2.5;
            p.vx += (wdx / (wdist || 1)) * push * 0.2;
            p.vy += (wdy / (wdist || 1)) * push * 0.2;
            p.alpha = 1; // Destello momentáneo
          }
        }

        // Interacción gravitatoria con el cursor / touch
        if (pointer.active && pointer.x > 0 && pointer.y > 0) {
          const pdx = p.x - pointer.x;
          const pdy = p.y - pointer.y;
          const pdist = Math.sqrt(pdx * pdx + pdy * pdy);
          const maxDist = 130;

          if (pdist < maxDist && pdist > 1) {
            const repelForce = (1 - pdist / maxDist) * 1.8;
            p.vx += (pdx / pdist) * repelForce * 0.25;
            p.vy += (pdy / pdist) * repelForce * 0.25;
          }
        }

        // Fricción suave para recuperar la velocidad base
        p.vx = p.vx * 0.95 + p.baseVx * 0.05;
        p.vy = p.vy * 0.95 + p.baseVy * 0.05;

        // Desplazamiento
        p.x += p.vx * speedFactor;
        p.y += p.vy * speedFactor;

        // Rebote / teletransporte en bordes
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
      }

      // 4. Red de constelaciones (conexiones de comunidades)
      const connectDist = width < 640 ? 85 : 125;
      const activeConnections: [number, number, number][] = [];

      for (let i = 0; i < numParticles; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < numParticles; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectDist) {
            const lineAlpha = (1 - dist / connectDist) * 0.26;
            ctx.strokeStyle = `rgba(45, 212, 191, ${lineAlpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();

            activeConnections.push([i, j, dist]);
          }
        }
      }

      // 5. Render de paquetes de micropagos (flujo en las constelaciones)
      if (activeConnections.length > 0) {
        for (const packet of packets) {
          packet.progress += packet.speed * speedFactor;
          if (packet.progress >= 1) {
            packet.progress = 0;
            // Elegir una conexión activa aleatoria
            const randConn = activeConnections[Math.floor(Math.random() * activeConnections.length)];
            packet.fromIndex = randConn[0];
            packet.toIndex = randConn[1];
          }

          const fromP = particles[packet.fromIndex];
          const toP = particles[packet.toIndex];
          if (fromP && toP) {
            const px = fromP.x + (toP.x - fromP.x) * packet.progress;
            const py = fromP.y + (toP.y - fromP.y) * packet.progress;

            ctx.fillStyle = '#5EEAD4';
            ctx.shadowColor = '#2DD4BF';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(px, py, 2.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0; // reset
          }
        }
      }

      // 6. Render de los nodos estelares
      for (let i = 0; i < numParticles; i++) {
        const p = particles[i];
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Destello central para estrellas principales
        if (p.radius > 2.2) {
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

  // Event handlers para cursor y toques
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    pointerRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
      isHovering: true,
    };
  };

  const handlePointerLeave = () => {
    pointerRef.current.active = false;
    pointerRef.current.isHovering = false;
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    triggerPulse(x, y);
  };

  return (
    <div
      ref={containerRef}
      className={`kosmo-cosmic-banner ${mode} ${isFullscreen ? 'fullscreen-mode' : ''} ${className}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
      role="region"
      aria-label="Banner cósmico animado e interactivo de Kosmovia"
    >
      {/* 1. Capa de Fondo Estático Oficial con Parallax & Drift */}
      <div className="kosmo-banner-backdrop">
        <img
          src="/brand/kosmovia-banner.jpg"
          alt="Kosmovia Official Stellar Banner"
          className="kosmo-banner-img"
          loading="eager"
        />
        <div className="kosmo-banner-nebula-pulse" />
        <div className="kosmo-banner-vignette" />
      </div>

      {/* 2. Capa Canvas Interactiva (Constelaciones, Meteoros y Ondas de Choque) */}
      <canvas ref={canvasRef} className="kosmo-banner-canvas" />

      {/* 3. Escenario Planetario 3D con Anillo Orbital en Rotación */}
      <div className="kosmo-celestial-stage" aria-hidden="true">
        <div className="kosmo-celestial-orbit-system">
          {/* Anillo Orbital Externo 3D */}
          <div className="kosmo-orbit-ring outer-ring">
            <span className="kosmo-orbit-satellite sat-usdc" title="USDC Instant settlement">
              <span className="sat-dot" />
              <span className="sat-label">USDC</span>
            </span>
          </div>

          {/* Anillo Orbital Medio 3D */}
          <div className="kosmo-orbit-ring inner-ring">
            <span className="kosmo-orbit-satellite sat-xlm" title="Stellar Network">
              <span className="sat-dot" />
              <span className="sat-label">XLM</span>
            </span>
          </div>

          {/* Esfera Planetaria con Halo Turquesa */}
          <div className="kosmo-planet-sphere">
            <div className="kosmo-planet-atmosphere" />
            <div className="kosmo-planet-core-glow" />

            {/* Emblema K Futurista Central */}
            <div className="kosmo-planet-emblem">
              <svg viewBox="0 0 48 48" fill="none" className="kosmo-emblem-svg">
                <path
                  d="M14 8V40M14 24L32 8M18 20L34 40"
                  stroke="#5EEAD4"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Telemetría Holográfica & Badges de Red Stellar */}
      <div className="kosmo-banner-hud-overlay">
        <div className="kosmo-hud-top">
          <div className="kosmo-hud-badge live-node">
            <span className="hud-pulse-dot" />
            <span className="hud-text">Stellar Horizon · Testnet</span>
          </div>
          <div className="kosmo-hud-badge speed-badge">
            <span className="hud-icon">⚡</span>
            <span className="hud-text">Finalidad 3.5s · 0 Gas</span>
          </div>
        </div>

        {/* Información central (visible en modo showcase) */}
        {mode === 'showcase' && (
          <div className="kosmo-showcase-center-info">
            <span className="kosmo-showcase-subtitle">COMUNIDADES Y PAGOS · STELLAR NETWORK</span>
            <h2 className="kosmo-showcase-title">KOSMOVIA</h2>
            <p className="kosmo-showcase-caption">
              Infraestructura B2B descentralizada, billeteras con Passkeys y contratos Soroban en Bolivia.
            </p>
          </div>
        )}

        {/* 5. Barra de Controles Interactivos */}
        {showControls && (
          <div className="kosmo-banner-controls" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="kosmo-ctrl-btn"
              onClick={() => triggerPulse()}
              title="Disparar onda gravitacional estelar en el cosmos"
            >
              <span className="ctrl-icon">✨</span>
              <span className="ctrl-label">Pulso Estelar ({waveCount})</span>
            </button>

            <button
              type="button"
              className={`kosmo-ctrl-btn ${isHyperdrive ? 'active' : ''}`}
              onClick={() => setIsHyperdrive(!isHyperdrive)}
              title="Acelerar constelaciones a velocidad Hyperdrive"
            >
              <span className="ctrl-icon">{isHyperdrive ? '🚀' : '🛸'}</span>
              <span className="ctrl-label">{isHyperdrive ? 'Hyperdrive ON' : 'Velocidad Normal'}</span>
            </button>

            {mode === 'showcase' && (
              <button
                type="button"
                className={`kosmo-ctrl-btn ${isFullscreen ? 'active' : ''}`}
                onClick={() => setIsFullscreen(!isFullscreen)}
                title="Alternar vista inmersiva completa"
              >
                <span className="ctrl-icon">{isFullscreen ? '🗗' : '⛶'}</span>
                <span className="ctrl-label">{isFullscreen ? 'Reducir' : 'Expandir'}</span>
              </button>
            )}

            {onExploreClick && (
              <button
                type="button"
                className="kosmo-ctrl-btn primary"
                onClick={onExploreClick}
              >
                <span>Entrar a la dApp →</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Indicador sutil de interacción para el usuario */}
      <div className="kosmo-banner-interactive-hint">
        <span>Toca o arrastra para interactuar con las constelaciones</span>
      </div>
    </div>
  );
}
