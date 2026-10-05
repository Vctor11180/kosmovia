import { User } from '../types';
import { INITIAL_USER } from './mockData';
import { storage } from './storage';

export interface IAuthService {
  getCurrentUser(): Promise<User>;
  updateProfile(data: { displayName: string; bio: string }): Promise<User>;
  login(username: string): Promise<User>;
}

const STORAGE_KEY = 'kosmovia_current_user';

export class MockAuthService implements IAuthService {
  async getCurrentUser(): Promise<User> {
    await new Promise((r) => setTimeout(r, 30));
    return storage.get<User>(STORAGE_KEY, INITIAL_USER);
  }

  async updateProfile(data: { displayName: string; bio: string }): Promise<User> {
    const current = await this.getCurrentUser();
    const updated: User = {
      ...current,
      displayName: data.displayName,
      bio: data.bio,
    };
    storage.set(STORAGE_KEY, updated);
    return updated;
  }

  async login(username: string): Promise<User> {
    await new Promise((r) => setTimeout(r, 60)); // Simula verificación de Passkey
    const clean = username.startsWith('@') ? username : `@${username}`;
    const user: User = {
      id: `usr-${Date.now()}`,
      username: clean,
      displayName: clean.replace('@', '').replace(/^\w/, (c) => c.toUpperCase()),
      role: 'builder',
      isOnline: true,
      bio: 'Miembro de Kosmovia en Stellar Testnet.',
    };
    storage.set(STORAGE_KEY, user);
    return user;
  }
}
