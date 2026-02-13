import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class DeepseekProvider {
  private readonly API_URL = 'https://api.deepseek.com/chat/completions';

  constructor() {}

  async chat(messages: { role: string; content: string }[]): Promise<string> {
    try {
      const apiKey = process.env.DEEPSEEK_API_KEY;
      const model = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

      if (!apiKey) {
        throw new Error('Deepseek API key not configured');
      }

      const response = await axios.post(
        this.API_URL,
        {
          model,
          messages: messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content,
          })),
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
      new Logger(DeepseekProvider.name).error('Deepseek API Error:', error.response?.data || error.message);
      throw error;
    }
  }
}
