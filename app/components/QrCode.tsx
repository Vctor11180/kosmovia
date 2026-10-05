'use client';

import React, { useMemo } from 'react';
import qrcode from 'qrcode-generator';

/** Un QR dibujado con <rect> (sin innerHTML), claro sobre oscuro con el margen que necesitan los lectores. */
export function QrCode({ value, label, size = 176 }: { value: string; label: string; size?: number }) {
  const { n, cells } = useMemo(() => {
    const qr = qrcode(0, 'M');
    qr.addData(value);
    qr.make();
    const count = qr.getModuleCount();
    const dark: [number, number][] = [];
    for (let r = 0; r < count; r++) for (let c = 0; c < count; c++) if (qr.isDark(r, c)) dark.push([c, r]);
    return { n: count, cells: dark };
  }, [value]);
  const margin = 4;
  const total = n + margin * 2;
  return (
    <svg
      viewBox={`0 0 ${total} ${total}`}
      width={size}
      height={size}
      role="img"
      aria-label={label}
      shapeRendering="crispEdges"
      style={{ display: 'block', margin: '0 auto', borderRadius: 12 }}
    >
      <rect width={total} height={total} fill="#F2FBFA" />
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x + margin} y={y + margin} width={1} height={1} fill="#061314" />
      ))}
    </svg>
  );
}
