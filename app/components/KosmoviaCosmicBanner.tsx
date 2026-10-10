'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

interface CommunityHub {
  id: string;
  name: string;
  role: string;
  badge: string;
  baseAngle: number;
  orbitRadiusFrac: number;
  orbitSpeed: number;
  color: string;
  x: number;
  y: number;
  radius: number;
  pulsePhase: number;
  lastConnected: number;
}

interface MemberNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  color: string;
  parentHubIndex: number;
  orbitAngle: number;
  orbitDist: number;
  orbitSpeed: number;
}

interface CurvedPacket {
  fromX: number;
  fromY: number;
  ctrlX: number;
  ctrlY: number;
  toX: number;
  toY: number;
  progress: number;
  speed: number;
  color: string;
  label: string;
}

interface HandshakeRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

interface ConsensusPulse {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  speed: number;
}

interface StarParticle {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  twinkleSpeed: number;
  phase: number;
  color: string;
}

export interface KosmoviaCosmicBannerProps {
  className?: string;
  onExploreClick?: () => void;
}

const PRIMARY_HUBS_DEF = [
  {
    id: 'lapaz',
    name: 'La Paz Hub',
    role: 'Builders & Tech Rebel',
    badge: 'Comunidad Activa',
    baseAngle: 0.35,
    orbitRadiusFrac: 0.38,
    orbitSpeed: 0.0007,
    color: '#5EEAD4',
    radius: 9,
  },
  {
    id: 'santacruz',
    name: 'Santa Cruz Hub',
    role: 'Comercios & Pagos B2B',
    badge: 'Canal USDC Activo',
    baseAngle: 1.4,
    orbitRadiusFrac: 0.42,
    orbitSpeed: -0.0006,
    color: '#2DD4BF',
    radius: 9,
  },
  {
    id: 'cochabamba',
    name: 'Cochabamba Devs',
    role: 'Comunidad e Innovación',
    badge: 'Canal P2P Activo',
    baseAngle: 2.45,
    orbitRadiusFrac: 0.36,
    orbitSpeed: 0.0008,
    color: '#38BDF8',
    radius: 8.5,
  },
  {
    id: 'soroban',
    name: 'Soroban Escrow',
    role: 'Contratos Inteligentes',
    badge: 'Garantía 0 Gas',
    baseAngle: 3.5,
    orbitRadiusFrac: 0.43,
    orbitSpeed: -0.0005,
    color: '#14B8A6',
    radius: 9,
  },
  {
    id: 'passkeys',
    name: 'Billetera Passkeys',
    role: 'Identidad WebAuthn',
    badge: 'Sin Frases Semilla',
    baseAngle: 4.6,
    orbitRadiusFrac: 0.35,
    orbitSpeed: 0.0007,
    color: '#5EEAD4',
    radius: 8.5,
  },
  {
    id: 'b2b',
    name: 'Pasarela B2B',
    role: 'Liquidación Instantánea',
    badge: 'Comprobantes SEP-0007',
    baseAngle: 5.65,
    orbitRadiusFrac: 0.42,
    orbitSpeed: -0.0007,
    color: '#2DD4BF',
    radius: 9,
  },
];

/**
 * KosmoviaCosmicBanner:
 * Simulación cósmica interactiva con el Planeta Kosmovia como núcleo vivo,
 * tejiendo arcos luminosos y conexiones estelares hacia comunidades en Bolivia y contratos Stellar.
 */
