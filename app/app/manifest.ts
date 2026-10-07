import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Kosmovia · Comunidades & Pagos Stellar',
    short_name: 'Kosmovia',
    description: 'Plataforma de comunidades con wallet y pagos USDC integrados en Stellar.',
    start_url: '/plataforma',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#061314',
    theme_color: '#061314',
    categories: ['social', 'finance', 'productivity'],
    icons: [
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/brand/kosmovia-mark-dark.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
