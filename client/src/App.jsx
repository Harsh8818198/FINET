import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './layout/AppLayout'

// Lazy pages
const Dashboard = lazy(() => import('./pages/Dashboard'))
const FinanceGraph = lazy(() => import('./pages/FinanceGraph'))
const Budget = lazy(() => import('./pages/Budget'))
const Loans = lazy(() => import('./pages/Loans'))
const Investments = lazy(() => import('./pages/Investments'))
const Mentors = lazy(() => import('./pages/Mentors'))
const FinNews = lazy(() => import('./pages/FinNews'))
const Community = lazy(() => import('./pages/Community'))
const Markets = lazy(() => import('./pages/Markets'))
const FinCoach = lazy(() => import('./pages/FinCoach'))

class RouteErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false } }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(err, info) { console.error('Route error', err, info) }
  render() {
    if (this.state.hasError) return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--red)', letterSpacing: '0.1em', fontWeight: 700 }}>CRITICAL_SYSTEM_ERROR</div>
        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Execution halted due to unexpected state.</div>
        <button className="btn btn-primary" style={{ marginTop: 8, fontSize: '0.7rem' }} onClick={() => window.location.reload()}>REBOOT_PROTOCOL</button>
      </div>
    )
    return this.props.children
  }
}

export const AppContext = React.createContext(null)

const DEFAULT_NODES = [
  { id: 'needs', name: 'NEEDS', percent: 50, color: '#6366f1', spent: 0 },
  { id: 'wants', name: 'WANTS', percent: 30, color: '#71717a', spent: 0 },
  { id: 'invest', name: 'INVEST', percent: 20, color: '#10b981', spent: 0 },
]

const DEFAULT_TXS = [
  { id: 1, title: 'Monthly Rent', amount: 8000, category: 'needs', date: new Date().toISOString(), note: 'Apartment' },
  { id: 2, title: 'Groceries', amount: 3200, category: 'needs', date: new Date().toISOString(), note: 'Weekly shopping' },
  { id: 3, title: 'Nifty 50 SIP', amount: 5000, category: 'invest', date: new Date().toISOString(), note: 'Monthly SIP' },
  { id: 4, title: 'Dinner out', amount: 1200, category: 'wants', date: new Date().toISOString(), note: '' },
  { id: 5, title: 'OTT Subscriptions', amount: 800, category: 'wants', date: new Date().toISOString(), note: 'Netflix + Spotify' },
]

function ls(key, fallback) {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback }
  catch { return fallback }
}

export default function App() {
  const [income, setIncome] = useState(() => ls('finet:income', 45000))
  const [nodes, setNodes] = useState(() => ls('finet:nodes', DEFAULT_NODES))
  const [transactions, setTransactions] = useState(() => ls('finet:transactions', DEFAULT_TXS))
  const [portfolio, setPortfolio] = useState(() => ls('finet:portfolio', [
    { id: 1, name: 'HDFC Nifty 50 Index Fund', type: 'Index Fund', invested: 36000, value: 45200, roi: 25.5, color: '#10b981' },
    { id: 2, name: 'Axis Mid Cap Fund', type: 'Mid Cap', invested: 18000, value: 22800, roi: 26.7, color: '#7c5cfc' },
  ]))
  const [loans, setLoans] = useState(() => ls('finet:loans', [
    { id: 1, name: 'Education Loan', bank: 'SBI', principal: 500000, remaining: 320000, interestRate: 8.5, tenureMonths: 60, emi: 10500 },
  ]))

  useEffect(() => { localStorage.setItem('finet:income', JSON.stringify(income)) }, [income])
  useEffect(() => { localStorage.setItem('finet:nodes', JSON.stringify(nodes)) }, [nodes])
  useEffect(() => { localStorage.setItem('finet:transactions', JSON.stringify(transactions)) }, [transactions])
  useEffect(() => { localStorage.setItem('finet:portfolio', JSON.stringify(portfolio)) }, [portfolio])
  useEffect(() => { localStorage.setItem('finet:loans', JSON.stringify(loans)) }, [loans])

  const addTransaction = (tx) => setTransactions(prev => [{ ...tx, id: tx.id ?? Date.now() }, ...prev])
  const editTransaction = (tx) => setTransactions(prev => prev.map(t => t.id === tx.id ? tx : t))
  const deleteTransaction = (id) => setTransactions(prev => prev.filter(t => t.id !== id))

  const addNode = (node) => setNodes(prev => [...prev, node])
  const updateNode = (id, patch) => setNodes(prev => prev.map(n => n.id === id ? { ...n, ...patch } : n))
  const removeNode = (id) => setNodes(prev => prev.filter(n => n.id !== id))

  const normalizePercents = (list) => {
    const total = list.reduce((s, i) => s + Math.max(0, i.percent), 0)
    if (total === 0) return list.map(i => ({ ...i, percent: Math.round(100 / list.length) }))
    return list.map(i => ({ ...i, percent: Math.round((Math.max(0, i.percent) / total) * 100) }))
  }

  const totalAllocated = useMemo(() => nodes.reduce((s, n) => s + n.percent, 0), [nodes])

  const ctx = {
    income, setIncome,
    nodes, setNodes, addNode, updateNode, removeNode,
    transactions, addTransaction, editTransaction, deleteTransaction,
    portfolio, setPortfolio,
    loans, setLoans,
    normalizePercents, totalAllocated,
  }

  return (
    <AppContext.Provider value={ctx}>
      <BrowserRouter>
        <AppLayout>
          <RouteErrorBoundary>
            <Suspense fallback={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 12 }}>
                <div style={{ width: 32, height: 1, background: 'var(--border)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: '-100%', width: '100%', height: '100%', background: 'var(--accent)', animation: 'progress-shimmer 1.5s infinite' }} />
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', letterSpacing: '0.1em' }}>INITIALIZING_INTERFACE…</div>
              </div>
            }>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/graph" element={<FinanceGraph />} />
                <Route path="/budget" element={<Budget />} />
                <Route path="/mentors" element={<Mentors />} />
                <Route path="/news" element={<FinNews />} />
                <Route path="/community" element={<Community />} />
                <Route path="/investments" element={<Investments />} />
                <Route path="/loans" element={<Loans />} />
                <Route path="/markets" element={<Markets />} />
                <Route path="/coach" element={<FinCoach />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </RouteErrorBoundary>
        </AppLayout>
      </BrowserRouter>
    </AppContext.Provider>
  )
}