import React from 'react'
import { Button, Avatar } from '@apron-design/react'
import './PageHeader.css'

const PageHeader: React.FC = () => {
  return (
    <header className="page-header">
      <div className="page-header-container">
        <div className="page-header-left">
          <a href="/" className="page-logo">
            <img 
              src="https://oss.upyun.mitkimi.com/common/mitkimi.logo.png" 
              alt="Coze Bot" 
              className="page-logo-image"
            />
            <span className="page-logo-text">Coze Bot</span>
          </a>
          
          <nav className="page-nav">
            <a href="/" className="page-nav-link">首页</a>
            <a href="/chat" className="page-nav-link">AI 对话</a>
            <a href="/widget" className="page-nav-link">悬浮组件</a>
          </nav>
        </div>

        <div className="page-header-right">
          <span className="page-header-user">
            <Avatar size="small" className="page-user-avatar">
              U
            </Avatar>
            <span className="page-user-name">用户</span>
          </span>
        </div>
      </div>
    </header>
  )
}

export default PageHeader
