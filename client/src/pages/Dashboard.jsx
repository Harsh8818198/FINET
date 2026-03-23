import React, { useContext, useMemo } from 'react'
import { AppContext } from '../App'
import { useNavigate } from 'react-router-dom'
import { useMarketData } from '../hooks/useMarketData'
import { ACHIEVEMENTS } from '../data/appData'
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  Activity,
  ShieldCheck,
  Zap,
  Target,
  History,
  Briefcase,
  ExternalLink,
  Network
} from 'lucide-react'

function HealthGauge({ score }) {
  const r = 48, circ = 2 * Math.PI * r
  const filled = circ * (score / 100)
  const color = score >= 80 ? 'var(--green)' : score >= 50 ? 'var(--yellow)' : 'var(--red)'

  return (
    <div className="health-gauge" style={{ width: 140, height: 140 }}>
      <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
        {/* Soft background track */}
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
        {/* Glowing active track */}
        <circle
          cx="70" cy="70" r={r} fill="none"
          stroke={color} strokeWidth="6"
          strokeDasharray={`${filled} ${circ}`}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dasharray 1.5s cubic-bezier(0.16, 1, 0.3, 1)',
            filter: `drop-shadow(0 0 8px ${color})`
          }}
        />
      </svg>
      <div className="gauge-inner">
        <span style={{ fontSize: '1.8rem', fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', letterSpacing: '-0.05em' }}>
          {score}
        </span>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 2 }}>
          Index
        </span>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { income, nodes, transactions } = useContext(AppContext)
  const market = useMarketData()
  const navigate = useNavigate()

  const totalSpent = transactions.reduce((s, t) => s + t.amount, 0)
  const totalSaved = Math.max(0, income - totalSpent)
  const savingsRate = income > 0 ? Math.round((totalSaved / income) * 100) : 0

  const healthScore = useMemo(() => {
    let score = 0
    const totalAlloc = nodes.reduce((s, n) => s + n.percent, 0)
    if (totalAlloc >= 95 && totalAlloc <= 105) score += 20
    const overNodes = nodes.filter(n => (income * n.percent / 100) < transactions.filter(t => t.category === n.id).reduce((s, t) => s + t.amount, 0))
    score += Math.max(0, 20 - overNodes.length * 7)
    if (savingsRate >= 30) score += 35
    else if (savingsRate >= 20) score += 25
    else if (savingsRate >= 10) score += 15
    score += nodes.some(n => /invest|sip|mutual|stock/i.test(n.name)) ? 15 : 0
    score += transactions.length >= 5 ? 10 : (transactions.length > 0 ? 5 : 0)
    return Math.min(100, score)
  }, [nodes, transactions, income, savingsRate])

  return (
    <div className="anim-fade">
      {/* 1. System Header */}
      <div style={{ marginBottom: 48, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: 6, fontWeight: 500, letterSpacing: '-0.04em' }}>Protocol Overview</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Real-time capital deployment & intelligence.</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/graph')} style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
          <Activity size={16} style={{ color: 'var(--accent-indigo)' }} /> System Node Map
        </button>
      </div>

      {/* 2. Bento Grid */}
      <div className="bento-grid">

        {/* KPI Cells */}
        <div className="bento-card bento-3 stat-card">
          <div className="stat-label">Capital Input</div>
          <div className="stat-value" style={{ fontFamily: 'var(--font-mono)' }}>₹{income.toLocaleString()}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 8 }}>Baseline influx</div>
        </div>

        <div className="bento-card bento-3 stat-card">
          <div className="stat-label">System Outflow</div>
          <div className="stat-value" style={{ fontFamily: 'var(--font-mono)' }}>₹{totalSpent.toLocaleString()}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--red)', marginTop: 8 }}>{Math.round((totalSpent / income) * 100)}% utilization</div>
        </div>

        <div className="bento-card bento-3 stat-card">
          <div className="stat-label">Net Retention</div>
          <div className="stat-value" style={{ fontFamily: 'var(--font-mono)' }}>₹{totalSaved.toLocaleString()}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--green)', marginTop: 8 }}>{savingsRate}% efficiency</div>
        </div>

        <div className="bento-card bento-3 stat-card">
          <div className="stat-label">Active Nodes</div>
          <div className="stat-value" style={{ fontFamily: 'var(--font-mono)' }}>{nodes.length}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 8 }}>Allocation hubs</div>
        </div>

        {/* Secondary Info Grid */}
        <div className="bento-card bento-4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div className="stat-label" style={{ marginBottom: 32 }}>Stability Index</div>
          <HealthGauge score={healthScore} />
          <div style={{ marginTop: 32, fontSize: '0.8rem', color: healthScore >= 75 ? 'var(--green)' : 'var(--text-muted)', fontWeight: 500 }}>
            {healthScore >= 75 ? 'Protocol status: OPTIMAL' : 'Manual recalibration suggested.'}
          </div>
        </div>

        <div className="bento-card bento-8">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32, alignItems: 'center' }}>
            <div className="stat-label">Market Intelligence</div>
            <ArrowUpRight size={16} color="var(--text-muted)" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 24 }}>
            {market.stocks.map(s => (
              <div key={s.symbol} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, letterSpacing: '-0.02em' }}>{s.symbol}</span>
                  <span style={{
                    fontSize: '0.75rem',
                    color: s.percent >= 0 ? 'var(--green)' : 'var(--red)',
                    fontWeight: 600,
                    fontFamily: 'var(--font-mono)'
                  }}>
                    {s.percent >= 0 ? '+' : ''}{s.percent.toFixed(2)}%
                  </span>
                </div>
                <div style={{ fontSize: '1.2rem', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontWeight: 500 }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '1rem', marginRight: 2 }}>₹</span>{s.price.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transactions / Settlements */}
        <div className="bento-card bento-7">
          <div className="stat-label" style={{ marginBottom: 32 }}>Recent Log Entries</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {transactions.slice(0, 4).map(tx => (
              <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.03)' }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div style={{ width: 10, height: 10, background: 'var(--border-bright)', borderRadius: '50%' }} />
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>{tx.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2, letterSpacing: '0.05em' }}>{tx.category.toUpperCase()}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>-₹{tx.amount.toLocaleString()}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>{new Date(tx.date).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bento-card bento-5" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="stat-label" style={{ marginBottom: 32 }}>Validation Badges</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {ACHIEVEMENTS.map(a => (
              <div key={a.id} style={{ opacity: a.earned ? 1 : 0.2, textAlign: 'center', filter: a.earned ? 'drop-shadow(0 0 10px rgba(255,255,255,0.1))' : 'none' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{a.icon}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>{a.name.split(' ')[0]}</div>
              </div>
            ))}
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.05), rgba(99,102,241,0.01))', padding: 24, borderRadius: 'var(--radius-sm)', border: '1px solid rgba(99,102,241,0.1)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 8, color: 'var(--accent-indigo)', letterSpacing: '0.1em' }}>INTEGRATION ACTIVE</div>
            <p style={{ fontSize: '0.85rem', marginBottom: 20, color: 'var(--text-secondary)' }}>Groww synchronization in progress. Portfolio parity at 100%.</p>
            <button className="btn btn-primary" style={{ width: '100%' }}>RUN AUDIT</button>
          </div>
        </div>

      </div>
    </div>
  )
}
