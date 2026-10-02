import { SettlementRecord } from '../types';
import { INITIAL_SETTLEMENTS } from './mockData';
import { storage } from './storage';

export interface RecordSettlementInput {
  amount: number;
  concept: string;
  client: string;
}

export interface ISettlementService {
  getSettlements(): Promise<SettlementRecord[]>;
  recordPayment(input: RecordSettlementInput): Promise<SettlementRecord>;
  disburseBatch(): Promise<void>;
}

const STORAGE_KEY = 'kosmovia_settlements';

export class MockSettlementService implements ISettlementService {
  async getSettlements(): Promise<SettlementRecord[]> {
    await new Promise((r) => setTimeout(r, 50));
    return storage.get<SettlementRecord[]>(STORAGE_KEY, INITIAL_SETTLEMENTS);
  }

  async recordPayment(input: RecordSettlementInput): Promise<SettlementRecord> {
    const list = await this.getSettlements();

    const fee = Math.round(input.amount * 0.005 * 100) / 100;
    const net = Math.round((input.amount - fee) * 100) / 100;

    const newRecord: SettlementRecord = {
      id: `stl-${Date.now()}`,
      orderId: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      concept: input.concept,
      client: input.client,
      totalUSDC: input.amount,
      feeUSDC: fee,
      netUSDC: net,
      status: 'COMPLETED',
      settlementTxHash: '6be268a284eee59916485c32eadc2d89d092c1b14c60443969cb504996147181',
      createdAt: 'Hoy, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updated = [newRecord, ...list];
    storage.set(STORAGE_KEY, updated);
    return newRecord;
  }

  async disburseBatch(): Promise<void> {
    await new Promise((r) => setTimeout(r, 150));
    const list = await this.getSettlements();
    const updated = list.map((s) => (s.status === 'PENDING' ? { ...s, status: 'COMPLETED' as const } : s));
    storage.set(STORAGE_KEY, updated);
  }
}
