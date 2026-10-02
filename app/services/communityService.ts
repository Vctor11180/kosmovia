import { Channel, Community } from '../types';
import { INITIAL_COMMUNITIES } from './mockData';
import { storage } from './storage';

export interface CreateCommunityInput {
  name: string;
  slug: string;
  icon: string;
  description: string;
}

export interface CreateChannelInput {
  name: string;
  topic?: string;
  type?: 'text' | 'announcement';
}

export interface ICommunityService {
  getCommunities(): Promise<Community[]>;
  getCommunityById(id: string): Promise<Community | null>;
  createCommunity(input: CreateCommunityInput): Promise<Community>;
  createChannel(communityId: string, input: CreateChannelInput): Promise<Channel>;
}

const STORAGE_KEY = 'kosmovia_communities';

export class MockCommunityService implements ICommunityService {
  async getCommunities(): Promise<Community[]> {
    // Simular latencia de red async
    await new Promise((r) => setTimeout(r, 60));
    return storage.get<Community[]>(STORAGE_KEY, INITIAL_COMMUNITIES);
  }

  async getCommunityById(id: string): Promise<Community | null> {
    const list = await this.getCommunities();
    return list.find((c) => c.id === id) || null;
  }

  async createCommunity(input: CreateCommunityInput): Promise<Community> {
    const list = await this.getCommunities();
    const newCommunity: Community = {
      id: `comm-${Date.now()}`,
      name: input.name,
      slug: input.slug,
      icon: input.icon || '🚀',
      description: input.description,
      channels: [
        {
          id: `chan-${Date.now()}`,
          communityId: `comm-${Date.now()}`,
          name: 'general',
          topic: `Bienvenido a ${input.name}`,
          type: 'text',
        },
      ],
      members: [],
    };

    const updated = [...list, newCommunity];
    storage.set(STORAGE_KEY, updated);
    return newCommunity;
  }

  async createChannel(communityId: string, input: CreateChannelInput): Promise<Channel> {
    const list = await this.getCommunities();
    const newChannel: Channel = {
      id: `chan-${Date.now()}`,
      communityId,
      name: input.name,
      topic: input.topic || 'Canal de discusión',
      type: input.type || 'text',
    };

    const updated = list.map((c) =>
      c.id === communityId ? { ...c, channels: [...c.channels, newChannel] } : c
    );

    storage.set(STORAGE_KEY, updated);
    return newChannel;
  }
}
