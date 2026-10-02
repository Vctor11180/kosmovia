import { Message, User } from '../types';
import { INITIAL_MESSAGES } from './mockData';
import { storage } from './storage';

export interface IChatService {
  getMessages(channelId: string): Promise<Message[]>;
  sendMessage(channelId: string, content: string, author: User): Promise<Message>;
  subscribeToMessages(channelId: string, callback: (msg: Message) => void): () => void;
}

const STORAGE_KEY = 'kosmovia_messages_by_channel';

type Listener = (msg: Message) => void;

export class MockChatService implements IChatService {
  private listeners: Map<string, Set<Listener>> = new Map();

  async getMessages(channelId: string): Promise<Message[]> {
    await new Promise((r) => setTimeout(r, 40));
    const all = storage.get<Record<string, Message[]>>(STORAGE_KEY, INITIAL_MESSAGES);
    return all[channelId] || [];
  }

  async sendMessage(channelId: string, content: string, author: User): Promise<Message> {
    const all = storage.get<Record<string, Message[]>>(STORAGE_KEY, INITIAL_MESSAGES);
    const newMessage: Message = {
      id: `m-${Date.now()}`,
      channelId,
      author,
      content,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const currentList = all[channelId] || [];
    all[channelId] = [...currentList, newMessage];
    storage.set(STORAGE_KEY, all);

    // Notificar a suscriptores en tiempo real (simulando WebSockets / Supabase Realtime)
    this.broadcast(channelId, newMessage);

    return newMessage;
  }

  subscribeToMessages(channelId: string, callback: Listener): () => void {
    if (!this.listeners.has(channelId)) {
      this.listeners.set(channelId, new Set());
    }

    this.listeners.get(channelId)!.add(callback);

    // Devolver función para desuscribirse
    return () => {
      const set = this.listeners.get(channelId);
      if (set) {
        set.delete(callback);
      }
    };
  }

  private broadcast(channelId: string, message: Message) {
    const set = this.listeners.get(channelId);
    if (set) {
      set.forEach((cb) => {
        try {
          cb(message);
        } catch (err) {
          console.error('[chatService] Listener error:', err);
        }
      });
    }
  }
}
