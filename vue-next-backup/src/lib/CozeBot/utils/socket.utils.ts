export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  enabled: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  message: string;
  timestamp?: Date;
}

class SocketService {
  private socket: any = null;
  private serverUrl: string = '';

  connect(serverUrl: string) {
    this.serverUrl = serverUrl;
    const { io } = require('socket.io-client');
    this.socket = io(`${serverUrl}/chat`, {
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    return this.socket;
  }

  on(event: string, callback: Function) {
    if (this.socket) {
      this.socket.on(event, (...args: any[]) => {
        callback(...args);
      });
    }
  }

  send(event: string, data: any) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

export const useSocket = () => {
  const service = new SocketService();
  return {
    connect: service.connect.bind(service),
    on: service.on.bind(service),
    send: service.send.bind(service),
    disconnect: service.disconnect.bind(service),
  };
};
