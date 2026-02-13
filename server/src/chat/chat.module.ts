import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ModelService } from '../model/model.service';
import {
  CozeProvider,
  QwenProvider,
  DeepseekProvider,
  DoubaoProvider,
  OpenaiProvider,
} from './providers';

@Module({
  providers: [
    ChatGateway,
    ModelService,
    CozeProvider,
    QwenProvider,
    DeepseekProvider,
    DoubaoProvider,
    OpenaiProvider,
  ],
  exports: [ChatGateway],
})
export class ChatModule {}
