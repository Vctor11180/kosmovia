import React, { useMemo } from 'react';
import { renderAvatar } from '../lib/core/avatar/generator';

interface AvatarFaceProps {
  avatar?: string;
  name: string;
  seed?: string;
}

/**
 * Lo de adentro del círculo de avatar:
 * Si tiene avatar guardado (código k1..., SVG o URL), lo muestra.
 * Si no tiene avatar aún, genera de forma determinista el Kosmonauta SVG
 * oficial en base a su nombre o username, para que cada usuario tenga su
 * astronauta único en lugar de una inicial plana.
 */
export function AvatarFace({ avatar, name, seed }: AvatarFaceProps) {
  const content = useMemo(() => {
    if (avatar) {
      if (avatar.startsWith('<svg')) {
        return { kind: 'svg' as const, data: avatar };
      }
      if (avatar.startsWith('k1.')) {
        try {
          return { kind: 'svg' as const, data: renderAvatar(avatar, 'kosmonauta') };
        } catch {}
      }
      return { kind: 'img' as const, data: avatar };
    }

    try {
      const svg = renderAvatar(seed || name || 'kosmonauta', 'kosmonauta');
      return { kind: 'svg' as const, data: svg };
    } catch {
      return { kind: 'fallback' as const, data: name ? name.charAt(0) : '?' };
    }
  }, [avatar, name, seed]);

  if (content.kind === 'img') {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={content.data}
        alt=""
        width={64}
        height={64}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 'inherit',
          imageRendering: 'pixelated',
          objectFit: 'cover',
          display: 'block',
        }}
      />
    );
  }

  if (content.kind === 'svg') {
    return (
      <div
        className="kv-avatar-svg-inner"
        dangerouslySetInnerHTML={{ __html: content.data }}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 'inherit',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      />
    );
  }

  return <>{content.data}</>;
}

