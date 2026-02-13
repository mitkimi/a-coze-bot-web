import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class QwenProvider {
  private readonly DASHSCOPE_API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';

  constructor() {}

  async chat(messages: { role: string; content: string }[]): Promise<string> {
    try {
      const apiKey = process.env.QWEN_API_KEY;
      const model = process.env.QWEN_MODEL || 'qwen-turbo';

      if (!apiKey) {
        throw new Error('Qwen API key not configured');
      }

      const response = await axios.post(
        `${this.DASHSCOPE_API_URL}/${model}`,
        {
          input: {
            messages: messages.map(m => ({
              role: m.role === 'user' ? 'user' : 'assistant',
              content: m.content,
            })),
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
      new Logger(QwenProvider.name).error('Qwen API Error:', error.response?.data || error.message);
      throw error;
    }
  }
}
