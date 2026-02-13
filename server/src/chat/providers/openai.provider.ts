import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { BaseProvider } from './base.provider';

@Injectable()
export class OpenaiProvider extends BaseProvider {
  private readonly API_URL = 'https://api.openai.com/v1/chat/completions';

  constructor(configService: ConfigService) {
    super(configService);
  }

  async chat(messages: { role: string; content: string }[]): Promise<string> {
    try {
      const apiKey = this.configService.get<string>('OPENAI_API_KEY');
      const baseUrl = this.configService.get<string>('OPENAI_BASE_URL', this.API_URL);
      const model = this.configService.get<string>('OPENAI_MODEL', 'gpt-4o');

      const response = await axios.post(
        `${baseUrl}/chat/completions`,
        {
          model,
          messages: this.buildMessages(messages),
          max_tokens: 4096,
          temperature: 0.7,
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
      this.logger.error('OpenAI API Error:', error.response?.data || error.message);
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
