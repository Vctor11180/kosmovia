import type { NextConfig } from 'next';

/**
 * Una sola app: el frontend y el backend (rutas /api, en app/api) corren en el
 * mismo servidor, así la cookie de sesión y el login con Pollar usan el mismo origen.
 */
const nextConfig: NextConfig = {
  // El indicador de desarrollo de Next tapaba la barra izquierda.
  devIndicators: { position: 'bottom-right' },
  // Permitir acceso desde dispositivos en la red local (celulares en Wi-Fi o USB)
  allowedDevOrigins: [
    '192.168.0.13',
    '192.168.0.13:3000',
    'localhost:3000',
    '127.0.0.1:3000',
    '26.167.40.166',
    '26.167.40.166:3000',
  ],
  // pg es un módulo de Node: que Next no lo empaquete.
  serverExternalPackages: ['pg'],
};

export default nextConfig;
