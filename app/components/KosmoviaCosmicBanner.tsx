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

interface ActiveChannel {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  alpha: number;
  energyPhase: number;
  color: string;
}

interface TransactionPacket {
  fromX: number;
  fromY: number;
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
    baseAngle: 0.3,
    orbitRadiusFrac: 0.38,
    orbitSpeed: 0.0008,
    color: '#5EEAD4',
    radius: 9,
  },
  {
    id: 'santacruz',
    name: 'Santa Cruz Hub',
    role: 'Comercios & Pagos B2B',
    badge: 'Canal USDC Activo',
    baseAngle: 1.35,
    orbitRadiusFrac: 0.42,
    orbitSpeed: -0.0007,
    color: '#2DD4BF',
    radius: 9,
  },
  {
    id: 'cochabamba',
    name: 'Cochabamba Devs',
    role: 'Comunidad e Innovación',
    badge: 'Canal P2P',
    baseAngle: 2.45,
    orbitRadiusFrac: 0.36,
    orbitSpeed: 0.0009,
    color: '#38BDF8',
    radius: 8,
  },
  {
    id: 'soroban',
    name: 'Soroban Escrow',
    role: 'Contratos Inteligentes',
    badge: 'Garantía 0 Gas',
    baseAngle: 3.55,
    orbitRadiusFrac: 0.44,
    orbitSpeed: -0.0006,
    color: '#14B8A6',
    radius: 8.5,
  },
  {
    id: 'passkeys',
    name: 'Billetera Passkeys',
    role: 'Identidad WebAuthn',
    badge: 'Sin Frases Semilla',
    baseAngle: 4.65,
    orbitRadiusFrac: 0.35,
    orbitSpeed: 0.0008,
    color: '#5EEAD4',
    radius: 8,
  },
  {
    id: 'b2b',
    name: 'Pasarela B2B',
    role: 'Liquidación Instantánea',
    badge: 'Comprobantes SEP-0007',
    baseAngle: 5.6,
    orbitRadiusFrac: 0.42,
    orbitSpeed: -0.0008,
    color: '#2DD4BF',
    radius: 8.5,
  },
];

/**
 * KosmoviaCosmicBanner:
 * Simulación viva de redes espaciales y comunidades descentralizadas conectándose en Stellar.
 * - 6 Nodos principales de comunidades y protocolos de Bolivia.
 * - Núcleo central celestial "Kosmovia Nexus" con emisión de consenso cada 3.5s.
 * - Handshakes de conexión con anillos luminosos y paquetes de pago USDC.
 * - Interacción gravitatoria: el cursor conecta y teje puentes energéticos entre nodos.
 */
