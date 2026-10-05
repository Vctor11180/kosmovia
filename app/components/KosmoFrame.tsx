import React from 'react';

/**
 * Marco "portal" rectangular con esquinas redondeadas para el Kosmonauta del
 * perfil: el mismo borde turquesa con brillo de las comunidades, en grande.
 */
export function KosmoFrame({ size = 128, children, badge }: { size?: number; children: React.ReactNode; badge?: React.ReactNode }) {
  return (
    <div className="kv-frame" style={{ width: size, height: size }}>
      <div className="kv-frame-inner">{children}</div>
      {badge}
    </div>
  );
}
