'use client';

import React, { useEffect, useRef } from 'react';

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

export interface KosmoviaCosmicBannerProps {
  className?: string;
  showArtBackdrop?: boolean;
}

/**
 * KosmoviaCosmicBanner:
 * Fondo cósmico animado no bloqueante (pointer-events: none).
 * - Partículas estelares y constelaciones a 60 FPS en Canvas 2D.
 * - Meteoros y destellos estelares aleatorios.
 * - No bloquea clicks, scroll táctil en celulares ni navegación.
 */
export function KosmoviaCosmicBanner({
  className = '',
  showArtBackdrop = true,
}: KosmoviaCosmicBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Posición del cursor para gravedad estelar (escuchado de forma pasiva en window)
  const pointerRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -999,
    y: -999,
    active: false,
  });

  const meteorsRef = useRef<Meteor[]>([]);

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
      width = Math.max(rect.width, 320);
      height = Math.max(rect.height, 300);
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);

      // En móviles menos partículas para no gastar batería
      const isMobile = width < 768;
      const count = isMobile ? 32 : 65;
      particles.length = 0;

      for (let i = 0; i < count; i++) {
        const vx = (Math.random() - 0.5) * 0.35;
        const vy = (Math.random() - 0.5) * 0.35;
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx,
          vy,
          baseVx: vx,
          baseVy: vy,
          radius: Math.random() * 2 + 0.8,
          alpha: Math.random() * 0.6 + 0.25,
          baseAlpha: Math.random() * 0.5 + 0.2,
          pulseAngle: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * 0.02 + 0.01,
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

    // Escucha pasiva de puntero para no interferir con clicks
    const handlePointerMove = (e: PointerEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      pointerRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };

    const handlePointerLeave = () => {
      pointerRef.current.active = false;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave, { passive: true });

    let nextMeteorTime = Date.now() + 2500;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const pointer = pointerRef.current;
      const now = Date.now();

      // 1. Meteoros / estrellas fugaces
      if (now > nextMeteorTime && meteorsRef.current.length < 2) {
        meteorsRef.current.push({
          x: Math.random() * (width * 0.8),
          y: Math.random() * (height * 0.4),
          length: Math.random() * 60 + 35,
          speed: Math.random() * 6 + 6,
          angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2,
          alpha: 0.9,
          life: 0,
          maxLife: 40,
        });
        nextMeteorTime = now + Math.random() * 5000 + 3000;
      }

      for (let m = meteorsRef.current.length - 1; m >= 0; m--) {
        const meteor = meteorsRef.current[m];
        meteor.life++;
        meteor.x += Math.cos(meteor.angle) * meteor.speed;
        meteor.y += Math.sin(meteor.angle) * meteor.speed;
        meteor.alpha = Math.max(0, 0.9 * (1 - meteor.life / meteor.maxLife));

        const tailX = meteor.x - Math.cos(meteor.angle) * meteor.length;
        const tailY = meteor.y - Math.sin(meteor.angle) * meteor.length;

        const grad = ctx.createLinearGradient(meteor.x, meteor.y, tailX, tailY);
        grad.addColorStop(0, `rgba(94, 234, 212, ${meteor.alpha})`);
        grad.addColorStop(0.4, `rgba(45, 212, 191, ${meteor.alpha * 0.5})`);
        grad.addColorStop(1, 'rgba(6, 19, 20, 0)');

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(meteor.x, meteor.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        if (meteor.life >= meteor.maxLife) {
          meteorsRef.current.splice(m, 1);
        }
      }

      // 2. Partículas y física
      const numParticles = particles.length;
      for (let i = 0; i < numParticles; i++) {
        const p = particles[i];

        p.pulseAngle += p.pulseSpeed;
        p.alpha = Math.min(1, Math.max(0.15, p.baseAlpha + Math.sin(p.pulseAngle) * 0.25));

        // Gravedad suave con el cursor
        if (pointer.active && pointer.x > 0 && pointer.y > 0) {
          const pdx = p.x - pointer.x;
          const pdy = p.y - pointer.y;
          const pdist = Math.sqrt(pdx * pdx + pdy * pdy);
          const maxDist = 120;

          if (pdist < maxDist && pdist > 1) {
            const force = (1 - pdist / maxDist) * 1.2;
            p.vx += (pdx / pdist) * force * 0.15;
            p.vy += (pdy / pdist) * force * 0.15;
          }
        }

        p.vx = p.vx * 0.96 + p.baseVx * 0.04;
        p.vy = p.vy * 0.96 + p.baseVy * 0.04;

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
      }

      // 3. Red de constelaciones
      const connectDist = width < 768 ? 85 : 115;
      for (let i = 0; i < numParticles; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < numParticles; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectDist) {
            const lineAlpha = (1 - dist / connectDist) * 0.22;
            ctx.strokeStyle = `rgba(45, 212, 191, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // 4. Dibujar nodos estelares
      for (let i = 0; i < numParticles; i++) {
        const p = particles[i];
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`kosmo-cosmic-bg-layer ${className}`}
      aria-hidden="true"
    >
      {/* Artwork oficial de fondo con respiración lenta */}
      {showArtBackdrop && (
        <div className="kosmo-art-backdrop-wrap">
          <img
            src="/brand/kosmovia-banner.jpg"
            alt=""
            className="kosmo-art-backdrop-img"
            loading="eager"
          />
          <div className="kosmo-art-backdrop-glow" />
          <div className="kosmo-art-backdrop-vignette" />
        </div>
      )}

      {/* Canvas animado de constelaciones y meteoros */}
      <canvas ref={canvasRef} className="kosmo-cosmic-bg-canvas" />
    </div>
  );
}
