import type { Metadata, Viewport } from 'next';
import './globals.css';
import { CoreProviders } from '../components/CoreProviders';

export const metadata: Metadata = {
  title: 'Kosmovia · Comunidades y Pagos Stellar',
  description: 'Plataforma de comunidades con wallet y pagos USDC integrados en Stellar para creadores, comunidades y empresas.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Kosmovia',
  },
  icons: {
    icon: '/icon.png',
    apple: '/icon-192.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#061314',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <CoreProviders>{children}</CoreProviders>
      </body>
    </html>
  );
}
