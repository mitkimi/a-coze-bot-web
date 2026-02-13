import { Module, Global } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ModelService } from './model.service';
import {
  CozeProvider,
  QwenProvider,
  DeepseekProvider,
  DoubaoProvider,
  OpenaiProvider,
} from './providers';

@Global()
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
  exports: [ChatGateway, ModelService],
})
export class ChatModule {}
