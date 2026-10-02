import { IAuthService, MockAuthService } from './authService';
import { IChatService, MockChatService } from './chatService';
import { ICommunityService, MockCommunityService } from './communityService';
import { ISettlementService, MockSettlementService } from './settlementService';
import { IWalletService, MockWalletService } from './walletService';

/**
 * Service Gateway (Hexagonal Architecture)
 * 
 * En el presente, los servicios utilizan adapters con persistencia en localStorage.
 * Cuando el backend (Supabase / Stellar RPC / Polar) esté listo, se sustituye
 * la instancia aquí sin necesidad de refactorizar ni un solo componente de la UI.
 */
export const authService: IAuthService = new MockAuthService();
export const communityService: ICommunityService = new MockCommunityService();
export const chatService: IChatService = new MockChatService();
export const walletService: IWalletService = new MockWalletService();
export const settlementService: ISettlementService = new MockSettlementService();

export * from './authService';
export * from './chatService';
export * from './communityService';
export * from './settlementService';
export * from './walletService';
export * from './storage';
export * from './mockData';
