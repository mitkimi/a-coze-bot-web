import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { BaseProvider } from './base.provider';

@Injectable()
export class DeepseekProvider extends BaseProvider {
  private readonly API_URL = 'https://api.deepseek.com/chat/completions';

  constructor(configService: ConfigService) {
    super(configService);
  }

  async chat(messages: { role: string; content: string }[]): Promise<string> {
    try {
      const apiKey = this.configService.get<string>('DEEPSEEK_API_KEY');
      const model = this.configService.get<string>('DEEPSEEK_MODEL', 'deepseek-chat');

      const response = await axios.post(
        this.API_URL,
        {
          model,
          messages: this.buildMessages(messages),
          max_tokens: 4096,
          temperature: 0.7,
          stream: false,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
        },
      );

      return response.data.choices?.[0]?.message?.content || '';
    } catch (error) {
      this.logger.error('Deepseek API Error:', error.response?.data || error.message);
      throw error;
    }
  }

  protected buildMessages(messages: { role: string; content: string }[]) {
    return messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
    }));
  }
}
