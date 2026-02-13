<script lang="ts" setup>
import { onMounted, ref, watch, computed } from 'vue'
import MarkdownIt from 'markdown-it'
const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true
})

const props = defineProps({
  theme: { type: String, default: 'light' },
  greating: { type: String || null, default: null },
  show: { type: Boolean, default: true },
  placeholder: { type: String, default: '' },
  assistant: { type: Object, default: () => ({ name: 'Eric', bio: 'I\'m your AI assistant.', headImgUrl: 'https://oss.upyun.mitkimi.com/common/mitkimi.default.png' }) },
  serverUrl: { type: String, default: 'http://localhost:4400' }
})

const dialogRef = ref()
const isBotShow = ref(props.show)
const isBotOpen = ref(false)
let isFirstOpen = true
const dialog = ref<ChatMessage[]>([])
const inputVal = ref('')
const answeringVal = ref('')
const isAnswering = ref(false)
const currentModel = ref('')
const modelList = ref<ModelInfo[]>([])

const handleOpenToggle = () => {
  if (isFirstOpen) {
    isFirstOpen = false
    props.greating && (() => {
      isAnswering.value = true
      setTimeout(autoGreating, 1500)
    })()
  }
  toBottom()
  isBotOpen.value = !isBotOpen.value
}

const autoGreating = () => {
  isAnswering.value = false
  dialog.value.push({ role: 'ai', message: props.greating as string })
}

const { connect, on, send, disconnect } = useSocket()
let socket: any = null
let sessionId = ref('')

onMounted(() => {
  socket = connect(props.serverUrl)
  
  on('sessionCreated', (data: any) => {
    sessionId.value = data.sessionId
    currentModel.value = data.modelId
  })

  on('messageReceived', (data: any) => {
    answeringVal.value = ''
    dialog.value.push({ role: 'ai', message: data.message })
    isAnswering.value = false
    toBottom()
  })

  on('modelSwitched', (data: any) => {
    currentModel.value = data.modelId
  })
})

const loadModelList = async () => {
  try {
    const axios = require('axios')
    const response = await axios.get(`${props.serverUrl}/model/list`)
    if (response.data.success) {
      modelList.value = response.data.data
    }
  } catch (error) {
    console.error('Failed to load model list:', error)
  }
}

const handleSwitchModel = async (modelId: string) => {
  if (!sessionId.value || modelId === currentModel.value) return
  
  try {
    const axios = require('axios')
    await axios.post(`${props.serverUrl}/model/${sessionId.value}/switch`, { modelId })
  } catch (error) {
    console.error('Failed to switch model:', error)
  }
}

on('connect', () => {
  send('createSession', { modelId: '' })
  loadModelList()
})

const handleSendMessage = () => {
  const message = inputVal.value
  if (message.length <= 0) return 
  inputVal.value = ''
  
  dialog.value.push({ role: 'user', message })
  isAnswering.value = true
  toBottom()
  
  send('sendMessage', { message })
}

const renderMarkdown = (content: string) => {
  return md.render(content)
}

const toBottom = () => {
  setTimeout(() => {
    const div = dialogRef.value
    if (div) {
      div.scrollTop = div.scrollHeight + 2000
    }
  }, 1)
}

const currentModelName = computed(() => {
  const model = modelList.value.find(m => m.id === currentModel.value)
  return model?.name || 'AI Assistant'
})
</script>

<template>
  <div v-if="isBotShow" :class="['bot-assistant', `bot-assistant-${theme}`]">
    <div :class="['bot-assistant-container', isBotOpen ? 'bot-assistant-open' : '']">
      <div class="bot-header-container">
        <div class="header-assistant-info">
          <div class="avatar">
            <img :src="assistant.headImgUrl" />
          </div>
          <div class="header-assistant-txt">
            <div class="assistant-name">{{ assistant.name }}</div>
            <div class="assistant-bio">{{ assistant.bio }}</div>
          </div>
        </div>
        
        <div class="model-selector">
          <select 
            v-model="currentModel" 
            @change="handleSwitchModel(currentModel)"
            class="model-select"
          >
            <option 
              v-for="model in modelList" 
              :key="model.id" 
              :value="model.id"
              :disabled="!model.enabled"
            >
              {{ model.name }}
            </option>
          </select>
        </div>
        
        <div class="header-toggle-btn" @click="handleOpenToggle">
          <img v-if="theme === 'light'" src="./assets/down.svg" />
          <img v-if="theme === 'dark'" src="./assets/down-white.svg" />
        </div>
      </div>
      
      <div class="bot-dialog-container" ref="dialogRef">
        <div 
          v-for="(item, index) in dialog" 
          :key="index" 
          :class="['dialog-item', `dialog-item-${item.role}`]"
        >
          <div class="avatar">
            <img 
              :src="item.role === 'user' 
                ? 'https://oss.upyun.mitkimi.com/common/user.default.png' 
                : assistant.headImgUrl" 
            />
          </div>
          <div class="dialog-item-content">
            <div 
              class="dialog-item-text" 
              v-html="renderMarkdown(item.message)"
            ></div>
          </div>
        </div>
        
        <div v-if="isAnswering" class="dialog-item dialog-item-ai">
          <div class="avatar">
            <img :src="assistant.headImgUrl" />
          </div>
          <div class="dialog-item-content">
            <div class="dialog-item-text">
              <span v-html="renderMarkdown(answeringVal)"></span>
              <span class="loading-dot">...</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="bot-input-container">
        <input 
          type="text" 
          v-model="inputVal" 
          :placeholder="placeholder || '输入消息...'"
          @keydown.enter="handleSendMessage"
          :disabled="isAnswering"
        />
        <button @click="handleSendMessage" :disabled="isAnswering">
          <img src="./assets/send.svg" />
        </button>
      </div>
    </div>
    
    <div class="bot-toggle-btn" @click="handleOpenToggle">
      <img 
        v-if="theme === 'light' && !isBotOpen" 
        src="https://oss.upyun.mitkimi.com/common/chat-bot.png" 
      />
      <img 
        v-else-if="theme === 'light' && isBotOpen" 
        src="./assets/down.svg" 
      />
      <img 
        v-else-if="theme === 'dark' && !isBotOpen" 
        src="https://oss.upyun.mitkimi.com/common/chat-bot-dark.png" 
      />
      <img 
        v-else 
        src="./assets/down-white.svg" 
      />
    </div>
  </div>
