import MessageService from './socket/service.js'
const { sendMessage } = MessageService()

export const wsMessage = (roomId, message, completed = false) => {
  const obj = {
    roomId,
    role: 'ai',
    userId: 'ai',
    type: 'message',
    completed,
    content: message
  }
  sendMessage(roomId, JSON.stringify(obj))
}

console.log(`Ws Server is running`)