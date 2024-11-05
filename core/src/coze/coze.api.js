import { createToken } from '../utils/jwt.utils.js'
import { randomString } from '../utils/string.utils.js'
import { bot_id, iss, kid, method } from '../configs/coze.config.js'
import { request } from '../utils/request.utils.js'
import { wsMessage } from '../index.js'
import axios from 'axios'
const headers = {
  'Content-Type': 'application/json'
}

// 创建 coze 会话
export const createCozeConversation = async (question = '') => {
  const url = 'https://api.coze.cn/v1/conversation/create'
  headers.Authorization = await getCozeToken()
  const body = {}
  if (question) {
    const messages = [
      {
        role: 'user',
        type: 'question',
        content: question,
        content_type: 'text'
      }
    ]
    body.messages = messages
  }
  const res = await request(url, body, 'post', headers)
  console.log('创建 coze 会话，conversation_id：',res.data.id)
  // console.log(res)
  const conversation_id = res.data.id
  return conversation_id
}

// 创建 coze 聊天
export const chat = async (user_id, content = '', conversation_id = '') => {
  // console.log('创建 coze 聊天，提问：', question, '到会话：', conversation_id)
  const url = `https://api.coze.cn/v3/chat${conversation_id ? `?conversation_id=${conversation_id}` : ''}`
  const body = {
    bot_id,
    user_id,
    stream: true,
    additional_messages: [
      { role: 'user', content, content_type: 'text' }
    ],
    auto_save_history: true
  }
  headers.Authorization = await getCozeToken()
  console.log(body)
  console.log('=======================')
  axios({
    method: 'post',
    url: encodeURI(url),
    responseType: 'stream',
    headers,
    data: body
  })
  .then((response) => {
    response.data.on('data', chunk => {
      // const { data } = JSON.parse()
      const data = convertToJSON(chunk.toString())
      if (data.event === 'conversation.message.delta' && data.data.type === 'answer') {
        wsMessage(user_id, data.data.content)
      }
      if (data.event === 'conversation.message.completed' && data.data.type === 'answer') {
        wsMessage(user_id, data.data.content, true)
      }
    })
    response.data.on('end', () => {
      console.log('流已经接收完毕')
    })
  })
  .catch((error) => {
    console.error(error)
  })
  const chat_id = 111
  return {
    cozeChatId: chat_id,
    // cozeConversationId: data.conversation_id
  }
}


const getCozeToken = async () => {
  const header = {
    alg: 'RS256',
    typ: 'JWT',
    kid: kid
  }
  
  const payload = {
    iss: iss,
    aud: 'api.coze.cn',
    jti: randomString(32)
  }
  const currentTime = Math.floor((+new Date() / 1000))
  payload.iat = currentTime
  payload.exp = currentTime + 86399

  const signature = createToken(header, payload)

  const oAuth2Url = 'https://api.coze.cn/api/permission/oauth2/token'
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `${method} ${signature}`
  }
  const body = {
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    duration_seconds: 86399
  }
  // // 发请求
  const res = await request(oAuth2Url, body, 'post', headers)
  return `${res.token_type} ${res.access_token}`
}


function convertToJSON(inputData) {
  const lines = inputData.split('\n');
  const result = [];
  let currentEvent = null;
  let currentData = null;

  lines.forEach(line => {
      if (line.startsWith('event:')) {
          if (currentEvent) {
              currentEvent.data = currentData;
              result.push(currentEvent);
          }
          const eventName = line.slice('event:'.length).trim();
          currentEvent = {event: eventName};
          currentData = {};
      } else if (line.startsWith('data:')) {
          const dataString = line.slice('data:'.length).trim();
          currentData = JSON.parse(dataString);
      }
  });

  if (currentEvent) {
      currentEvent.data = currentData;
      result.push(currentEvent);
  }

  return result[0]
}
