import { Controller, Get, Post, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { ModelService } from './model.service';
import { ChatRequest } from './interfaces';

@Controller('model')
export class ModelController {
  constructor(private readonly modelService: ModelService) {}

  @Get('list')
  async getModelList() {
    const models = this.modelService.getAvailableModels();
    return {
      success: true,
      data: models.map(m => ({
        id: m.id,
        name: m.name,
        provider: m.provider,
        enabled: m.enabled,
      })),
    };
  }

  @Post('create-session')
  async createSession(@Body() body: ChatRequest) {
    try {
      const session = await this.modelService.createSession(body.modelId);
      return {
        success: true,
        data: session,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: 'Failed to create session' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':sessionId/switch')
  async switchModel(
    @Param('sessionId') sessionId: string,
    @Body('modelId') modelId: string,
  ) {
    const session = await this.modelService.switchModel(sessionId, modelId);
    
    if (!session) {
      throw new HttpException(
        { success: false, message: 'Session not found or model not available' },
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      success: true,
      data: session,
    };
  }

  @Get(':sessionId/messages')
  async getMessages(@Param('sessionId') sessionId: string) {
    const messages = await this.modelService.getMessages(sessionId);
    return {
      success: true,
      data: messages,
    };
  }

  @Post(':sessionId/delete')
  async deleteSession(@Param('sessionId') sessionId: string) {
    await this.modelService.deleteSession(sessionId);
    return {
      success: true,
      message: 'Session deleted',
    };
  }
}