</template>

<style lang="less" scoped>
.bot-assistant {
  position: fixed;
  z-index: 9999;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.bot-assistant-light {
  --primary-color: #1989fa;
  --bg-color: #ffffff;
  --text-color: #323233;
  --border-color: #ebedf0;
  --placeholder-color: #c8c9cc;
  --hover-bg: #f2f3f5;
}

.bot-assistant-dark {
  --primary-color: #1989fa;
  --bg-color: #1c1e26;
  --text-color: #e6e6e6;
  --border-color: #2c2e3a;
  --placeholder-color: #6e6e6e;
  --hover-bg: #2c2e3a;
}

.bot-assistant-container {
  position: absolute;
  bottom: 80px;
  right: 0;
  width: 380px;
  height: 600px;
  background: var(--bg-color);
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  opacity: 0;
  transform: translateY(20px);
  pointer-events: none;
  transition: all 0.3s ease;
  overflow: hidden;
}

.bot-assistant-open {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.bot-header-container {
  padding: 16px 20px;
  background: var(--bg-color);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-assistant-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.header-assistant-txt {
  .assistant-name {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-color);
    margin-bottom: 2px;
  }
  
  .assistant-bio {
    font-size: 12px;
    color: var(--placeholder-color);
  }
}

.model-selector {
  flex: 1;
  margin: 0 16px;
  
  .model-select {
    width: 100%;
    max-width: 140px;
    padding: 6px 10px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-color);
    color: var(--text-color);
    font-size: 12px;
    cursor: pointer;
    outline: none;
    
    &:focus {
      border-color: var(--primary-color);
    }
    
    &:hover {
      background: var(--hover-bg);
    }
    
    option {
      background: var(--bg-color);
      color: var(--text-color);
    }
  }
}

.header-toggle-btn {
  cursor: pointer;
  padding: 4px;
  
  img {
    width: 20px;
    height: 20px;
  }
}

.bot-dialog-container {
  flex: 1;
  padding: 16px 20px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 2px;
  }
}

.dialog-item {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  
  &-user {
    flex-direction: row-reverse;
    
    .dialog-item-content {
      background: var(--primary-color);
      color: #ffffff;
      border-radius: 16px 16px 4px 16px;
    }
  }
  
  &-ai {
    .dialog-item-content {
      background: var(--hover-bg);
      color: var(--text-color);
      border-radius: 16px 16px 16px 4px;
    }
  }
}

.dialog-item-content {
  max-width: 70%;
  padding: 12px 16px;
  word-break: break-word;
  line-height: 1.6;
  font-size: 14px;
}

.dialog-item-text {
  :deep(p) {
    margin: 0 0 8px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  :deep(pre) {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 8px;
    padding: 12px;
    overflow-x: auto;
    margin: 8px 0;
  }
  
  :deep(code) {
    font-family: 'Fira Code', 'Consolas', monospace;
    font-size: 13px;
  }
  
  :deep(ul), :deep(ol) {
    margin: 8px 0;
    padding-left: 20px;
  }
  
  :deep(a) {
    color: var(--primary-color);
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  :deep(blockquote) {
    border-left: 3px solid var(--primary-color);
    margin: 8px 0;
    padding-left: 12px;
    color: var(--placeholder-color);
  }
}

.loading-dot {
  animation: blink 1.4s infinite both;
}

@keyframes blink {
  0%, 60%, 100% {
    opacity: 0.2;
  }
  30% {
    opacity: 1;
  }
}

.bot-input-container {
  padding: 16px 20px;
  border-top: 1px solid var(--border-color);
  display: flex;
  gap: 12px;
  background: var(--bg-color);
  
  input {
    flex: 1;
    padding: 12px 16px;
    border: 1px solid var(--border-color);
    border-radius: 24px;
    background: var(--bg-color);
    color: var(--text-color);
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;
    
    &::placeholder {
      color: var(--placeholder-color);
    }
    
    &:focus {
      border-color: var(--primary-color);
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
  
  button {
    width: 44px;
    height: 44px;
    border: none;
    border-radius: 50%;
    background: var(--primary-color);
    color: #ffffff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    
    &:hover:not(:disabled) {
      transform: scale(1.05);
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    img {
      width: 20px;
      height: 20px;
    }
  }
}

.bot-toggle-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-color);
  
  &:hover {
    transform: scale(1.05);
  }
  
  img {
    width: 32px;
    height: 32px;
  }
}
</style>
