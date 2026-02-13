import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { BaseProvider } from './base.provider';

@Injectable()
export class QwenProvider extends BaseProvider {
  private readonly DASHSCOPE_API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';

  constructor(configService: ConfigService) {
    super(configService);
  }

  async chat(messages: { role: string; content: string }[]): Promise<string> {
    try {
      const apiKey = this.configService.get<string>('QWEN_API_KEY');
      const model = this.configService.get<string>('QWEN_MODEL', 'qwen-turbo');

      const response = await axios.post(
        `${this.DASHSCOPE_API_URL}/${model}`,
        {
          input: {
            messages: this.buildMessages(messages),
          },
          parameters: {
            max_tokens: 2048,
            temperature: 0.7,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
        },
      );

      return response.data.output?.text || '';
    } catch (error) {
      this.logger.error('Qwen API Error:', error.response?.data || error.message);
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
