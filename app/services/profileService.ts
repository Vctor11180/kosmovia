import { User } from '../types';
import { INITIAL_COMMUNITIES, INITIAL_USER } from './mockData';

export interface IProfileService {
  /** Perfil público por @usuario o por dirección G…; null si no existe. */
  getPublicProfile(handleOrWallet: string): Promise<User | null>;
}

/** Modo demo: busca en los datos de ejemplo. */
export class MockProfileService implements IProfileService {
  async getPublicProfile(handleOrWallet: string): Promise<User | null> {
    const key = handleOrWallet.trim().toLowerCase().replace(/^@/, '');
    const everyone = [INITIAL_USER, ...INITIAL_COMMUNITIES.flatMap((c) => c.members)];
    return everyone.find((u) => u.username.toLowerCase().replace(/^@/, '') === key) ?? null;
  }
}
