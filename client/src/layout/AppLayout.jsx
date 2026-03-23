import React, { useState } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import FinetAIChat from '../components/chat/FinetAIChat'
import { Bot, X } from 'lucide-react'

export default function AppLayout({ children }) {
  const [isChatOpen, setIsChatOpen] = useState(false)

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <Topbar />
        <main className="page-content">
          {children}
        </main>
      </div>

      {/* Floating AI Command Center */}
      <div style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 500 }}>
        <button
          onClick={() => setIsChatOpen(s => !s)}
          className="btn"
          style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-indigo)'; e.currentTarget.style.background = 'var(--bg-overlay)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-card)' }}
          title="Finet Intelligence"
        >
          {isChatOpen ? <X size={20} /> : <Bot size={22} />}
        </button>
      </div>
      <FinetAIChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  )
}