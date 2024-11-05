import WebSocket, { WebSocketServer } from 'ws'
import { createId } from '../utils/id.utils.js'
import { user_chat } from '../apis/chat.js'

let roomPool = {}
// 用于存储每个房间的最后活动时间
let roomActivityTimestamps = {}

function startWebSocketServer() {
  const wss = new WebSocketServer({ port: 8800 })

  wss.on('connection', (ws) => {
    const userId = createId()
    const roomId = createId()
    if (!roomPool[roomId]) {
      roomPool[roomId] = []
    }
    roomPool[roomId].push(ws)
    roomActivityTimestamps[roomId] = Date.now()

    // 发送用户ID和房间ID给客户端（这里只是示例，实际可能需要特定的消息格式）
    ws.send(JSON.stringify({ userId, roomId, role: 'system', type: 'start', content: '' }))

    ws.on('message', (trunk) => {
      const data = JSON.parse(trunk)
      const { roomId, userId, content, role } = data
      if (role === 'user') {
        // 这里是调用 coze 的代码
        user_chat(content, roomId)
      }
      // roomActivityTimestamps[roomId] = Date.now()
      // // 这里可以添加更多处理消息的逻辑，比如广播消息给房间内其他用户
      // const roomUsers = roomPool[roomId]
      // roomUsers.forEach((userWs) => {
      //   if (userWs!== ws) {
      //     userWs.send(message)
      //   }
      // })
    })

    ws.on('close', () => {
      const roomIndex = roomPool[roomId].indexOf(ws)
      if (roomIndex!== -1) {
        roomPool[roomId].splice(roomIndex, 1)
      }
      if (roomPool[roomId].length === 0) {
        delete roomPool[roomId]
        delete roomActivityTimestamps[roomId]
      }
    })
  })

  // 定期检查房间是否超时并销毁
  setInterval(() => {
    const currentTime = Date.now()
    for (const roomId in roomActivityTimestamps) {
      if (currentTime - roomActivityTimestamps[roomId] > 30 * 60 * 1000) {
        if (roomPool[roomId]) {
          roomPool[roomId].forEach((ws) => {
            ws.close()
          })
          delete roomPool[roomId]
          delete roomActivityTimestamps[roomId]
        }
      }
    }
  }, 60 * 1000) // 每分钟检查一次

  return {
    sendMessage: (roomId, message) => {
      const roomUsers = roomPool[roomId]
      if (roomUsers) {
        roomUsers.forEach((ws) => {
          ws.send(message)
        })
      }
    }
  }
}

export default startWebSocketServer