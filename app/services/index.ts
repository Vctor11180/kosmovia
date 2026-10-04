import { IAuthService, MockAuthService } from './authService';
import { IChatService, MockChatService } from './chatService';
import { ICommunityService, MockCommunityService } from './communityService';
import { ISettlementService, MockSettlementService } from './settlementService';
import { IWalletService, MockWalletService } from './walletService';
import { ApiAuthService, ApiChatService, ApiCommunityService, ApiWalletService } from './api';

/**
 * Service Gateway (Hexagonal Architecture)
 *
 * NEXT_PUBLIC_KOSMOVIA_SERVICES=api conecta la UI al backend de core (login
 * con Pollar, comunidades, chat y pagos reales en testnet). Sin esa variable,
 * todo sigue en modo demo con localStorage. Los cobros B2B (settlements)
 * siguen en demo en los dos modos: core todavía no los tiene.
 */
export const SERVICES_MODE: 'api' | 'mock' = process.env.NEXT_PUBLIC_KOSMOVIA_SERVICES === 'api' ? 'api' : 'mock';
const api = SERVICES_MODE === 'api';

export const authService: IAuthService = api ? new ApiAuthService() : new MockAuthService();
export const communityService: ICommunityService = api ? new ApiCommunityService() : new MockCommunityService();
export const chatService: IChatService = api ? new ApiChatService() : new MockChatService();
export const walletService: IWalletService = api ? new ApiWalletService() : new MockWalletService();
export const settlementService: ISettlementService = new MockSettlementService();

export * from './authService';
export * from './chatService';
export * from './communityService';
export * from './settlementService';
export * from './walletService';
export * from './storage';
export * from './mockData';
