import { ref, onUnmounted } from 'vue';
const config = {
  devBaseWebSocketUrl: 'ws://localhost:8800',
  testBaseWebSocketUrl: '/api',
  prodBaseWebSocketUrl: '/bot-api'
}


const env = import.meta.env
interface SocketOptions {
  heartbeatInterval?: number
  reconnectInterval?: number
  maxReconnectAttempts?: number
  appId?: string
}

class Socket {
  url: string = (env.MODE == "development" ? config.devBaseWebSocketUrl : env.MODE == "test" ? config.testBaseWebSocketUrl : config.prodBaseWebSocketUrl)
  ws: WebSocket | null = null
  opts: SocketOptions
  reconnectAttempts: number = 0
  listeners: { [key: string]: Function[] } = {}
  heartbeatInterval: number | null = null

  constructor(opts: SocketOptions = {}) {
    this.opts = {
      heartbeatInterval: 30000,
      reconnectInterval: 5000,
      maxReconnectAttempts: 5,
      ...opts
    };
    this.init()
  }

  init(appId: string) {
    this.ws = new WebSocket(this.url, [])

    this.ws.onopen = this.onOpen.bind(this)
    this.ws.onmessage = this.onMessage.bind(this)
    this.ws.onerror = this.onError.bind(this)
    this.ws.onclose = this.onClose.bind(this)
  }

  onOpen(event: Event) {
    this.reconnectAttempts = 0;
    this.startHeartbeat();
    this.emit('open', event);
  }

  onMessage(event: MessageEvent) {
    try {
     const data = JSON.parse(event.data)
      if (data.msg === "HEART_BEAT_RESPOND" || data.msg === "SUCCESS") return
      this.emit('message', event.data)
    } catch (e: any) {
      console.error('WebSocket 无法解析数据:', event.data)
    }
  }

  onError(event: Event) {
    console.error('WebSocket 发生错误:', event)
    this.emit('error', event)
  }

  onClose(event: CloseEvent) {
    this.stopHeartbeat();
    this.emit('close', event)

    if (this.reconnectAttempts < this.opts.maxReconnectAttempts!) {
      setTimeout(() => {
        this.reconnectAttempts++
        this.init()
      }, this.opts.reconnectInterval)
    }
  }

  startHeartbeat() {
    if (!this.opts.heartbeatInterval) return;
    this.heartbeatInterval = window.setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type :'HEART_BEAT' }))
      }
    }, this.opts.heartbeatInterval);
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null;
    }
  }

  send(data: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(data)
    } else {
      console.error('WebSocket 未连接，无法发送数据:', data)
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
    console.log(new Date())
  }

  off(event: string) {
    if (this.listeners[event]) {
      delete this.listeners[event]
    }
  }

  emit(event: string, data: any) {
    this.listeners[event]?.forEach(callback => callback(data))
  }
}

export function useSocket(opts?: SocketOptions) {
  const socket = new Socket(opts)
  console.log('socket', socket)
  onUnmounted(() => {
    socket.off('open')
    socket.off('message')
    socket.off('error')
    socket.off('close')
  });

  return {
    socket,
    send: socket.send.bind(socket),
    on: socket.on.bind(socket),
    off: socket.off.bind(socket)
  };
}