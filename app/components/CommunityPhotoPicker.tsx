'use client';

import React, { useRef, useState } from 'react';
import { fileToSquareImage } from '../lib/image-resize';
import { CommunityAvatar } from './CommunityAvatar';

/** Elegir la foto de una comunidad: se recorta en cuadrado y se achica en el navegador. */
export function CommunityPhotoPicker({
  name,
  value,
  onChange,
}: {
  name: string;
  value: string | null;
  onChange: (dataUrl: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      onChange(await fileToSquareImage(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo usar esa imagen.');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <CommunityAvatar name={name || '?'} image={value ?? undefined} size={72} />
      <div style={{ display: 'grid', gap: 6 }}>
        <span className="form-label">Foto de la comunidad</span>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="btn-secondary" onClick={() => inputRef.current?.click()} disabled={busy}>
            {busy ? 'Procesando…' : value ? 'Cambiar foto' : 'Subir foto'}
          </button>
          {value ? (
            <button type="button" className="btn-secondary" onClick={() => onChange(null)} disabled={busy}>
              Quitar
            </button>
          ) : null}
        </div>
        <span className="form-hint">{error ?? 'PNG, JPG o WebP. Se recorta en cuadrado.'}</span>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          hidden
          onChange={(e) => void onFile(e.target.files?.[0])}
        />
      </div>
    </div>
  );
}
