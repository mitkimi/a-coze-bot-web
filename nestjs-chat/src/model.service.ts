import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

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

@Injectable()
export class ModelService {
  private readonly SESSION_KEY = 'chat:session:';
  private redis: Redis;

  constructor(private configService: ConfigService) {}

  private initRedis() {
    if (!this.redis) {
      this.redis = new Redis({
        host: this.configService.get<string>('REDIS_HOST', 'localhost'),
        port: this.configService.get<number>('REDIS_PORT', 6379),
        password: this.configService.get<string>('REDIS_PASSWORD') || undefined,
        db: 0,
      });
    }
    return this.redis;
  }

  getAvailableModels(): ModelConfig[] {
    return [
      {
        id: 'coze',
        name: 'Coze AI',
        provider: 'coze',
        model: this.configService.get<string>('COZE_BOT_ID', 'coze-bot'),
        enabled: true,
      },
      {
        id: 'qwen',
        name: '通义千问',
        provider: 'qwen',
        apiKey: this.configService.get<string>('QWEN_API_KEY'),
        model: this.configService.get<string>('QWEN_MODEL', 'qwen-turbo'),
        enabled: !!this.configService.get<string>('QWEN_API_KEY'),
      },
      {
        id: 'deepseek',
        name: 'DeepSeek',
        provider: 'deepseek',
        apiKey: this.configService.get<string>('DEEPSEEK_API_KEY'),
        baseUrl: 'https://api.deepseek.com',
        model: this.configService.get<string>('DEEPSEEK_MODEL', 'deepseek-chat'),
        enabled: !!this.configService.get<string>('DEEPSEEK_API_KEY'),
      },
      {
        id: 'doubao',
        name: '豆包',
        provider: 'doubao',
        apiKey: this.configService.get<string>('DOUBAO_API_KEY'),
        baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
        model: this.configService.get<string>('DOUBAO_MODEL', 'doubao-pro-32k'),
        enabled: !!this.configService.get<string>('DOUBAO_API_KEY'),
      },
      {
        id: 'gpt',
        name: 'GPT-4',
        provider: 'openai',
        apiKey: this.configService.get<string>('OPENAI_API_KEY'),
        baseUrl: this.configService.get<string>('OPENAI_BASE_URL', 'https://api.openai.com/v1'),
        model: this.configService.get<string>('OPENAI_MODEL', 'gpt-4o'),
        enabled: !!this.configService.get<string>('OPENAI_API_KEY'),
      },
    ].filter(model => model.enabled);
  }

  async createSession(modelId?: string): Promise<SessionModel> {
    const redis = this.initRedis();
    const sessionId = this.generateId();
    const model = modelId || this.getAvailableModels()[0]?.id || 'coze';
    
    const session: SessionModel = {
      sessionId,
      modelId: model,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await redis.setex(
      `${this.SESSION_KEY}${sessionId}`,
      86400,
      JSON.stringify(session),
    );

    return session;
  }

  async getSession(sessionId: string): Promise<SessionModel | null> {
    const redis = this.initRedis();
    const data = await redis.get(`${this.SESSION_KEY}${sessionId}`);
    return data ? JSON.parse(data) : null;
  }

  async switchModel(sessionId: string, modelId: string): Promise<SessionModel | null> {
    const redis = this.initRedis();
    const session = await this.getSession(sessionId);
    if (!session) return null;

    const availableModels = this.getAvailableModels();
    const targetModel = availableModels.find(m => m.id === modelId);
    if (!targetModel) return null;

    session.modelId = modelId;
    session.updatedAt = new Date();

    await redis.setex(
      `${this.SESSION_KEY}${sessionId}`,
      86400,
      JSON.stringify(session),
    );

    return session;
  }

  async addMessage(sessionId: string, role: 'user' | 'assistant', content: string): Promise<void> {
    const redis = this.initRedis();
    const session = await this.getSession(sessionId);
    if (!session) return;

    session.messages.push({
      role,
      content,
      timestamp: new Date(),
    });
    session.updatedAt = new Date();

    await redis.setex(
      `${this.SESSION_KEY}${sessionId}`,
      86400,
      JSON.stringify(session),
    );
  }

  async getMessages(sessionId: string): Promise<Message[]> {
    const session = await this.getSession(sessionId);
    return session?.messages || [];
  }

  async deleteSession(sessionId: string): Promise<void> {
    const redis = this.initRedis();
    await redis.del(`${this.SESSION_KEY}${sessionId}`);
  }

  getModelById(modelId: string): ModelConfig | undefined {
    return this.getAvailableModels().find(m => m.id === modelId);
  }

  private generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
