export interface User {
  id: string;
  username: string; // e.g. "@victor"
  displayName: string;
  avatar?: string;
  role?: 'admin' | 'builder' | 'member';
  isOnline?: boolean;
}

export interface Channel {
  id: string;
  communityId: string;
  name: string; // e.g. "general"
  topic?: string;
  type: 'text' | 'announcement';
}

export interface Community {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  channels: Channel[];
}

export interface Message {
  id: string;
  channelId: string;
  author: User;
  content: string;
  createdAt: string;
}
