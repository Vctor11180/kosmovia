'use client';

import React, { useEffect, useRef, useState } from 'react';

interface CommunityMenuProps {
  name: string;
  slug: string;
  /** Dueño o admin: ve "Configuración"; si no, "Opciones". */
  isOwner: boolean;
  onOpenSettings: () => void;
  onNotice: (text: string) => void;
}

/**
 * El nombre de la comunidad en la barra de canales abre este menú:
 * Compartir (link de invitación), Configuración (dueño) u Opciones (miembro).
 */
export function CommunityMenu({ name, slug, isOwner, onOpenSettings, onNotice }: CommunityMenuProps) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const share = async () => {
    setOpen(false);
    const link = `${window.location.origin}/plataforma?c=${encodeURIComponent(slug)}`;
    try {
      await navigator.clipboard.writeText(link);
      onNotice(`Link de invitación copiado: quien lo abra entra a ${name}.`);
    } catch {
      onNotice(`Copia este link para invitar: ${link}`);
    }
  };

  return (
    <div ref={boxRef} className="kv-community-menu">
      <button
        type="button"
        className="kv-community-menu-trigger"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Menú de ${name}`}
      >
        <h2 className="community-title">{name}</h2>
        <span aria-hidden="true" className="kv-chevron">
          ▾
        </span>
      </button>
      {open ? (
        <div className="kv-menu" role="menu" aria-label={`Menú de ${name}`}>
          <button type="button" role="menuitem" className="kv-menu-item" onClick={() => void share()}>
            🔗 Compartir comunidad
          </button>
          {isOwner ? (
            <button
              type="button"
              role="menuitem"
              className="kv-menu-item"
              onClick={() => {
                setOpen(false);
                onOpenSettings();
              }}
            >
              ⚙️ Configuración
            </button>
          ) : (
            <>
              <button type="button" role="menuitem" className="kv-menu-item" disabled title="Próximamente">
                🔕 Silenciar · próximamente
              </button>
              <button type="button" role="menuitem" className="kv-menu-item" disabled title="Próximamente">
                🚪 Salir de la comunidad · próximamente
              </button>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
