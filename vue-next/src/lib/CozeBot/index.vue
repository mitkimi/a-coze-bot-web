<script lang="ts" setup>
import { ref } from 'vue'
const { theme, show, assistant } = defineProps({
  theme: { type: String, default: 'light' },
  show: { type: Boolean, default: true },
  placeholder: { type: String, default: '' },
  assistant: { type: Object, default: { name: 'Eric', bio: 'I\'m your AI assistant.', headImgUrl: 'https://oss.upyun.mitkimi.com/common/mitkimi.default.png' } }
})
const dialogRef = ref()
const isBotShow = ref(show)
const isBotOpen = ref(false)
const dialog: any = ref([])
const inputVal = ref('')
const answeringVal = ref('')
const isAnswering = ref(false)
const handleOpenToggle = () => {
  isBotOpen.value = !isBotOpen.value
}
import { useSocket } from './utils/socket.utils'
const roomId = ref('')
const userId = ref('')
const { on, send } = useSocket()
on('message', (trunk: any) => {
  const res = JSON.parse(trunk)
  if (res.role === 'system') {
    // 系统消息
    if (res.type === 'start') {
      // 连接开始
      roomId.value = res.roomId
      userId.value = res.userId
    }
  }
  if (res.role === 'ai') {
    if (res.completed) {
      answeringVal.value = ''
      const obj = { role: 'ai', message: res.content }
      dialog.value.push(obj)
      isAnswering.value = false
      // console.log(res.content)
    } else {
      answeringVal.value += res.content
    }
    toBottom()
  }
})

const handleSendMessage = () => {
  const message = inputVal.value
  if (message.length <= 0) return 
  inputVal.value = ''
  const obj = { role: 'user', roomId: roomId.value, userId: userId.value, type: 'message', content: message }
  send(JSON.stringify(obj))
  const localObj = {
    role: 'user',
    message
  }
  dialog.value.push(localObj)
  isAnswering.value = true
  toBottom()
}

const toBottom = () => {
  setTimeout(() => {
    const div = dialogRef.value
    div.scrollTop = div.scrollHeight + 2000
  }, 1)
}
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
        <div class="header-toggle-btn" @click="handleOpenToggle">
          <img v-if="theme === 'light'" src="./assets/down.svg" />
          <img v-if="theme === 'dark'" src="./assets/down-white.svg" />
        </div>
      </div>
      <div class="bot-dialog-container" ref="dialogRef">
        <div :class="`dialog-item dialog-item-${item.role}`" v-for="item,index in dialog">
          <div class="message">
            <div v-html="item.message.replace(/\n/g, '<br>')"></div>
          </div>
        </div>
        <div v-if="isAnswering" class="dialog-item dialog-item-ai">
          <div class="message">
            <span v-html="answeringVal.replace(/\n/g, '<br>')"></span>
            <img :class="['loading', answeringVal.length > 0 ? 'loading-out' : '']" src="./assets/ball-loading.svg" />
          </div>
        </div>
      </div>
      <div class="bot-input-container">
        <textarea
          class="input-text"
          v-model="inputVal"
          @keydown.enter.prevent="handleSendMessage"
          :placeholder="placeholder" />
        <button class="send-button" @click="handleSendMessage">
          <img src="./assets/send.svg" />
        </button>
      </div>
    </div>
  </div>
