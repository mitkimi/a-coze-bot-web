export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  enabled: boolean;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}
