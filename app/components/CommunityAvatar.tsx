import React from 'react';

/**
 * Foto de una comunidad (o su inicial/emoji si no tiene), dentro del "portal"
 * de Kosmovia: el brillo turquesa y el anillo de la landing, que se encienden
 * al pasar el mouse (ver .kv-portal en globals.css).
 */
export function CommunityAvatar({ name, icon, image, size = 48 }: { name: string; icon?: string; image?: string; size?: number }) {
  const letter = icon && icon.trim() ? icon : name.trim().charAt(0).toUpperCase() || '·';
  return (
    <span className="kv-portal" style={{ width: size, height: size }} aria-hidden="true">
      <span className="kv-portal-ring" />
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="kv-portal-img" src={image} alt="" width={size} height={size} />
      ) : (
        <span className="kv-portal-letter">{letter}</span>
      )}
    </span>
  );
}