</template>
<style lang="less" scoped>
.bot-assistant {
  position: fixed;
  bottom: 40px;
  right: 40px;
  z-index: 5;
  .bot-assistant-container {
    box-sizing: border-box;
    width: 300px;
    height: 60px;
    border-radius: 20px;
    backdrop-filter: blur(5px);
    transition: all, 300ms;
    overflow: hidden;
    .bot-header-container {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      .header-assistant-info {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          overflow: hidden;
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
        .header-assistant-txt {
          margin-left: 15px;
          .assistant-name {
            font-size: 16px;
          }
          .assistant-bio {
            font-size: 12px;
          }
        }
      }
      .header-toggle-btn {
        cursor: pointer;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        img {
          transform: rotate(180deg);
        }
      }
    }
    .bot-dialog-container {
      height: 220px;
      padding: 10px;
      box-sizing: border-box;
      overflow-y: auto;
      .dialog-item {
        margin-top: 10px;
        .message {
          padding: 8px 10px;
          border-radius: 10px;
          font-size: 12px;
          max-width: 80%;
          word-wrap: break-word;
          position: relative;
          .loading {
            width: 20px;
            height: 20px;
          }
          .loading-out {
            position: absolute;
            bottom: 0;
            right: -25px;
          }
        }
      }
      .dialog-item-ai {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
      }
      .dialog-item-user {
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        .message {
          background: #1BBA48;
          color: #FFFFFF;
        }
      }
    }
    .bot-input-container {
      height: 60px;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      box-sizing: border-box;
      padding: 10px;
      .input-text {
        border-radius: 10px;
        border: 0;
        height: 40px;
        font-size: 12px;
        padding: 5px;
        width: calc(100% - 40px - 10px);
        box-sizing: border-box;
        resize: none;
      }
      .send-button {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 0;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        transition: all, 300ms;
        background: #4C9EEA;
        &:hover {
          background: #6FB1EF;
        }
        &:active {
          background: #1B80DD;
        }
      }
    }
  }
  .bot-assistant-open {
    height: 340px;
    .bot-header-container {
      .header-toggle-btn {
        img {
          transform: none;
        }
      }
    }
  }
}

// theme-light
.bot-assistant-light {
  .bot-assistant-container {
    background: rgba(255, 255, 255, .7);
    box-shadow: 0 0 12px 0 rgba(0, 0, 0, .25);
    .bot-header-container {
      border-bottom: 1px solid rgba(0, 0, 0, .18);
      .header-assistant-info {
        .header-assistant-txt {
          .assistant-name {
            color: #000000;
          }
          .assistant-bio {
            color: #535353;
          }
        }
      }
    }
    .bot-dialog-container {
      .dialog-item-ai {
        .message {
          background: #F2F2F2;
        }
      }
    }
    .bot-input-container {
      border-top: 1px solid rgba(0, 0, 0, .18);
      .input-text {
        background: #F4F4F4;
      }
    }
  }
  /* 设置滚动条的宽度和背景色 */
  ::-webkit-scrollbar {
    width: 10px; /* 对于垂直滚动条 */
    background-color: #F2F2F2;
  }
  
  /* 设置滚动条滑块的颜色 */
  ::-webkit-scrollbar-thumb {
    background-color: #F2F2F2; /* 滚动条滑块颜色 */
    border-radius: 6px; /* 滑块的圆角 */
  }
  
  /* 设置滚动条滑块的背景色 */
  ::-webkit-scrollbar-track {
    background-color: #FFFFFF; /* 滚动条轨道颜色 */
  }
}
// theme-dark
.bot-assistant-dark {
  .bot-assistant-container {
    background: rgba(0, 0, 0, .7);
    box-shadow: 0 0 12px 0 rgba(255, 255, 255, .5);
    .bot-header-container {
      border-bottom: 1px solid rgba(255, 255, 255, .18);
      .header-assistant-info {
        .header-assistant-txt {
          .assistant-name {
            color: #FFFFFF;
          }
          .assistant-bio {
            color: #999999;
          }
        }
      }
    }
    .bot-dialog-container {
      .dialog-item-ai {
        .message {
          background: #131313;
          color: #FFFFFF;
        }
      }
    }
    .bot-input-container {
      border-top: 1px solid rgba(255, 255  255, .18);
      .input-text {
        background: #121212;
        color: #FFFFFF;
      }
    }
  }

  /* 设置滚动条的宽度和背景色 */
  ::-webkit-scrollbar {
    width: 10px; /* 对于垂直滚动条 */
    background-color: #131313;
  }
  
  /* 设置滚动条滑块的颜色 */
  ::-webkit-scrollbar-thumb {
    background-color: #131313; /* 滚动条滑块颜色 */
    border-radius: 6px; /* 滑块的圆角 */
  }
  
  /* 设置滚动条滑块的背景色 */
  ::-webkit-scrollbar-track {
    background-color: #000000; /* 滚动条轨道颜色 */
  }
}
</style>