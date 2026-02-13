export interface ModelConfig {
  id: string;
  name: string;
  provider: 'qwen' | 'deepseek' | 'doubao' | 'openai' | 'coze';
  apiKey?: string;
  baseUrl?: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
  enabled: boolean;
}

export interface SessionModel {
  sessionId: string;
  modelId: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface ChatRequest {
  sessionId?: string;
  message: string;
  modelId?: string;
}

export interface ChatResponse {
  sessionId: string;
  message: string;
  modelId: string;
  timestamp: Date;
}
