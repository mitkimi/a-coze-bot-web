import { createCozeConversation, chat, } from '../coze/coze.api.js'
import { createId } from '../utils/id.utils.js'

export const user_chat = async (content, user_id = null) => {
  const userId = user_id || createId()
  const CoversationId = await createCozeConversation()
  chat(userId, content, CoversationId)
}