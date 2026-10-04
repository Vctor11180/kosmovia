'use client';

import { CoreGate } from '../../components/CoreProviders';
import { PlataformaPage } from './PlataformaClient';

/** En modo api espera el login con Pollar y la sesión con core; en modo demo entra directo. */
export default function Page() {
  return (
    <CoreGate>
      <PlataformaPage />
    </CoreGate>
  );
}
