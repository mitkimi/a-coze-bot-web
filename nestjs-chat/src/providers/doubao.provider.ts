import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class DoubaoProvider {
  private readonly API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

  constructor() {}

  async chat(messages: { role: string; content: string }[]): Promise<string> {
    try {
      const apiKey = process.env.DOUBAO_API_KEY;
      const model = process.env.DOUBAO_MODEL || 'doubao-pro-32k';

      if (!apiKey) {
        throw new Error('Doubao API key not configured');
      }

      const response = await axios.post(
        this.API_URL,
        {
          model,
          messages: messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content,
          })),
          max_tokens: 8192,
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
      new Logger(DoubaoProvider.name).error('Doubao API Error:', error.response?.data || error.message);
      throw error;
    }
  }
}
