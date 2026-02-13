import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ModelService } from '../model/model.service';
import {
  CozeProvider,
  QwenProvider,
  DeepseekProvider,
  DoubaoProvider,
  OpenaiProvider,
} from './providers';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private readonly clientSessions: Map<string, string> = new Map();

  constructor(
    private readonly modelService: ModelService,
    private readonly cozeProvider: CozeProvider,
    private readonly qwenProvider: QwenProvider,
    private readonly deepseekProvider: DeepseekProvider,
    private readonly doubaoProvider: DoubaoProvider,
    private readonly openaiProvider: OpenaiProvider,
  ) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.clientSessions.set(client.id, '');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.clientSessions.delete(client.id);
  }

  @SubscribeMessage('createSession')
  async handleCreateSession(
    @ConnectedSocket() client: Socket,
    @MessageBody('modelId') modelId?: string,
  ) {
    try {
      const session = await this.modelService.createSession(modelId);
      this.clientSessions.set(client.id, session.sessionId);
      
      client.emit('sessionCreated', {
        sessionId: session.sessionId,
        modelId: session.modelId,
      });

      return { success: true, data: session };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody('message') message: string,
  ) {
    try {
      const sessionId = this.clientSessions.get(client.id) || '';
      
      if (!sessionId) {
        return { success: false, message: 'No active session' };
      }

      const session = await this.modelService.getSession(sessionId);
      if (!session) {
        return { success: false, message: 'Session not found' };
      }

      await this.modelService.addMessage(sessionId, 'user', message);

      const messages = await this.modelService.getMessages(sessionId);
      const provider = this.getProvider(session.modelId);
      
      const response = await provider.chat(messages);
      
      await this.modelService.addMessage(sessionId, 'assistant', response);

      client.emit('messageReceived', {
        sessionId,
        message: response,
        modelId: session.modelId,
        timestamp: new Date().toISOString(),
      });

      return { success: true };
    } catch (error) {
      this.logger.error('Chat error:', error);
      return { success: false, message: error.message };
    }
  }

  @SubscribeMessage('switchModel')
  async handleSwitchModel(
    @ConnectedSocket() client: Socket,
    @MessageBody('modelId') modelId: string,
  ) {
    try {
      const sessionId = this.clientSessions.get(client.id);
      if (!sessionId) {
        return { success: false, message: 'No active session' };
      }

      const session = await this.modelService.switchModel(sessionId, modelId);
      if (!session) {
        return { success: false, message: 'Model not available' };
      }

      client.emit('modelSwitched', {
        sessionId,
        modelId: session.modelId,
      });

      return { success: true, data: session };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  @SubscribeMessage('getMessages')
  async handleGetMessages(@ConnectedSocket() client: Socket) {
    try {
      const sessionId = this.clientSessions.get(client.id);
      if (!sessionId) {
        return { success: false, message: 'No active session' };
      }

      const messages = await this.modelService.getMessages(sessionId);
      return { success: true, data: messages };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  @SubscribeMessage('clearSession')
  async handleClearSession(@ConnectedSocket() client: Socket) {
    try {
      const sessionId = this.clientSessions.get(client.id);
      if (sessionId) {
        await this.modelService.deleteSession(sessionId);
      }

      this.clientSessions.set(client.id, '');
      client.emit('sessionCleared');

      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  private getProvider(modelId: string) {
    switch (modelId) {
      case 'coze':
        return this.cozeProvider;
      case 'qwen':
        return this.qwenProvider;
      case 'deepseek':
        return this.deepseekProvider;
      case 'doubao':
        return this.doubaoProvider;
      case 'gpt':
        return this.openaiProvider;
      default:
        return this.cozeProvider;
    }
  }
}
