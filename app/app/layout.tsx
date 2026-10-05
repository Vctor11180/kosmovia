import type { Metadata, Viewport } from 'next';
import './globals.css';
import { CoreProviders } from '../components/CoreProviders';

export const metadata: Metadata = {
  title: 'Kosmovia · Comunidades y Chat',
  description: 'Plataforma de comunidades descentralizada para Stellar. Explora, conecta y pertenece.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#07060f',
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
