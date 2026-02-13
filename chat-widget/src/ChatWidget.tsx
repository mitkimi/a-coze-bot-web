import React, { useEffect, useRef, useState, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { socketService } from '../services/socket'
import { Message, ModelInfo } from '../types'
import './ChatWidget.css'

export interface ChatWidgetProps {
  serverUrl?: string
  placeholder?: string
  theme?: 'light' | 'dark'
  assistant?: {
    name?: string
    headImgUrl?: string
    bio?: string
  }
}

const ChatWidget: React.FC<ChatWidgetProps> = ({
  serverUrl = 'http://localhost:4400',
  placeholder = '输入消息...',
  theme = 'light',
  assistant = {
    name: 'AI 助手',
    headImgUrl: 'https://oss.upyun.mitkimi.com/common/mitkimi.default.png',
    bio: '智能对话助手'
  }
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [currentModel, setCurrentModel] = useState('')
  const [models, setModels] = useState<ModelInfo[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    initializeWidget()
    return () => {
      socketService.disconnect()
    }
  }, [])

  const initializeWidget = useCallback(() => {
    const socket = socketService.connect(serverUrl)

    socket.on('connect', async () => {
      setIsConnected(true)
      socketService.emit('createSession', {})
    })

    socket.on('sessionCreated', (data: any) => {
      setCurrentModel(data.modelId)
    })

    socket.on('messageReceived', (data: any) => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message,
        timestamp: new Date(data.timestamp)
      }])
      setIsLoading(false)
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
    })
  }, [serverUrl])

  const handleSendMessage = useCallback(() => {
    if (!inputValue.trim() || isLoading || !isConnected) return

    const userMessage = inputValue.trim()
    setInputValue('')
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }])
    setIsLoading(true)

    socketService.emit('sendMessage', { message: userMessage })
  }, [inputValue, isLoading, isConnected])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const renderMarkdown = (content: string) => (
    <ReactMarkdown remarkPlugins={[remarkGfm]}>
      {content}
    </ReactMarkdown>
  )

  const toggleChat = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className={`chat-widget ${theme}`}>
      {isOpen && (
        <div className="chat-widget-container">
          <div className="chat-widget-header">
            <div className="chat-widget-header-info">
              <img 
                src={assistant.headImgUrl} 
                alt={assistant.name}
                className="chat-widget-avatar"
              />
              <div className="chat-widget-header-text">
                <div className="chat-widget-name">{assistant.name}</div>
                <div className="chat-widget-bio">{assistant.bio}</div>
              </div>
            </div>
            <button 
              className="chat-widget-close"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="chat-widget-messages">
            {messages.length === 0 ? (
              <div className="chat-widget-empty">
                有什么可以帮您？
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`chat-widget-message ${message.role}`}
                >
                  <div className="chat-widget-message-content">
                    {renderMarkdown(message.content)}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="chat-widget-message assistant">
                <div className="chat-widget-message-content">
                  思考中...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-widget-input">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={placeholder}
              disabled={!isConnected || isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || !isConnected || isLoading}
            >
              发送
            </button>
          </div>
        </div>
      )}

      <button 
        className={`chat-widget-toggle ${isOpen ? 'open' : ''}`}
        onClick={toggleChat}
      >
        {isOpen ? '✕' : '💬'}
      </button>
    </div>
  )
}

export default ChatWidget