export function KosmoviaCosmicBanner({
  className = '',
  onExploreClick,
}: KosmoviaCosmicBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [hoveredTarget, setHoveredTarget] = useState<{
    type: 'planet' | 'hub';
    name: string;
    role: string;
    badge: string;
    color: string;
  } | null>(null);

  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [ledgerCount, setLedgerCount] = useState(542915);

  const pointerRef = useRef<{ x: number; y: number; active: boolean; isDown: boolean }>({
    x: -999,
    y: -999,
    active: false,
    isDown: false,
  });

  const ripplesRef = useRef<HandshakeRipple[]>([]);
  const consensusPulsesRef = useRef<ConsensusPulse[]>([]);
  const packetsRef = useRef<CurvedPacket[]>([]);

  // Disparar pulso de consenso y onda gravitacional al interactuar
  const triggerConsensusWave = useCallback((x?: number, y?: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const spawnX = x !== undefined ? x : rect.width * 0.5;
    const spawnY = y !== undefined ? y : rect.height * 0.5;

    consensusPulsesRef.current.push({
      x: spawnX,
      y: spawnY,
      radius: 8,
      maxRadius: Math.max(rect.width, rect.height) * 0.72,
      alpha: 0.95,
      speed: 6.2,
    });

    ripplesRef.current.push({
      x: spawnX,
      y: spawnY,
      radius: 4,
      maxRadius: 85,
      alpha: 0.9,
      color: '#5EEAD4',
    });
  }, []);

  // Motor principal del Canvas de Simulación a 60 FPS
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

    // Inicializar hubs
    const hubs: CommunityHub[] = PRIMARY_HUBS_DEF.map((def) => ({
      ...def,
      x: 0,
      y: 0,
      pulsePhase: Math.random() * Math.PI * 2,
      lastConnected: Date.now(),
    }));

    // Micro-nodos satélites (miembros de comunidad)
    const members: MemberNode[] = [];
    const memberColors = ['#5EEAD4', '#2DD4BF', '#14B8A6', '#F2FBFA', '#38BDF8'];

    // Estrellas de fondo
    const stars: StarParticle[] = [];

    const initSimulation = () => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      width = Math.max(rect.width, 320);
      height = Math.max(rect.height, 320);
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
      cx = width * 0.5;
      cy = height * 0.5;

      const minDimension = Math.min(width, height);

      // Calcular posiciones de hubs
      hubs.forEach((hub) => {
        const r = minDimension * hub.orbitRadiusFrac;
        hub.x = cx + Math.cos(hub.baseAngle) * r;
        hub.y = cy + Math.sin(hub.baseAngle) * r * 0.85;
      });

      // Crear 24 nodos miembros orbitando alrededor de los hubs
      members.length = 0;
      for (let i = 0; i < 26; i++) {
        const parentIdx = i % hubs.length;
        members.push({
          x: 0,
          y: 0,
          vx: 0,
          vy: 0,
          radius: Math.random() * 1.8 + 1,
          alpha: Math.random() * 0.6 + 0.35,
          color: memberColors[Math.floor(Math.random() * memberColors.length)],
          parentHubIndex: parentIdx,
          orbitAngle: Math.random() * Math.PI * 2,
          orbitDist: Math.random() * 30 + 16,
          orbitSpeed: (Math.random() * 0.02 + 0.01) * (Math.random() > 0.5 ? 1 : -1),
        });
      }

      // Estrellas en el espacio profundo
      stars.length = 0;
      for (let s = 0; s < 50; s++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.5 + 0.5,
          baseAlpha: Math.random() * 0.55 + 0.25,
          twinkleSpeed: Math.random() * 0.03 + 0.015,
          phase: Math.random() * Math.PI * 2,
          color: Math.random() > 0.4 ? '#5EEAD4' : '#FFFFFF',
        });
      }
    };

    initSimulation();

    const resizeObserver = new ResizeObserver(() => {
      initSimulation();
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Intervalo de Consenso Stellar (3.5 segundos = tiempo de ledger Stellar)
    let nextConsensusTime = Date.now() + 3500;
    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.016;

      const now = Date.now();
      const pointer = pointerRef.current;
      const minDimension = Math.min(width, height);
      const planetRadius = Math.max(48, Math.min(width, height) * 0.16);

      // 0. Render de Estrellas en el espacio profundo
      stars.forEach((st) => {
        st.phase += st.twinkleSpeed;
        const currentAlpha = Math.min(1, Math.max(0.15, st.baseAlpha + Math.sin(st.phase) * 0.3));
        ctx.fillStyle = st.color;
        ctx.globalAlpha = currentAlpha;
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // 1. Latido de Consenso Stellar cada 3.5 segundos (Nace en el Planeta)
      if (now > nextConsensusTime) {
        setLedgerCount((prev) => prev + 1);

        // Gran onda expansiva que brota del corazón del planeta
        consensusPulsesRef.current.push({
          x: cx,
          y: cy,
          radius: planetRadius * 0.5,
          maxRadius: Math.max(width, height) * 0.75,
          alpha: 1,
          speed: 6.0,
        });

        // Al latir, disparar paquetes curvos de USDC desde el planeta hacia todos los hubs
        hubs.forEach((hub, idx) => {
          // Punto en la superficie del planeta
          const angle = Math.atan2(hub.y - cy, hub.x - cx);
          const pSurfX = cx + Math.cos(angle) * planetRadius;
          const pSurfY = cy + Math.sin(angle) * planetRadius;

          // Punto de control para la curva bezier
          const perpAngle = angle + Math.PI * 0.5;
          const curveLift = (idx % 2 === 0 ? 1 : -1) * 35;
          const ctrlX = (pSurfX + hub.x) * 0.5 + Math.cos(perpAngle) * curveLift;
          const ctrlY = (pSurfY + hub.y) * 0.5 + Math.sin(perpAngle) * curveLift;

          packetsRef.current.push({
            fromX: pSurfX,
            fromY: pSurfY,
            ctrlX,
            ctrlY,
            toX: hub.x,
            toY: hub.y,
            progress: 0,
            speed: Math.random() * 0.015 + 0.02,
            color: '#5EEAD4',
            label: 'USDC',
          });

          // Handshake ripple en cada nodo al sincronizarse
          ripplesRef.current.push({
            x: hub.x,
            y: hub.y,
            radius: 3,
            maxRadius: 26,
            alpha: 0.85,
            color: hub.color,
          });
        });

        nextConsensusTime = now + 3500;
      }

      // 2. Render de Ondas de Consenso Stellar
      for (let c = consensusPulsesRef.current.length - 1; c >= 0; c--) {
        const wave = consensusPulsesRef.current[c];
        wave.radius += wave.speed;
        wave.alpha = Math.max(0, 0.95 * (1 - wave.radius / wave.maxRadius));

        // Anillo exterior brillante
        ctx.strokeStyle = `rgba(94, 234, 212, ${wave.alpha * 0.85})`;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Anillo interior sutil
        ctx.strokeStyle = `rgba(45, 212, 191, ${wave.alpha * 0.35})`;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, Math.max(0, wave.radius - 10), 0, Math.PI * 2);
        ctx.stroke();

        if (wave.radius >= wave.maxRadius) {
          consensusPulsesRef.current.splice(c, 1);
        }
      }

      // 3. Render de Ondas de Handshake (Apretón de manos de conexión)
      for (let r = ripplesRef.current.length - 1; r >= 0; r--) {
        const ripple = ripplesRef.current[r];
        ripple.radius += 1.4;
        ripple.alpha = Math.max(0, 0.85 * (1 - ripple.radius / ripple.maxRadius));

        ctx.strokeStyle = `rgba(94, 234, 212, ${ripple.alpha})`;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        ctx.stroke();

        if (ripple.radius >= ripple.maxRadius) {
          ripplesRef.current.splice(r, 1);
        }
      }

      // 4. Actualizar posiciones orbitales suaves de los Hubs
      hubs.forEach((hub) => {
        hub.baseAngle += hub.orbitSpeed;
        const r = minDimension * hub.orbitRadiusFrac;
        const targetX = cx + Math.cos(hub.baseAngle) * r;
        const targetY = cy + Math.sin(hub.baseAngle) * r * 0.85;

        hub.x += (targetX - hub.x) * 0.05;
        hub.y += (targetY - hub.y) * 0.05;
        hub.pulsePhase += 0.03;
      });

      // 5. Arcos Geodésicos Curvos de Conexión entre el PLANETA y los HUBS
      hubs.forEach((hub, idx) => {
        const angle = Math.atan2(hub.y - cy, hub.x - cx);
        const pSurfX = cx + Math.cos(angle) * (planetRadius * 0.98);
        const pSurfY = cy + Math.sin(angle) * (planetRadius * 0.98);

        const perpAngle = angle + Math.PI * 0.5;
        const curveLift = (idx % 2 === 0 ? 1 : -1) * 35;
        const ctrlX = (pSurfX + hub.x) * 0.5 + Math.cos(perpAngle) * curveLift;
        const ctrlY = (pSurfY + hub.y) * 0.5 + Math.sin(perpAngle) * curveLift;

        // Pulso de energía en el arco
        const beamPulse = Math.sin(time * 3 + idx * 1.2) * 0.2 + 0.45;

        // Halo exterior del arco
        ctx.strokeStyle = `rgba(45, 212, 191, ${beamPulse * 0.35})`;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(pSurfX, pSurfY);
        ctx.quadraticCurveTo(ctrlX, ctrlY, hub.x, hub.y);
        ctx.stroke();

        // Filamento central brillante
        ctx.strokeStyle = `rgba(94, 234, 212, ${beamPulse})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(pSurfX, pSurfY);
        ctx.quadraticCurveTo(ctrlX, ctrlY, hub.x, hub.y);
        ctx.stroke();
      });

      // 6. Conexiones Inter-Hubs (Malla descentralizada entre nodos vecinos)
      for (let i = 0; i < hubs.length; i++) {
        for (let j = i + 1; j < hubs.length; j++) {
          const h1 = hubs[i];
          const h2 = hubs[j];
          const dx = h2.x - h1.x;
          const dy = h2.y - h1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxInterDist = minDimension * 0.5;

          if (dist < maxInterDist) {
            const interAlpha = (1 - dist / maxInterDist) * 0.3;
            ctx.strokeStyle = `rgba(45, 212, 191, ${interAlpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(h1.x, h1.y);
            ctx.lineTo(h2.x, h2.y);
            ctx.stroke();
          }
        }
      }

      // 7. Render de Paquetes de Pago Curvos (USDC en tránsito por las curvas)
      for (let p = packetsRef.current.length - 1; p >= 0; p--) {
        const pkt = packetsRef.current[p];
        pkt.progress += pkt.speed;

        const t = pkt.progress;
        const oneMinusT = 1 - t;

        // Fórmula cuadrática Bezier: B(t) = (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
        const currX =
          oneMinusT * oneMinusT * pkt.fromX + 2 * oneMinusT * t * pkt.ctrlX + t * t * pkt.toX;
        const currY =
          oneMinusT * oneMinusT * pkt.fromY + 2 * oneMinusT * t * pkt.ctrlY + t * t * pkt.toY;

        // Estela previa
        const prevT = Math.max(0, t - 0.08);
        const prevOneMinusT = 1 - prevT;
        const tailX =
          prevOneMinusT * prevOneMinusT * pkt.fromX +
          2 * prevOneMinusT * prevT * pkt.ctrlX +
          prevT * prevT * pkt.toX;
        const tailY =
          prevOneMinusT * prevOneMinusT * pkt.fromY +
          2 * prevOneMinusT * prevT * pkt.ctrlY +
          prevT * prevT * pkt.toY;

        const pktGrad = ctx.createLinearGradient(tailX, tailY, currX, currY);
        pktGrad.addColorStop(0, 'rgba(45, 212, 191, 0)');
        pktGrad.addColorStop(1, pkt.color);

        ctx.strokeStyle = pktGrad;
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(currX, currY);
        ctx.stroke();

        // Cabeza luminosa del paquete
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = pkt.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(currX, currY, 2.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Al llegar al nodo de destino
        if (pkt.progress >= 1) {
          ripplesRef.current.push({
            x: pkt.toX,
            y: pkt.toY,
            radius: 3,
            maxRadius: 20,
            alpha: 0.85,
            color: pkt.color,
          });
          packetsRef.current.splice(p, 1);
        }
      }

      // 8. Tejedor interactivo con el puntero/touch
      if (pointer.active && pointer.x > 0 && pointer.y > 0) {
        // Conexión con el Planeta
        const pdx = pointer.x - cx;
        const pdy = pointer.y - cy;
        const pdist = Math.sqrt(pdx * pdx + pdy * pdy);

        if (pdist < 260) {
          const beamAlpha = (1 - pdist / 260) * 0.8;
          ctx.strokeStyle = `rgba(94, 234, 212, ${beamAlpha})`;
          ctx.lineWidth = 1.8;
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.moveTo(pointer.x, pointer.y);
          ctx.lineTo(cx, cy);
          ctx.stroke();
          ctx.setLineDash([]);

          // Partícula corriendo al núcleo
          const flowProgress = (time * 2.2) % 1;
          const fx = pointer.x + (cx - pointer.x) * flowProgress;
          const fy = pointer.y + (cy - pointer.y) * flowProgress;
          ctx.fillStyle = '#5EEAD4';
          ctx.beginPath();
          ctx.arc(fx, fy, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Conexión con los Hubs cercanos
        hubs.forEach((hub) => {
          const hdx = pointer.x - hub.x;
          const hdy = pointer.y - hub.y;
          const hdist = Math.sqrt(hdx * hdx + hdy * hdy);
          if (hdist < 140) {
            const hAlpha = (1 - hdist / 140) * 0.7;
            ctx.strokeStyle = `rgba(94, 234, 212, ${hAlpha})`;
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(pointer.x, pointer.y);
            ctx.lineTo(hub.x, hub.y);
            ctx.stroke();
          }
        });
      }

      // 9. Render de Nodos Miembros Orbitantes
      members.forEach((mem) => {
        const parent = hubs[mem.parentHubIndex];
        mem.orbitAngle += mem.orbitSpeed;
        mem.x = parent.x + Math.cos(mem.orbitAngle) * mem.orbitDist;
        mem.y = parent.y + Math.sin(mem.orbitAngle) * (mem.orbitDist * 0.8);

        ctx.strokeStyle = `rgba(45, 212, 191, ${mem.alpha * 0.25})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(parent.x, parent.y);
        ctx.lineTo(mem.x, mem.y);
        ctx.stroke();

        ctx.fillStyle = mem.color;
        ctx.globalAlpha = mem.alpha;
        ctx.beginPath();
        ctx.arc(mem.x, mem.y, mem.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // 10. EL PLANETA KOSMOVIA (Esfera Celeste 3D Revolucionaria y Viva)
      const atmPulse = Math.sin(time * 2) * 3;
      const currentPlanetR = planetRadius + atmPulse * 0.5;

      // 10.1 Halo atmosférico exterior expansivo
      const coronaGrad = ctx.createRadialGradient(
        cx,
        cy,
        currentPlanetR * 0.8,
        cx,
        cy,
        currentPlanetR * 1.65
      );
      coronaGrad.addColorStop(0, 'rgba(94, 234, 212, 0.45)');
      coronaGrad.addColorStop(0.35, 'rgba(45, 212, 191, 0.22)');
      coronaGrad.addColorStop(0.7, 'rgba(20, 184, 166, 0.08)');
      coronaGrad.addColorStop(1, 'rgba(6, 19, 20, 0)');

      ctx.fillStyle = coronaGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, currentPlanetR * 1.65, 0, Math.PI * 2);
      ctx.fill();

      // 10.2 Anillo orbital 3D inclinado (Horizon Protocol Ring)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-0.38); // Inclinación axial de 22 grados
      ctx.scale(1, 0.38); // Proyección elíptica 3D
      ctx.strokeStyle = 'rgba(94, 234, 212, 0.65)';
      ctx.lineWidth = 1.6;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.arc(0, 0, currentPlanetR * 1.45, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Satélite en la órbita inclinada (Stellar Node)
      const satAngle = time * 0.8;
      const satX = Math.cos(satAngle) * (currentPlanetR * 1.45);
      const satY = Math.sin(satAngle) * (currentPlanetR * 1.45);
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = '#5EEAD4';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(satX, satY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();

      // 10.3 Cuerpo Esférico 3D del Planeta (Sombreado volumétrico)
      const sphereGrad = ctx.createRadialGradient(
        cx - currentPlanetR * 0.35,
        cy - currentPlanetR * 0.35,
        currentPlanetR * 0.05,
        cx,
        cy,
        currentPlanetR
      );
      sphereGrad.addColorStop(0, '#5EEAD4'); // Reflejo estelar blanco-turquesa
      sphereGrad.addColorStop(0.25, '#14B8A6'); // Capa oceánica superficial
      sphereGrad.addColorStop(0.65, '#0B292C'); // Masa planetaria profunda
      sphereGrad.addColorStop(0.9, '#071A1C'); // Borde de penumbra
      sphereGrad.addColorStop(1, '#061314'); // Lado oscuro espacial

      ctx.fillStyle = sphereGrad;
      ctx.shadowColor = '#2DD4BF';
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.arc(cx, cy, currentPlanetR, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // 10.4 Malla Holográfica Geodésica Rotatoria (Wireframe vivo de paralelos y meridianos)
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, currentPlanetR, 0, Math.PI * 2);
      ctx.clip(); // Limitar estrictamente dentro de la esfera

      // Paralelos (latitud)
      const latitudes = [-0.65, -0.35, 0, 0.35, 0.65];
      latitudes.forEach((lat) => {
        const yOffset = lat * currentPlanetR;
        const rx = Math.sqrt(Math.max(0, currentPlanetR * currentPlanetR - yOffset * yOffset));
        const ry = rx * 0.35; // Inclinación en perspectiva
        ctx.strokeStyle = 'rgba(94, 234, 212, 0.22)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(cx, cy + yOffset, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Meridianos rotatorios (longitud) girando en 3D
      const rotAngle = time * 0.45;
      for (let m = 0; m < 8; m++) {
        const mAngle = (m / 8) * Math.PI * 2 + rotAngle;
        const cosM = Math.cos(mAngle);
        // Dibujar solo el hemisferio frontal visible
        if (cosM > -0.1) {
          const rx = currentPlanetR * Math.abs(cosM);
          ctx.strokeStyle = `rgba(94, 234, 212, ${0.18 + cosM * 0.18})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.ellipse(cx, cy, rx, currentPlanetR, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Hotspot Vivo: Gateway de Bolivia sobre la superficie rotatoria
      const boliviaAngle = rotAngle + 1.1;
      const cosB = Math.cos(boliviaAngle);
      if (cosB > 0) {
        const bx = cx + Math.sin(boliviaAngle) * (currentPlanetR * 0.65);
        const by = cy + Math.cos(boliviaAngle) * (currentPlanetR * 0.22) + currentPlanetR * 0.1;

        // Pulso de antena en Bolivia
        const bPulse = Math.sin(time * 5) * 4;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(bx, by, 5 + bPulse, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(bx, by, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      // 10.5 Borde de Limbo Atmosférico (Creciente luminosa en el cuadrante superior izquierdo)
      ctx.strokeStyle = 'rgba(94, 234, 212, 0.85)';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(cx, cy, currentPlanetR, Math.PI * 0.8, Math.PI * 1.85);
      ctx.stroke();

      // 10.6 Emblema Kosmovia Monograma Neón en el Centro del Planeta
      ctx.strokeStyle = '#F2FBFA';
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = '#5EEAD4';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(cx - 7, cy - 10);
      ctx.lineTo(cx - 7, cy + 10);
      ctx.moveTo(cx - 7, cy);
      ctx.lineTo(cx + 7, cy - 10);
      ctx.moveTo(cx - 2, cy - 2);
      ctx.lineTo(cx + 7, cy + 10);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Etiqueta tipográfica del Planeta
      ctx.fillStyle = '#5EEAD4';
      ctx.font = '800 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PLANETA KOSMOVIA', cx, cy + currentPlanetR + 18);

      ctx.fillStyle = '#8FB3B0';
      ctx.font = '500 9.5px system-ui, sans-serif';
      ctx.fillText('NEXUS STELLAR BOLIVIA', cx, cy + currentPlanetR + 30);

      // 11. Render de Hubs Principales de Kosmovia
      hubs.forEach((hub) => {
        const pulse = Math.sin(hub.pulsePhase) * 2;
        const currentR = hub.radius + pulse;

        // Halo exterior
        ctx.fillStyle = `rgba(45, 212, 191, 0.16)`;
        ctx.beginPath();
        ctx.arc(hub.x, hub.y, currentR + 11, 0, Math.PI * 2);
        ctx.fill();

        // Anillo de órbita local
        ctx.strokeStyle = `rgba(94, 234, 212, 0.45)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(hub.x, hub.y, currentR + 4, 0, Math.PI * 2);
        ctx.stroke();

        // Esfera principal
        const hubGrad = ctx.createRadialGradient(
          hub.x - 2,
          hub.y - 2,
          1,
          hub.x,
          hub.y,
          currentR
        );
        hubGrad.addColorStop(0, '#FFFFFF');
        hubGrad.addColorStop(0.4, hub.color);
        hubGrad.addColorStop(1, '#0B1F21');

        ctx.fillStyle = hubGrad;
        ctx.shadowColor = hub.color;
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(hub.x, hub.y, currentR, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Etiquetas tipográficas
        ctx.fillStyle = '#F2FBFA';
        ctx.font = '600 11px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(hub.name, hub.x, hub.y + currentR + 14);

        ctx.fillStyle = '#8FB3B0';
        ctx.font = '500 9.5px system-ui, sans-serif';
        ctx.fillText(hub.badge, hub.x, hub.y + currentR + 25);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, []);

  // Manejo de puntero para interacción y tooltips
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    pointerRef.current = {
      x,
      y,
      active: true,
      isDown: pointerRef.current.isDown,
    };

    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const cx = w * 0.5;
    const cy = h * 0.5;
    const minDim = Math.min(w, h);
    const planetRadius = Math.max(48, minDim * 0.16);

    // Detectar hover en el Planeta
    const distToPlanet = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
    if (distToPlanet < planetRadius + 15) {
      setHoveredTarget({
        type: 'planet',
        name: 'Planeta Kosmovia',
        role: 'Núcleo Central Stellar Bolivia',
        badge: 'Latido de Consenso Activo (3.5s)',
        color: '#5EEAD4',
      });
      setTooltipPos({ x: cx, y: cy - planetRadius - 16 });
      return;
    }

    // Detectar hover en algún Hub
    let foundHub: CommunityHub | null = null;
    PRIMARY_HUBS_DEF.forEach((def) => {
      const hx = cx + Math.cos(def.baseAngle) * minDim * def.orbitRadiusFrac;
      const hy = cy + Math.sin(def.baseAngle) * minDim * def.orbitRadiusFrac * 0.85;
      const dist = Math.sqrt((x - hx) ** 2 + (y - hy) ** 2);
      if (dist < 26) {
        foundHub = {
          ...def,
          x: hx,
          y: hy,
          pulsePhase: 0,
          lastConnected: Date.now(),
        };
        setTooltipPos({ x: hx, y: hy - 38 });
      }
    });

    if (foundHub) {
      const hub = foundHub as CommunityHub;
      setHoveredTarget({
        type: 'hub',
        name: hub.name,
        role: hub.role,
        badge: hub.badge,
        color: hub.color,
      });
    } else {
      setHoveredTarget(null);
    }
  };

  const handlePointerLeave = () => {
    pointerRef.current.active = false;
    setHoveredTarget(null);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pointerRef.current.isDown = true;
    const rect = e.currentTarget.getBoundingClientRect();
    triggerConsensusWave(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handlePointerUp = () => {
    pointerRef.current.isDown = false;
  };

  return (
    <div
      ref={containerRef}
      className={`kosmo-network-sim-stage ${className}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      role="region"
      aria-label="Simulación cósmica interactiva de Kosmovia y comunidades conectadas en Stellar"
    >
      {/* 1. Fondo Artwork Oficial Kosmovia + Nebulosas Vivas Iluminadas (Adiós fondo apagado) */}
      <div className="sim-artwork-backdrop">
        <img
          src="/brand/kosmovia-banner.jpg"
          alt=""
          className="sim-artwork-img"
          loading="eager"
        />
        <div className="sim-nebula-aurora-1" />
        <div className="sim-nebula-aurora-2" />
        <div className="sim-vignette-radial" />
      </div>

      {/* 2. Canvas 2D de alta fidelidad para el Planeta y la Red Viva */}
      <canvas ref={canvasRef} className="sim-canvas-layer" />

      {/* 3. Tooltip interactivo holográfico al pasar el cursor */}
      {hoveredTarget && (
        <div
          className="sim-node-tooltip"
          style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
        >
          <div className="tooltip-header">
            <span className="tooltip-dot" style={{ backgroundColor: hoveredTarget.color }} />
            <span className="tooltip-title">{hoveredTarget.name}</span>
          </div>
          <div className="tooltip-desc">{hoveredTarget.role}</div>
          <div className="tooltip-status">
            {hoveredTarget.type === 'planet'
              ? 'Conexión Geodésica con Nodos de Bolivia · Red Stellar'
              : 'Canal Criptográfico Activo · 0 Gas Pollar'}
          </div>
        </div>
      )}

      {/* 4. Telemetría de Red Viva (Estilo Fintech Web3) */}
      <div className="sim-hud-overlay">
        <div className="sim-hud-row top">
          <div className="sim-hud-badge live">
            <span className="hud-live-dot" />
            <span>Planeta Kosmovia · Red Stellar Horizon</span>
          </div>
          <div className="sim-hud-badge metrics">
            <span>Ledger #{ledgerCount} · Consenso: 3.5s</span>
          </div>
        </div>

        <div className="sim-hud-row bottom">
          <div className="sim-hud-badge feature">
            <span>Canales B2B & Escrow Soroban · Bolivia</span>
          </div>
          <div className="sim-hud-hint">
            <span>Toca o arrastra para expandir la conexión cósmica</span>
          </div>
        </div>
      </div>
    </div>
  );
}
