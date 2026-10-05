import React from 'react';

/**
 * Lo de adentro del círculo de avatar: el Kosmonauta de core cuando el usuario
 * lo tiene (modo api), o la inicial como hasta ahora (modo demo).
 */
export function AvatarFace({ avatar, name }: { avatar?: string; name: string }) {
  if (!avatar) return <>{name.charAt(0)}</>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={avatar}
      alt=""
      width={64}
      height={64}
      style={{ width: '100%', height: '100%', borderRadius: 'inherit', imageRendering: 'pixelated', objectFit: 'cover', display: 'block' }}
    />
  );
}
