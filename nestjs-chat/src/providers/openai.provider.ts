import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class OpenaiProvider {
  private readonly API_URL = 'https://api.openai.com/v1/chat/completions';

  constructor() {}

  async chat(messages: { role: string; content: string }[]): Promise<string> {
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      const baseUrl = process.env.OPENAI_BASE_URL || this.API_URL;
      const model = process.env.OPENAI_MODEL || 'gpt-4o';

      if (!apiKey) {
        throw new Error('OpenAI API key not configured');
      }

      const response = await axios.post(
        `${baseUrl}/chat/completions`,
        {
          model,
          messages: messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content,
          })),
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
      new Logger(OpenaiProvider.name).error('OpenAI API Error:', error.response?.data || error.message);
      throw error;
    }
  }
}
