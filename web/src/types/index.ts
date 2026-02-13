export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  enabled: boolean;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  sessionId: string;
  modelId: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}
