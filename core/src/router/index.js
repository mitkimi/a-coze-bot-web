import Router from 'koa-router'
import { user_chat } from '../apis/chat.js'
import { request } from '../utils/request.utils.js'

const router = new Router({
  prefix: '/api'
})

router.get('/', async (ctx, next) => {
  ctx.body = '404'
  await next()
})

router.post('/chat', async (ctx, next) => {
  console.log(ctx.request.body)
  const { content, user_id } = ctx.request.body
  ctx.body = await user_chat(content, user_id)
  next()
})

export default router