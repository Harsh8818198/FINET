import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMarketData } from '../hooks/useMarketData'
import { Wallet, Flame, Bell, Sparkles } from 'lucide-react'
import { useJourney } from '../context/JourneyContext'
import { useAuth } from '../hooks/useAuth'
import { AppContext } from '../App'

export default function Topbar() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { journey } = useJourney()
  const { income, setIncome } = React.useContext(AppContext)
  const market = useMarketData()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  const handleEdit = () => { setDraft(String(income)); setEditing(true) }
  const handleSave = () => {
    const v = Number(draft)
    if (v > 0) setIncome(v)
    setEditing(false)
  }

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.12em', fontWeight: 700, textTransform: 'uppercase' }}>FINANCE / {window.location.pathname.replace('/','').toUpperCase() || 'OVERVIEW'}</div>
      </div>

      {/* 2. System Status & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        {/* Income Pulse */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>
          <Wallet size={16} color="var(--text-muted)" />
          {editing ? (
            <input
              autoFocus
              className="input"
              style={{ width: 100, height: 28, fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}
              type="number"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onBlur={handleSave}
              onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditing(false) }}
            />
          ) : (
            <span onClick={handleEdit} style={{ fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>
              <span style={{ color: 'var(--text-muted)', marginRight: 2 }}>₹</span>
              {income.toLocaleString()}
            </span>
          )}
        </div>

        <div style={{ width: 1, height: 16, background: 'var(--border)' }} />

        {/* Global Notifications/Alerts */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', color: 'var(--accent-indigo)' }}>
            <Sparkles size={14} fill="currentColor" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{journey.xp} XP</span>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', color: 'var(--yellow)' }}>
            <Flame size={14} fill="currentColor" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{journey.streak}</span>
          </div>
          <Bell size={16} className="text-muted" style={{ cursor: 'pointer' }} />
        </div>

        {/* Profile Token */}
        <div 
          onClick={() => navigate('/profile')}
          style={{
            width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--accent-indigo)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800,
            background: 'rgba(99,102,241,0.1)',
            color: 'var(--accent-indigo)', cursor: 'pointer', boxShadow: '0 0 12px rgba(99,102,241,0.2)'
          }}
        >
          {user?.full_name ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : '??'}
        </div>
      </div>
    </header>
  )
}
