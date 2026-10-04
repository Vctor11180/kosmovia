import type { NextConfig } from 'next';

/**
 * Borrador de integración: en modo api, /api/* se reenvía al servidor de core
 * (KOSMOVIA_API_URL, por defecto http://localhost:3001). Para el navegador es
 * el mismo origen, así la cookie de sesión y el login con Pollar funcionan
 * desde esta app.
 */
const API_URL = process.env.KOSMOVIA_API_URL || 'http://localhost:3001';

const nextConfig: NextConfig = {
  async rewrites() {
    if (process.env.NEXT_PUBLIC_KOSMOVIA_SERVICES !== 'api') return [];
    return [{ source: '/api/:path*', destination: `${API_URL}/api/:path*` }];
  },
};

export default nextConfig;