export function KosmoviaCosmicBanner({
  className = '',
  onExploreClick,
}: KosmoviaCosmicBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [hoveredHub, setHoveredHub] = useState<CommunityHub | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [ledgerCount, setLedgerCount] = useState(542910);
  const [activeChannelsCount, setActiveChannelsCount] = useState(14);

  const pointerRef = useRef<{ x: number; y: number; active: boolean; isDown: boolean }>({
    x: -999,
    y: -999,
    active: false,
    isDown: false,
  });

  const ripplesRef = useRef<HandshakeRipple[]>([]);
  const consensusPulsesRef = useRef<ConsensusPulse[]>([]);
  const packetsRef = useRef<TransactionPacket[]>([]);

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
      maxRadius: Math.max(rect.width, rect.height) * 0.65,
      alpha: 0.9,
      speed: 5.8,
    });

    // Spawn ripples
    ripplesRef.current.push({
      x: spawnX,
      y: spawnY,
      radius: 4,
      maxRadius: 75,
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

    // Inicializar nodos principales
    const hubs: CommunityHub[] = PRIMARY_HUBS_DEF.map((def) => ({
      ...def,
      x: 0,
      y: 0,
      pulsePhase: Math.random() * Math.PI * 2,
      lastConnected: Date.now(),
    }));

    // Micro-nodos satélites (usuarios y miembros de comunidades)
    const members: MemberNode[] = [];
    const memberColors = ['#5EEAD4', '#2DD4BF', '#14B8A6', '#F2FBFA', '#38BDF8'];

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

      // Calcular posiciones de hubs
      const minDimension = Math.min(width, height);
      hubs.forEach((hub) => {
        const r = minDimension * hub.orbitRadiusFrac;
        hub.x = cx + Math.cos(hub.baseAngle) * r;
        hub.y = cy + Math.sin(hub.baseAngle) * r * 0.85; // Elipse espacial
      });

      // Crear 24 nodos miembros orbitando alrededor de los hubs
      members.length = 0;
      for (let i = 0; i < 28; i++) {
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
          orbitDist: Math.random() * 32 + 16,
          orbitSpeed: (Math.random() * 0.02 + 0.01) * (Math.random() > 0.5 ? 1 : -1),
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

      // 1. Latido de Consenso Stellar cada 3.5 segundos
      if (now > nextConsensusTime) {
        setLedgerCount((prev) => prev + 1);
        consensusPulsesRef.current.push({
          x: cx,
          y: cy,
          radius: 10,
          maxRadius: Math.max(width, height) * 0.7,
          alpha: 0.95,
          speed: 6.2,
        });

        // Al latir, disparar paquetes de transacciones desde el núcleo a todos los hubs
        hubs.forEach((hub) => {
          packetsRef.current.push({
            fromX: cx,
            fromY: cy,
            toX: hub.x,
            toY: hub.y,
            progress: 0,
            speed: Math.random() * 0.02 + 0.025,
            color: '#5EEAD4',
            label: 'USDC',
          });

          // Handshake ripple en cada nodo al recibir consenso
          ripplesRef.current.push({
            x: hub.x,
            y: hub.y,
            radius: 3,
            maxRadius: 28,
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
        wave.alpha = Math.max(0, 0.9 * (1 - wave.radius / wave.maxRadius));

        // Anillo de pulso exterior
        ctx.strokeStyle = `rgba(94, 234, 212, ${wave.alpha * 0.75})`;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Anillo interior sutil
        ctx.strokeStyle = `rgba(45, 212, 191, ${wave.alpha * 0.35})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, Math.max(0, wave.radius - 8), 0, Math.PI * 2);
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
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        ctx.stroke();

        if (ripple.radius >= ripple.maxRadius) {
          ripplesRef.current.splice(r, 1);
        }
      }

      // 4. Actualizar posiciones orbitales sutiles de los Hubs
      hubs.forEach((hub, idx) => {
        hub.baseAngle += hub.orbitSpeed;
        const r = minDimension * hub.orbitRadiusFrac;
        const targetX = cx + Math.cos(hub.baseAngle) * r;
        const targetY = cy + Math.sin(hub.baseAngle) * r * 0.85;

        // Fricción suave
        hub.x += (targetX - hub.x) * 0.05;
        hub.y += (targetY - hub.y) * 0.05;

        hub.pulsePhase += 0.03;
      });

      // 5. Canales Criptográficos Activos entre Hubs (Fibra energética viva)
      const activeChannels: [number, number, number][] = [];
      const connectDist = minDimension * 0.48;

      for (let i = 0; i < hubs.length; i++) {
        const h1 = hubs[i];
        // Conectar cada hub con el Núcleo Central
        const cdx = cx - h1.x;
        const cdy = cy - h1.y;
        const cdist = Math.sqrt(cdx * cdx + cdy * cdy);

        // Línea hacia el núcleo central
        const coreAlpha = Math.sin(time * 2 + i) * 0.15 + 0.32;
        ctx.strokeStyle = `rgba(45, 212, 191, ${coreAlpha})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(h1.x, h1.y);
        ctx.stroke();

        // Conectar hubs vecinos entre sí
        for (let j = i + 1; j < hubs.length; j++) {
          const h2 = hubs[j];
          const dx = h2.x - h1.x;
          const dy = h2.y - h1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectDist) {
            const lineAlpha = (1 - dist / connectDist) * 0.35;
            const energyGlow = Math.sin(time * 3 + i * 2 + j) * 0.15 + 0.2;

            // Dibujar canal vivo
            ctx.strokeStyle = `rgba(94, 234, 212, ${lineAlpha + energyGlow})`;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(h1.x, h1.y);
            ctx.lineTo(h2.x, h2.y);
            ctx.stroke();

            activeChannels.push([i, j, dist]);
          }
        }
      }

      // 6. Generación espontánea de paquetes de micropagos en los canales
      if (Math.random() < 0.04 && activeChannels.length > 0) {
        const randChan = activeChannels[Math.floor(Math.random() * activeChannels.length)];
        const hA = hubs[randChan[0]];
        const hB = hubs[randChan[1]];
        packetsRef.current.push({
          fromX: hA.x,
          fromY: hA.y,
          toX: hB.x,
          toY: hB.y,
          progress: 0,
          speed: Math.random() * 0.018 + 0.015,
          color: Math.random() > 0.5 ? '#5EEAD4' : '#2DD4BF',
          label: 'USDC',
        });
      }

      // Render y desplazamiento de paquetes de pago
      for (let p = packetsRef.current.length - 1; p >= 0; p--) {
        const pkt = packetsRef.current[p];
        pkt.progress += pkt.speed;

        const currX = pkt.fromX + (pkt.toX - pkt.fromX) * pkt.progress;
        const currY = pkt.fromY + (pkt.toY - pkt.fromY) * pkt.progress;

        // Estela del paquete
        const tailX = pkt.fromX + (pkt.toX - pkt.fromX) * Math.max(0, pkt.progress - 0.08);
        const tailY = pkt.fromY + (pkt.toY - pkt.fromY) * Math.max(0, pkt.progress - 0.08);

        const pktGrad = ctx.createLinearGradient(tailX, tailY, currX, currY);
        pktGrad.addColorStop(0, 'rgba(45, 212, 191, 0)');
        pktGrad.addColorStop(1, pkt.color);

        ctx.strokeStyle = pktGrad;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(currX, currY);
        ctx.stroke();

        // Cabeza luminosa
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = pkt.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(currX, currY, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // reset

        // Al llegar a destino, emitir mini-ripple
        if (pkt.progress >= 1) {
          ripplesRef.current.push({
            x: pkt.toX,
            y: pkt.toY,
            radius: 3,
            maxRadius: 18,
            alpha: 0.8,
            color: pkt.color,
          });
          packetsRef.current.splice(p, 1);
        }
      }

      // 7. Tejedor de Canales: Conexión interactiva con el cursor/touch
      if (pointer.active && pointer.x > 0 && pointer.y > 0) {
        hubs.forEach((hub) => {
          const pdx = pointer.x - hub.x;
          const pdy = pointer.y - hub.y;
          const pdist = Math.sqrt(pdx * pdx + pdy * pdy);

          if (pdist < 160) {
            const beamAlpha = (1 - pdist / 160) * 0.75;
            ctx.strokeStyle = `rgba(94, 234, 212, ${beamAlpha})`;
            ctx.lineWidth = 1.6;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(pointer.x, pointer.y);
            ctx.lineTo(hub.x, hub.y);
            ctx.stroke();
            ctx.setLineDash([]); // reset

            // Micro-partícula fluyendo al nodo
            const flowProgress = (time * 2) % 1;
            const fx = pointer.x + (hub.x - pointer.x) * flowProgress;
            const fy = pointer.y + (hub.y - pointer.y) * flowProgress;
            ctx.fillStyle = '#5EEAD4';
            ctx.beginPath();
            ctx.arc(fx, fy, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      }

      // 8. Render de Nodos Miembros Orbitantes
      members.forEach((mem) => {
        const parent = hubs[mem.parentHubIndex];
        mem.orbitAngle += mem.orbitSpeed;
        mem.x = parent.x + Math.cos(mem.orbitAngle) * mem.orbitDist;
        mem.y = parent.y + Math.sin(mem.orbitAngle) * (mem.orbitDist * 0.8);

        // Línea sutil hacia el hub padre
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

      // 9. Render de Hubs Principales de Kosmovia
      hubs.forEach((hub) => {
        const pulse = Math.sin(hub.pulsePhase) * 2;
        const currentR = hub.radius + pulse;

        // Halo exterior
        ctx.fillStyle = `rgba(45, 212, 191, 0.15)`;
        ctx.beginPath();
        ctx.arc(hub.x, hub.y, currentR + 10, 0, Math.PI * 2);
        ctx.fill();

        // Anillo de órbita local
        ctx.strokeStyle = `rgba(94, 234, 212, 0.4)`;
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
        ctx.shadowBlur = 0; // reset

        // Etiqueta tipográfica nítida bajo el hub
        ctx.fillStyle = '#F2FBFA';
        ctx.font = '600 11px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(hub.name, hub.x, hub.y + currentR + 14);

        ctx.fillStyle = '#8FB3B0';
        ctx.font = '500 9.5px system-ui, sans-serif';
        ctx.fillText(hub.badge, hub.x, hub.y + currentR + 25);
      });

      // 10. Núcleo Central: El Nexus Kosmovia
      const corePulse = Math.sin(time * 3) * 2.5;
      const coreR = 24 + corePulse;

      // Halo galáctico del núcleo
      const nexusHalo = ctx.createRadialGradient(cx, cy, 6, cx, cy, 55);
      nexusHalo.addColorStop(0, 'rgba(94, 234, 212, 0.45)');
      nexusHalo.addColorStop(0.5, 'rgba(45, 212, 191, 0.2)');
      nexusHalo.addColorStop(1, 'rgba(6, 19, 20, 0)');
      ctx.fillStyle = nexusHalo;
      ctx.beginPath();
      ctx.arc(cx, cy, 55, 0, Math.PI * 2);
      ctx.fill();

      // Anillo concéntrico giratorio del nexus
      ctx.strokeStyle = 'rgba(94, 234, 212, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.arc(cx, cy, coreR + 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]); // reset

      // Esfera del Nexus
      const coreGrad = ctx.createRadialGradient(cx - 5, cy - 5, 2, cx, cy, coreR);
      coreGrad.addColorStop(0, '#FFFFFF');
      coreGrad.addColorStop(0.35, '#2DD4BF');
      coreGrad.addColorStop(0.8, '#0B1F21');
      coreGrad.addColorStop(1, '#061314');

      ctx.fillStyle = coreGrad;
      ctx.shadowColor = '#5EEAD4';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0; // reset

      // Isotipo K neón central
      ctx.strokeStyle = '#F2FBFA';
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      // K estilizada
      ctx.moveTo(cx - 6, cy - 9);
      ctx.lineTo(cx - 6, cy + 9);
      ctx.moveTo(cx - 6, cy);
      ctx.lineTo(cx + 6, cy - 9);
      ctx.moveTo(cx - 2, cy - 2);
      ctx.lineTo(cx + 6, cy + 9);
      ctx.stroke();

      // Título del Nexus
      ctx.fillStyle = '#5EEAD4';
      ctx.font = '800 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('KOSMOVIA NEXUS', cx, cy + coreR + 15);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, []);

  // Manejo de eventos del puntero para interacción táctil y hover
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

    // Detectar hover en algún Hub
    let foundHub: CommunityHub | null = null;
    PRIMARY_HUBS_DEF.forEach((def, idx) => {
      // Check distance with estimated center
      const canvas = canvasRef.current;
      if (!canvas) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const minDim = Math.min(w, h);
      const hx = w * 0.5 + Math.cos(def.baseAngle) * minDim * def.orbitRadiusFrac;
      const hy = h * 0.5 + Math.sin(def.baseAngle) * minDim * def.orbitRadiusFrac * 0.85;

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

    setHoveredHub(foundHub);
  };

  const handlePointerLeave = () => {
    pointerRef.current.active = false;
    setHoveredHub(null);
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
      aria-label="Simulación en vivo de redes y comunidades conectadas en Kosmovia"
    >
      {/* 1. Fondo galáctico con sutil drift */}
      <div className="sim-backdrop-galaxy">
        <div className="sim-nebula-pulse-1" />
        <div className="sim-nebula-pulse-2" />
        <div className="sim-vignette-radial" />
      </div>

      {/* 2. Canvas 2D de alta fidelidad para la red */}
      <canvas ref={canvasRef} className="sim-canvas-layer" />

      {/* 3. Tooltip interactivo holográfico al pasar el cursor */}
      {hoveredHub && (
        <div
          className="sim-node-tooltip"
          style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
        >
          <div className="tooltip-header">
            <span className="tooltip-dot" style={{ backgroundColor: hoveredHub.color }} />
            <span className="tooltip-title">{hoveredHub.name}</span>
          </div>
          <div className="tooltip-desc">{hoveredHub.role}</div>
          <div className="tooltip-status">Canal Criptográfico Activo · 0 Gas Pollar</div>
        </div>
      )}

      {/* 4. Telemetría de Red Viva (Sin emojis, diseño fintech de alto nivel) */}
      <div className="sim-hud-overlay">
        <div className="sim-hud-row top">
          <div className="sim-hud-badge live">
            <span className="hud-live-dot" />
            <span>Red Stellar Horizon · 6 Nodos Conectados</span>
          </div>
          <div className="sim-hud-badge metrics">
            <span>Ledger #{ledgerCount} · Latido: 3.5s</span>
          </div>
        </div>

        <div className="sim-hud-row bottom">
          <div className="sim-hud-badge feature">
            <span>Canales de Pago B2B · Liquidación Instantánea USDC</span>
          </div>
          <div className="sim-hud-hint">
            <span>Toca o arrastra para forjar conexiones</span>
          </div>
        </div>
      </div>
    </div>
  );
}
