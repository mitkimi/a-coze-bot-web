import React from 'react'
import { ChatWidget } from '../../chat-widget/src'
import './WidgetPage.css'

const WidgetPage: React.FC = () => {
  return (
    <div className="widget-page">
      <div className="widget-page-content">
        <h1>悬浮组件演示</h1>
        <p>这个页面用于演示悬浮聊天组件的功能。</p>
        <p>点击右下角的按钮打开聊天窗口。</p>
        
        <div className="widget-page-features">
          <h2>功能特点</h2>
          <ul>
            <li>支持多模型切换</li>
            <li>Markdown 消息渲染</li>
            <li>实时 WebSocket 通信</li>
            <li>深色/浅色主题</li>
            <li>可自定义 AI 助手信息</li>
          </ul>
        </div>
      </div>

      <ChatWidget
        serverUrl="http://localhost:4400"
        placeholder="输入消息..."
        theme="light"
        assistant={{
          name: 'AI 助手',
          headImgUrl: 'https://oss.upyun.mitkimi.com/common/mitkimi.default.png',
          bio: '有什么可以帮您？'
        }}
      />
    </div>
  )
}

export default WidgetPage
