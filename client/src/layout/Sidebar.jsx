import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Network,
  PieChart,
  Users,
  Newspaper,
  Users2,
  TrendingUp,
  Landmark,
  ShieldCheck,
  Zap,
  BarChart2,
  Sparkles
} from 'lucide-react'

const NAV_CORE = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/graph', label: 'Flow Nodes', icon: Network },
  { to: '/budget', label: 'Allocations', icon: PieChart },
]

const NAV_MARKETS = [
  { to: '/markets', label: 'Markets', icon: BarChart2 },
  { to: '/mentors', label: 'Experts', icon: Users },
  { to: '/news', label: 'Intelligence', icon: Newspaper },
  { to: '/community', label: 'Hub', icon: Users2 },
]

const NAV_ASSETS = [
  { to: '/investments', label: 'Equity', icon: TrendingUp },
  { to: '/loans', label: 'Liability', icon: Landmark },
]

function NavItem({ n }) {
  return (
    <NavLink
      to={n.to} end={n.to === '/'}
      className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
    >
      {({ isActive }) => (
        <>
          <n.icon size={18} strokeWidth={isActive ? 2 : 1.5} color={isActive ? 'var(--text-primary)' : 'var(--text-muted)'} />
          <span style={{ fontWeight: 500, letterSpacing: '-0.01em' }}>{n.label}</span>
        </>
      )}
    </NavLink>
  )
}

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="nav-logo">
        <div style={{ padding: 6, background: 'linear-gradient(135deg, var(--accent-indigo), var(--accent-purple))', borderRadius: 8, display: 'flex' }}>
          <Zap size={16} strokeWidth={2.5} color="#fff" />
        </div>
        <span style={{ background: 'linear-gradient(180deg, #fff 0%, #a1a1aa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 700, letterSpacing: '-0.05em', fontSize: '1.4rem' }}>
          Finet
        </span>
      </div>

      {/* AI Coach CTA */}
      <NavLink to="/coach" className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
        style={({ isActive }) => ({
          margin: '4px 0 8px',
          background: isActive ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.06)',
          border: '1px solid rgba(99,102,241,0.25)',
          borderRadius: 'var(--radius-sm)',
        })}
      >
        {({ isActive }) => (
          <>
            <Sparkles size={18} strokeWidth={isActive ? 2 : 1.5} color="var(--accent-indigo)" />
            <span style={{ fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--accent-indigo)' }}>AI Coach</span>
          </>
        )}
      </NavLink>

      <div className="nav-section-label">Core System</div>
      {NAV_CORE.map(n => <NavItem key={n.to} n={n} />)}

      <div className="nav-section-label">Market & Intelligence</div>
      {NAV_MARKETS.map(n => <NavItem key={n.to} n={n} />)}

      <div className="nav-section-label">Assets</div>
      {NAV_ASSETS.map(n => <NavItem key={n.to} n={n} />)}

      <div style={{ marginTop: 'auto', padding: '0 8px' }}>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.1em', fontWeight: 700, textTransform: 'uppercase' }}>Protocol v5.0</div>
      </div>
    </aside>
  )
}
