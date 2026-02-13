import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { BaseProvider } from './base.provider';
import { v4 as uuidv4 } from 'uuid';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class CozeProvider extends BaseProvider {
  private readonly COZE_API_URL = 'https://api.coze.cn';
  private readonly COZE_AUTH_URL = 'https://api.coze.cn/oauth/token';

  constructor(configService: ConfigService) {
    super(configService);
  }

  private async getAccessToken(): Promise<string> {
    const iss = this.configService.get<string>('COZE_ISS');
    const kid = this.configService.get<string>('COZE_KID');
    const privateKey = this.configService.get<string>('COZE_PRIVATE_KEY');

    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss,
      sub: iss,
      aud: 'api.coze.cn',
      iat: now,
      exp: now + 86400,
      jti: uuidv4(),
    };

    const token = jwt.sign(payload, privateKey, {
      algorithm: 'RS256',
      header: { kid, alg: 'RS256' },
    });

    const response = await axios.post(
      this.COZE_AUTH_URL,
      {
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: token,
      },
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );

    return response.data.access_token;
  }

  async chat(messages: { role: string; content: string }[]): Promise<string> {
    try {
      const accessToken = await this.getAccessToken();
      const botId = this.configService.get<string>('COZE_BOT_ID');

      const response = await axios.post(
        `${this.COZE_API_URL}/v1/chat`,
        {
          bot_id: botId,
          user_id: 'user_' + uuidv4().slice(0, 8),
          messages: messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content,
          })),
          auto_save_history: true,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      return response.data.messages?.[0]?.content || '';
    } catch (error) {
      this.logger.error('Coze API Error:', error.response?.data || error.message);
      throw error;
    }
  }
}
