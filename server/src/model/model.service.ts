import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';
import { ModelConfig, SessionModel, Message } from './interfaces';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ModelService {
  private readonly SESSION_KEY = 'chat:session:';

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  getAvailableModels(): ModelConfig[] {
    return [
      {
        id: 'coze',
        name: 'Coze AI',
        provider: 'coze' as const,
        model: this.configService.get<string>('COZE_BOT_ID', 'coze-bot'),
        enabled: true,
      },
      {
        id: 'qwen',
        name: '通义千问',
        provider: 'qwen' as const,
        apiKey: this.configService.get<string>('QWEN_API_KEY'),
        model: this.configService.get<string>('QWEN_MODEL', 'qwen-turbo'),
        enabled: !!this.configService.get<string>('QWEN_API_KEY'),
      },
      {
        id: 'deepseek',
        name: 'DeepSeek',
        provider: 'deepseek' as const,
        apiKey: this.configService.get<string>('DEEPSEEK_API_KEY'),
        baseUrl: 'https://api.deepseek.com',
        model: this.configService.get<string>('DEEPSEEK_MODEL', 'deepseek-chat'),
        enabled: !!this.configService.get<string>('DEEPSEEK_API_KEY'),
      },
      {
        id: 'doubao',
        name: '豆包',
        provider: 'doubao' as const,
        apiKey: this.configService.get<string>('DOUBAO_API_KEY'),
        baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
        model: this.configService.get<string>('DOUBAO_MODEL', 'doubao-pro-32k'),
        enabled: !!this.configService.get<string>('DOUBAO_API_KEY'),
      },
      {
        id: 'gpt',
        name: 'GPT-4',
        provider: 'openai' as const,
        apiKey: this.configService.get<string>('OPENAI_API_KEY'),
        baseUrl: this.configService.get<string>('OPENAI_BASE_URL', 'https://api.openai.com/v1'),
        model: this.configService.get<string>('OPENAI_MODEL', 'gpt-4o'),
        enabled: !!this.configService.get<string>('OPENAI_API_KEY'),
      },
    ].filter(model => model.enabled);
  }

  async createSession(modelId?: string): Promise<SessionModel> {
    const sessionId = uuidv4();
    const model = modelId || this.getAvailableModels()[0]?.id || 'coze';
    
    const session: SessionModel = {
      sessionId,
      modelId: model,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.redisService.set(
      `${this.SESSION_KEY}${sessionId}`,
      JSON.stringify(session),
      86400,
    );

    return session;
  }

  async getSession(sessionId: string): Promise<SessionModel | null> {
    const data = await this.redisService.get(`${this.SESSION_KEY}${sessionId}`);
    return data ? JSON.parse(data) : null;
  }

  async switchModel(sessionId: string, modelId: string): Promise<SessionModel | null> {
    const session = await this.getSession(sessionId);
    if (!session) {
      return null;
    }

    const availableModels = this.getAvailableModels();
    const targetModel = availableModels.find(m => m.id === modelId);
    
    if (!targetModel) {
      return null;
    }

    session.modelId = modelId;
    session.updatedAt = new Date();

    await this.redisService.set(
      `${this.SESSION_KEY}${sessionId}`,
      JSON.stringify(session),
      86400,
    );

    return session;
  }

  async addMessage(sessionId: string, role: 'user' | 'assistant', content: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) {
      return;
    }

    session.messages.push({
      role,
      content,
      timestamp: new Date(),
    });
    session.updatedAt = new Date();

    await this.redisService.set(
      `${this.SESSION_KEY}${sessionId}`,
      JSON.stringify(session),
      86400,
    );
  }

  async getMessages(sessionId: string): Promise<Message[]> {
    const session = await this.getSession(sessionId);
    return session?.messages || [];
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.redisService.del(`${this.SESSION_KEY}${sessionId}`);
  }

  getModelById(modelId: string): ModelConfig | undefined {
    return this.getAvailableModels().find(m => m.id === modelId);
  }
}
