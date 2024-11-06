<script setup lang="ts">
import { ref } from 'vue'
import CozeBot from './components/CozeBot/index.vue'
const theme = ref('light')
const bot: any = ref(
  {
    id: 'eric',
    name: 'Eric',
    bio: 'I\'m your AI assistant.',
    headImgUrl: 'https://oss.upyun.mitkimi.com/common/mitkimi.default.png'
  }
)

const handleSelectTheme = (key: string) => {
  theme.value = key
}

const modes = [
  { name: '浅色模式', key: 'light' },
  { name: '深色模式', key: 'dark' },
]

const bots = [
  {
    id: 'tianhaotian',
    headImgUrl: 'https://oss.upyun.mitkimi.com/www/Frame%20127.png',
    name: '田昊天',
    bio: '我是 AI，不要相信我。'
  },
  {
    id: 'kimi',
    headImgUrl: 'https://oss.upyun.mitkimi.com/www/IMG_0072.jpg',
    name: 'Kimi',
    bio: 'My name is Kimi.'
  }
]
const handleSelectBot = (next: any) => {
  bot.value = next
}
</script>

<template>
  <div :class="['full-page', `page-${theme}`]">
    <img src="/favicon.png" style="width: 150px" />
    <h1>一个基于 Vue3 的 coze 的智能对话窗口</h1>
    <div>Version 1.0.1</div>
    <div class="selector theme-selector">
      <div
        :class="['selector-item', item.key === theme ? 'selector-item-active' : '']"
        v-for="item in modes" :key="item.key"
        @click="handleSelectTheme(item.key)">
        <div>{{ item.name }}</div>
        <div>theme={{ item.key }}</div>
      </div>
    </div>
    <div>可以自定义助手名字、头像和个性签名</div>
    <div class="selector">
      <div
        :class="['selector-item', item.id === bot.id ? 'selector-item-active' : '']"
        v-for="item,index in bots" :key="index"
        @click="handleSelectBot(item)">
        {{ item.name }}
      </div>
    </div>
    <div class="github">
      <a href="https://github.com/mitkimi/a-coze-bot-web" target="_blank">
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M29 14.9977C29 18.0476 28.1096 20.7904 26.3288 23.226C24.548 25.6616 22.2485 27.3475 19.4303 28.2838C19.1021 28.3444 18.8618 28.3017 18.7094 28.1555C18.557 28.0093 18.4808 27.8273 18.4808 27.6096V23.7649C18.4808 22.586 18.165 21.7235 17.5336 21.1776C18.2257 21.1045 18.8486 20.9949 19.4023 20.8487C19.9559 20.7025 20.5267 20.4653 21.1146 20.1371C21.7025 19.809 22.1948 19.4046 22.5914 18.924C22.988 18.4434 23.3099 17.8058 23.5572 17.011C23.8045 16.2162 23.929 15.3017 23.9305 14.2675C23.9305 12.7977 23.4507 11.5465 22.4911 10.5137C22.9406 9.40793 22.8923 8.16836 22.3464 6.79503C22.0058 6.68616 21.5136 6.75304 20.8697 6.99567C20.2258 7.23829 19.6667 7.5058 19.1923 7.7982L18.4994 8.23446C17.3687 7.91874 16.2022 7.76087 15 7.76087C13.7978 7.76087 12.6313 7.91874 11.5006 8.23446C11.3062 8.10071 11.048 7.93662 10.726 7.74221C10.4041 7.5478 9.89707 7.31372 9.20497 7.03999C8.51286 6.76626 7.99028 6.68461 7.63723 6.79503C7.1022 8.16836 7.05943 9.40793 7.50891 10.5137C6.5493 11.5465 6.06949 12.7977 6.06949 14.2675C6.06949 15.3002 6.19391 16.2116 6.44276 17.0017C6.69161 17.7918 7.01044 18.4294 7.39927 18.9147C7.78809 19.3999 8.27723 19.8066 8.86669 20.1348C9.45615 20.463 10.0269 20.7002 10.5791 20.8464C11.1312 20.9926 11.7541 21.1022 12.4478 21.1753C11.9625 21.6123 11.6647 22.2383 11.5542 23.0533C11.2992 23.1746 11.0254 23.2656 10.733 23.3263C10.4406 23.3869 10.0946 23.4173 9.69488 23.4173C9.29517 23.4173 8.89702 23.2866 8.50042 23.0253C8.10382 22.764 7.76632 22.3845 7.48792 21.8869C7.25774 21.498 6.96301 21.1823 6.60373 20.9397C6.24446 20.697 5.94351 20.5516 5.70088 20.5034L5.33694 20.4498C5.08187 20.4498 4.90535 20.477 4.80737 20.5314C4.70938 20.5858 4.67905 20.6558 4.71638 20.7414C4.75371 20.8269 4.80814 20.9117 4.87969 20.9957C4.95123 21.0797 5.03055 21.1528 5.11765 21.215L5.24596 21.3059C5.51347 21.4273 5.77787 21.6582 6.03916 21.9988C6.30045 22.3394 6.49175 22.6489 6.61306 22.9273L6.79503 23.3473C6.95367 23.8092 7.22119 24.1825 7.59757 24.4671C7.97395 24.7517 8.38066 24.9337 8.8177 25.013C9.25473 25.0923 9.677 25.1351 10.0845 25.1413C10.492 25.1475 10.8295 25.1265 11.097 25.0783L11.5169 25.006C11.5169 25.4679 11.52 26.0084 11.5262 26.6274C11.5325 27.2464 11.5356 27.5746 11.5356 27.6119C11.5356 27.8312 11.4563 28.0132 11.2976 28.1578C11.139 28.3024 10.8963 28.3452 10.5697 28.2861C7.75154 27.3498 5.45204 25.6639 3.67122 23.2283C1.89041 20.7927 1 18.0499 1 15C1 12.4602 1.62601 10.1179 2.87802 7.97317C4.13003 5.82842 5.82842 4.13003 7.97317 2.87802C10.1179 1.62601 12.4602 1 15 1C17.5398 1 19.8821 1.62601 22.0268 2.87802C24.1716 4.13003 25.87 5.82842 27.122 7.97317C28.374 10.1179 29 12.4602 29 15V14.9977Z" :fill="theme === 'light' ? 'black' : 'white'"/>
        </svg>
      </a>
    </div>
  </div>
  <div class="copyright">
    <div>&copy; <a href="https://www.mitkimi.com" target="_blank">田昊天</a> All Rights Reserved.</div>
    <div><a href="https://beian.miit.gov.cn/#/Integrated/index" target="_blank">京ICP备15063748号-3</a></div>
  </div>
  <coze-bot :theme="theme" :assistant="bot" placeholder="Say something." />
</template>

<style lang="less" scoped>
.full-page {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .selector {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 20px;
    margin: 20px 0 40px;
    .selector-item {
      width: 140px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      border-radius: 20px;
      cursor: pointer;
      height: 80px;
    }
    .selector-item-active {
      border: 1px solid #1B80DD;
      color: #1B80DD;
    }
  }
}
.page-light {
  background: #FFFFFF;
  .selector-item {
    border: 1px solid #000000;
  }
}
.page-dark {
  background: #000000;
  color: #FFFFFF;
  .selector-item {
    border: 1px solid #FFFFFF;
  }
}

.copyright {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 14px;
  color: #999999;
  text-align: center;
  a:link, a:visited {
    text-decoration: none;
    color: #999999;
  }
  a:hover, a:active {
    color: #666666;
  }
}
</style>
