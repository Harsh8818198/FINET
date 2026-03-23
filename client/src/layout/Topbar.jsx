import React, { useState, useContext } from 'react'
import { AppContext } from '../App'
import { useMarketData } from '../hooks/useMarketData'
import { TrendingUp, TrendingDown, Wallet, Flame, Trophy, ChevronDown, Bell } from 'lucide-react'

export default function Topbar() {
  const { income, setIncome } = useContext(AppContext)
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
      {/* 1. Market Integrated Pulse */}
      <div style={{ display: 'flex', gap: 32, overflow: 'hidden', flex: 1 }}>
        {[market.sensex, market.nifty].map((item, i) => (
          <div key={item.name} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>{item.name}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, color: 'var(--text-primary)' }}>{item.value.toLocaleString()}</span>
            <span style={{
              color: item.percent >= 0 ? 'var(--green)' : 'var(--red)',
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              background: item.percent >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)',
              padding: '2px 6px', borderRadius: 4
            }}>
              {item.percent >= 0 ? '+' : ''}{item.percent.toFixed(2)}%
            </span>
          </div>
        ))}
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
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', color: 'var(--yellow)' }}>
            <Flame size={14} fill="currentColor" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>7</span>
          </div>
          <Bell size={16} className="text-muted" style={{ cursor: 'pointer' }} />
        </div>

        {/* Profile Token */}
        <div style={{
          width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))',
          color: 'var(--text-primary)', cursor: 'pointer', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)'
        }}>HM</div>
      </div>
    </header>
  )
}
