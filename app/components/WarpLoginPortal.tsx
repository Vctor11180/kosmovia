'use client';

import React, { useEffect, useRef, useState } from 'react';

interface WarpLoginPortalProps {
  isWarping: boolean;
  username?: string;
  onComplete: () => void;
}

interface Star3D {
  x: number;
  y: number;
  z: number;
  pz: number;
  color: string;
}

const VERIFICATION_STEPS = [
  'Verificando identidad Passkey WebAuthn',
  'Conectando a Stellar Horizon Testnet',
  'Inicializando billetera no custodia',
  'Acceso autorizado · Entrando a Kosmovia',
];

export function WarpLoginPortal({
  isWarping,
  username = '@usuario',
  onComplete,
}: WarpLoginPortalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Manejador del avance de pasos durante el warp
  useEffect(() => {
    if (!isWarping) {
      setCurrentStepIndex(0);
      return;
    }

    const t1 = setTimeout(() => setCurrentStepIndex(1), 380);
    const t2 = setTimeout(() => setCurrentStepIndex(2), 760);
    const t3 = setTimeout(() => setCurrentStepIndex(3), 1140);
    const t4 = setTimeout(() => onComplete(), 1520);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [isWarping, onComplete]);

  // Motor de renderizado del Canvas 3D a 60 FPS
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let cx = 0;
    let cy = 0;

    const stars: Star3D[] = [];
    const colors = ['#2DD4BF', '#5EEAD4', '#14B8A6', '#F2FBFA', '#38BDF8'];
    const STAR_COUNT = 180;
    const MAX_DEPTH = 1000;

    const initSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
      cx = width / 2;
      cy = height / 2;

      stars.length = 0;
      for (let i = 0; i < STAR_COUNT; i++) {
        const z = Math.random() * MAX_DEPTH;
        stars.push({
          x: (Math.random() - 0.5) * width * 2,
          y: (Math.random() - 0.5) * height * 2,
          z,
          pz: z,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    initSize();
    window.addEventListener('resize', initSize);

    let warpSpeed = 1.2;

    const render = () => {
      // Si está en hiperespacio, fondo con estela
      if (isWarping) {
        ctx.fillStyle = 'rgba(6, 19, 20, 0.28)';
        ctx.fillRect(0, 0, width, height);
        warpSpeed = Math.min(warpSpeed + 0.8, 38);
      } else {
        ctx.clearRect(0, 0, width, height);
        warpSpeed = 1.2;
      }

      const fov = 340;

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        star.pz = star.z;
        star.z -= warpSpeed;

        if (star.z <= 1) {
          star.z = MAX_DEPTH;
          star.pz = MAX_DEPTH;
          star.x = (Math.random() - 0.5) * width * 2;
          star.y = (Math.random() - 0.5) * height * 2;
        }

        const k = fov / star.z;
        const px = star.x * k + cx;
        const py = star.y * k + cy;

        if (px < 0 || px >= width || py < 0 || py >= height) {
          star.z = MAX_DEPTH;
          star.pz = MAX_DEPTH;
          continue;
        }

        if (isWarping && warpSpeed > 4) {
          // Estela de velocidad hiperespacial
          const pk = fov / star.pz;
          const ppx = star.x * pk + cx;
          const ppy = star.y * pk + cy;

          const grad = ctx.createLinearGradient(ppx, ppy, px, py);
          grad.addColorStop(0, 'rgba(45, 212, 191, 0)');
          grad.addColorStop(1, star.color);

          ctx.strokeStyle = grad;
          ctx.lineWidth = Math.min(2.8, (1 - star.z / MAX_DEPTH) * 3);
          ctx.beginPath();
          ctx.moveTo(ppx, ppy);
          ctx.lineTo(px, py);
          ctx.stroke();
        } else {
          // Estrella sutil en reposo
          const size = Math.max(0.8, (1 - star.z / MAX_DEPTH) * 2.2);
          const alpha = Math.min(1, Math.max(0.2, (1 - star.z / MAX_DEPTH) * 0.9));

          ctx.fillStyle = star.color;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', initSize);
    };
  }, [isWarping]);

  return (
    <div className={`warp-portal-root ${isWarping ? 'is-warping' : ''}`} aria-hidden={!isWarping}>
      {/* 1. Canvas 3D de fondo (Estrellas + Túnel Hiperespacial) */}
      <canvas ref={canvasRef} className="warp-starfield-canvas" />

      {/* 2. HUD Holográfico de Verificación al iniciar sesión */}
      {isWarping && (
        <div className="warp-hud-modal" role="status" aria-live="polite">
          <div className="warp-hud-core">
            {/* Anillos giratorios de energía estelar */}
            <div className="warp-portal-rings">
              <div className="warp-ring outer" />
              <div className="warp-ring middle" />
              <div className="warp-ring inner" />
              <div className="warp-core-logo">
                <img
                  src="/brand/kosmovia-logo.png"
                  alt="Kosmovia"
                  width={54}
                  height={54}
                  className="warp-logo-img"
                />
              </div>
            </div>

            {/* Identidad y estado */}
            <div className="warp-hud-header">
              <span className="warp-hud-badge">Stellar Consensus · Horizon</span>
              <h2 className="warp-hud-user">{username}</h2>
            </div>

            {/* Lista de pasos de verificación con micro-checks */}
            <div className="warp-steps-list">
              {VERIFICATION_STEPS.map((step, idx) => {
                const isDone = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                return (
                  <div
                    key={step}
                    className={`warp-step-item ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}`}
                  >
                    <span className="step-indicator">
                      {isDone ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : isCurrent ? (
                        <span className="step-spinner-dot" />
                      ) : (
                        <span className="step-pending-dot" />
                      )}
                    </span>
                    <span className="step-label">{step}</span>
                  </div>
                );
              })}
            </div>

            {/* Barra de progreso de salto estelar */}
            <div className="warp-progress-track">
              <div
                className="warp-progress-fill"
                style={{ width: `${((currentStepIndex + 1) / VERIFICATION_STEPS.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
