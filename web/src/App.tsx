import React from 'react'
import { ConfigProvider } from '@apron-design/react'
import PageHeader from './components/PageHeader'
import PageFooter from './components/PageFooter'
import Chat from './components/chat/Chat'
import './App.css'

const App: React.FC = () => {
  return (
    <div className="app">
      <PageHeader />
      <main className="app-main">
        <Chat serverUrl="http://localhost:4400" />
      </main>
      <PageFooter />
    </div>
  )
}

export default App
