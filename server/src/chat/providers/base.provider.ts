import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { ModelConfig } from '../interfaces';

@Injectable()
export class BaseProvider {
  protected client: AxiosInstance;
  protected modelConfig: ModelConfig;
  protected readonly logger = new Logger(BaseProvider.name);

  constructor(protected configService: ConfigService) {}

  async chat(messages: { role: string; content: string }[]): Promise<string> {
    throw new Error('Method not implemented');
  }

  protected buildMessages(messages: { role: string; content: string }[]) {
    return messages;
  }
}
