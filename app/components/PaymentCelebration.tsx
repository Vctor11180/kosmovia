'use client';

import React, { useEffect, useRef } from 'react';

export interface CelebrationPayload {
  amount: number | string;
  asset: string;
  concept?: string;
  recipient?: string;
}

interface PaymentCelebrationProps {
  data: CelebrationPayload | null;
  onClose: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  shape: 'circle' | 'square' | 'star';
  rotation: number;
  vRot: number;
  alpha: number;
  decay: number;
}

const PALETTE = ['#2DD4BF', '#5EEAD4', '#14B8A6', '#FBBF24', '#FFFFFF', '#38BDF8'];

export function PaymentCelebration({ data, onClose }: PaymentCelebrationProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!data) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const width = (canvas.width = window.innerWidth * dpr);
    const height = (canvas.height = window.innerHeight * dpr);

    const particles: Particle[] = [];
    const count = 90;

    // Generar partículas disparadas en abanico desde abajo
    for (let i = 0; i < count; i++) {
      const isLeft = i % 2 === 0;
      const originX = isLeft ? width * 0.18 : width * 0.82;
      const originY = height * 0.95;

      const angle = isLeft
        ? -Math.PI / 4 + (Math.random() - 0.5) * 0.55
        : (-3 * Math.PI) / 4 + (Math.random() - 0.5) * 0.55;
      const speed = (Math.random() * 13 + 9) * dpr;

      particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: (Math.random() * 6 + 4) * dpr,
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        shape: Math.random() > 0.6 ? 'star' : Math.random() > 0.3 ? 'circle' : 'square',
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
        alpha: 1,
        decay: Math.random() * 0.008 + 0.007,
      });
    }

    const startTime = performance.now();

    const drawStar = (c: CanvasRenderingContext2D, size: number) => {
      c.beginPath();
      c.moveTo(0, -size);
      c.lineTo(size * 0.3, -size * 0.3);
      c.lineTo(size, 0);
      c.lineTo(size * 0.3, size * 0.3);
      c.lineTo(0, size);
      c.lineTo(-size * 0.3, size * 0.3);
      c.lineTo(-size, 0);
      c.lineTo(-size * 0.3, -size * 0.3);
      c.closePath();
      c.fill();
    };

    const render = (now: number) => {
      const elapsed = now - startTime;
      ctx.clearRect(0, 0, width, height);

      let alive = 0;

      for (const p of particles) {
        if (p.alpha <= 0.01) continue;
        alive++;

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.22 * dpr; // gravedad
        p.vx *= 0.985; // resistencia del aire
        p.vy *= 0.985;
        p.rotation += p.vRot;
        p.alpha = Math.max(0, p.alpha - p.decay);

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        if (p.shape === 'star') {
          drawStar(ctx, p.size);
        } else if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
        }

        ctx.restore();
      }

      if (alive > 0 && elapsed < 3500) {
        animId = requestAnimationFrame(render);
      }
    };

    animId = requestAnimationFrame(render);

    const timer = setTimeout(() => {
      onClose();
    }, 4200);

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(timer);
    };
  }, [data, onClose]);

  if (!data) return null;

  return (
    <div className="celebration-overlay" onClick={onClose} role="dialog" aria-live="assertive">
      <canvas ref={canvasRef} className="celebration-canvas" />

      <div className="celebration-card" onClick={(e) => e.stopPropagation()}>
        <div className="celebration-sparkles-top" aria-hidden="true">
          ✦ &nbsp; ★ &nbsp; ✦
        </div>

        <div className="celebration-badge">
          <span className="stellar-dot-pulse" />
          <span>ON-CHAIN CONFIRMADO · STELLAR TESTNET</span>
        </div>

        <div className="celebration-amount-row">
          <span className="celebration-amount-val">{data.amount}</span>
          <span className="celebration-amount-asset">{data.asset}</span>
        </div>

        {data.concept ? (
          <p className="celebration-concept">&ldquo;{data.concept}&rdquo;</p>
        ) : (
          <p className="celebration-concept">Transferencia directa en Stellar Testnet</p>
        )}

        {data.recipient && (
          <div className="celebration-recipient">
            Destinatario: <strong>{data.recipient}</strong>
          </div>
        )}

        <div className="celebration-footer">
          <span className="celebration-subdetail">⚡ Liquidación instantánea · Gas patrocinado</span>
          <button type="button" className="celebration-dismiss-btn" onClick={onClose}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
