'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  CATEGORIAS,
  RASGOS,
  RAREZA,
  aleatorio,
  atributos,
  azarFijo,
  codificar,
  combinaciones,
  decodificar,
  esCodigoValido,
  hash32,
  siguiente,
  svg,
  type Categoria,
  type Seleccion,
} from '../lib/core/avatar/kosmonautas.ts';
import './kosmonauta.css';

export interface KosmonautaPickerProps {
  /** Dirección de la wallet: de aquí salen el avatar inicial y las 6 sugerencias (estables). */
  address: string;
  /** Código de un Kosmonauta para empezar desde él. */
  initial?: string;
  /** Recibe el código a guardar. */
  onChange?: (code: string) => void;
}

const COUNT = 6;

function Kosmonauta({ sel, label }: { sel: Seleccion; label: string }) {
  const src = useMemo(() => `data:image/svg+xml;utf8,${encodeURIComponent(svg(sel))}`, [sel]);
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={label} />;
}

function sugerenciasDe(rnd: () => number): Seleccion[] {
  return Array.from({ length: COUNT }, () => aleatorio(undefined, {}, rnd));
}

export function KosmonautaPicker({ address, initial, onChange }: KosmonautaPickerProps) {
  const inicial = useMemo(() => sugerenciasDe(azarFijo(hash32(address))), [address]);
  const [sugerencias, setSugerencias] = useState<Seleccion[]>(inicial);
  const [sel, setSel] = useState<Seleccion>(() => (esCodigoValido(initial) ? decodificar(initial) : inicial[0]));
  const [candados, setCandados] = useState<Partial<Record<Categoria, boolean>>>({});
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const code = codificar(sel);
  useEffect(() => {
    onChangeRef.current?.(code);
  }, [code]);

  return (
    <fieldset className="gen">
      <legend>Arma tu Kosmonauta</legend>

      <section className="gen-preview" aria-label="Tu Kosmonauta">
        <div className="gen-canvas">
          <Kosmonauta sel={sel} label="Vista previa de tu Kosmonauta" />
        </div>
        <ul className="gen-traits" aria-label="Rasgos">
          {atributos(sel).map((a) => (
            <li key={a.trait_type}>
              <span className="muted">{a.trait_type}</span>
              <strong>{a.value}</strong>
            </li>
          ))}
        </ul>
      </section>

      <section className="gen-controls" aria-label="Rasgos del Kosmonauta">
        {CATEGORIAS.map(({ key, label }) => {
          const lista = RASGOS[key];
          const i = lista.findIndex((r) => r.id === sel[key]);
          const bloqueado = !!candados[key];
          const nombre = lista[i]?.nombre ?? '';
          return (
            <div className="gen-row" key={key}>
              <span className="gen-row-label">{label}</span>
              <button
                type="button"
                className="gen-btn gen-arrow"
                aria-label={`Rasgo anterior: ${label}`}
                onClick={() => setSel((s) => siguiente(s, key, -1))}
              >
                ‹
              </button>
              <span className="gen-row-value" aria-live="polite">
                {nombre}
                <small className="muted">
                  {' '}
                  {i + 1}/{lista.length}
                </small>
              </span>
              <button
                type="button"
                className="gen-btn gen-arrow"
                aria-label={`Rasgo siguiente: ${label}`}
                onClick={() => setSel((s) => siguiente(s, key, 1))}
              >
                ›
              </button>
              <button
                type="button"
                className="gen-btn gen-lock"
                aria-pressed={bloqueado}
                aria-label={`${bloqueado ? 'Desbloquear' : 'Bloquear'} ${label.toLowerCase()}`}
                onClick={() => setCandados((c) => ({ ...c, [key]: !c[key] }))}
              >
                {bloqueado ? '🔒' : '🔓'}
              </button>
            </div>
          );
        })}

        <div className="gen-actions">
          <button type="button" className="gen-btn gen-btn-primary" onClick={() => setSel((s) => aleatorio(s, candados))}>
            Aleatorio
          </button>
        </div>
        <p className="muted gen-hint">
          Con el candado dejas fijo un rasgo y Aleatorio cambia solo el resto. Rareza: {RAREZA}.{' '}
          {combinaciones().toLocaleString('es')} combinaciones; cada una es de una sola persona.
        </p>
      </section>

      <section className="gen-suggest" aria-label="Sugerencias">
        <div className="gen-suggest-head">
          <h3>Sugerencias</h3>
          <button type="button" className="gen-btn gen-btn-ghost" onClick={() => setSugerencias(sugerenciasDe(Math.random))}>
            Otras
          </button>
        </div>
        <div className="gen-suggest-grid">
          {sugerencias.map((s, i) => (
            <button
              key={i}
              type="button"
              className="gen-suggest-item"
              aria-pressed={codificar(s) === code}
              onClick={() => setSel(s)}
            >
              <Kosmonauta sel={s} label={`Usar sugerencia ${i + 1}`} />
            </button>
          ))}
        </div>
      </section>
    </fieldset>
  );
}
