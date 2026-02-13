import React, { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Input, Spin } from '@apron-design/react'
import ModelSelector from './ModelSelector'
import { socketService } from '../../services/socket'
import { api } from '../../services/api'
import { ModelInfo, Message } from '../../types'
import './Chat.css'

interface ChatProps {
  serverUrl?: string
}

const Chat: React.FC<ChatProps> = ({ serverUrl = 'http://localhost:4400' }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const [currentModel, setCurrentModel] = useState('')
  const [models, setModels] = useState<ModelInfo[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadModels()
    initializeChat()
    return () => {
      socketService.disconnect()
    }
  }, [])

  const loadModels = async () => {
    try {
      const response = await api.getModelList()
      if (response.success && response.data.length > 0) {
        setModels(response.data)
        setCurrentModel(response.data[0].id)
      }
    } catch (error) {
      console.error('Failed to load models:', error)
    }
  }

  const initializeChat = () => {
    const socket = socketService.connect(serverUrl)

    socket.on('connect', async () => {
      setIsConnected(true)
      try {
        const sessionResponse = await api.createSession()
        if (sessionResponse.success) {
          setSessionId(sessionResponse.data.sessionId)
          setCurrentModel(sessionResponse.data.modelId)
        }
      } catch (error) {
        console.error('Failed to create session:', error)
      }
    })

    socket.on('sessionCreated', (data: any) => {
      setSessionId(data.sessionId)
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

    socket.on('modelSwitched', (data: any) => {
      setCurrentModel(data.modelId)
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
    })
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !sessionId) return

    const userMessage = inputValue.trim()
    setInputValue('')
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }])
    setIsLoading(true)

    socketService.emit('sendMessage', { message: userMessage })
  }

  const handleModelChange = async (modelId: string) => {
    if (modelId === currentModel || !sessionId) return

    try {
      const response = await api.switchModel(sessionId, modelId)
      if (response.success) {
        setCurrentModel(modelId)
      }
    } catch (error) {
      console.error('Failed to switch model:', error)
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const renderMarkdown = (content: string) => (
    <ReactMarkdown remarkPlugins={[remarkGfm]}>
      {content}
    </ReactMarkdown>
  )

  return (
    <div className="chat">
      <div className="chat-header">
        <h2 className="chat-title">AI 智能助手</h2>
        <ModelSelector
          models={models}
          currentModel={currentModel}
          onModelChange={handleModelChange}
        />
        <div className={`chat-status ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? '已连接' : '未连接'}
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <div className="chat-empty-icon">🤖</div>
            <h3>开始与 AI 对话</h3>
            <p>选择一个模型，输入消息开始聊天</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`chat-message ${message.role === 'user' ? 'user' : 'assistant'}`}
            >
              <div className="chat-message-avatar">
                {message.role === 'user' ? '👤' : '🤖'}
              </div>
              <div className="chat-message-content">
                {renderMarkdown(message.content)}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="chat-message assistant">
            <div className="chat-message-avatar">🤖</div>
            <div className="chat-message-content chat-loading">
              <Spin size="small" /> 思考中...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <Input
          value={inputValue}
          onChange={setInputValue}
          onPressEnter={handleSendMessage}
          placeholder="输入消息..."
          size="large"
          disabled={!isConnected || isLoading}
          className="chat-input"
        />
        <button
          className="chat-send-btn"
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || !isConnected || isLoading}
        >
          发送
        </button>
      </div>
    </div>
  )
}

export default Chat
