import { io, Socket } from 'socket.io-client'

class SocketService {
  private socket: Socket | null = null
  private serverUrl: string = ''

  connect(serverUrl: string): Socket {
    this.serverUrl = serverUrl
    this.socket = io(`${serverUrl}/chat`, {
      transports: ['websocket'],
    })

    this.socket.on('connect', () => {
      console.log('WebSocket connected')
    })

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected')
    })

    return this.socket
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.on(event, callback)
    }
  }

  emit(event: string, data: any) {
    if (this.socket) {
      this.socket.emit(event, data)
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  getSocket(): Socket | null {
    return this.socket
  }
}

export const socketService = new SocketService()
