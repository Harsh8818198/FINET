import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useJourney } from '../../context/JourneyContext'
import { Sparkles, X, Send, ChevronRight } from 'lucide-react'

import api from '../../utils/api'

// ── Page-aware context tips ─────────────────────────────────────────────────
const PAGE_TIPS = {
  '/':            { title: 'Overview',          hint: 'Command centre — see your income, spending, savings, health score and journey XP.' },
  '/graph':       { title: 'Flow Nodes',        hint: 'Visual D3 budget graph. Each node is a money bucket. Drag, resize, and click to log transactions.' },
  '/budget':      { title: 'Allocations',       hint: '50-30-20 rule: Needs 50%, Wants 30%, Invest 20%. Adjust percentages to fit your life.' },
  '/investments': { title: 'Equity Vault',      hint: 'Track your SIPs and stocks. XIRR shows true annualised returns accounting for your SIP timing.' },
  '/loans':       { title: 'Liabilities',       hint: 'Manage all debts. Use debt avalanche: pay minimums on all, attack the highest-rate loan first.' },
  '/mentors':     { title: 'Expert Network',    hint: 'SEBI-registered advisors matched to your goal. One session can save years of costly mistakes.' },
  '/news':        { title: 'Intelligence',      hint: 'Real financial news from NewsAPI & Alpha Vantage. Filter by complexity level.' },
  '/community':   { title: 'Community Hub',     hint: 'Real users sharing real journeys. Post questions — the community answers within hours.' },
  '/coach':       { title: 'AI Coach',          hint: 'Your personalised financial roadmap. Powered by Gemini AI. Complete the quiz to unlock it.' },
}

function SimpleMarkdown({ text }) {
  if (!text) return null
  return (
    <span style={{ lineHeight: 1.7 }}>
      {text.split(/(\*\*.*?\*\*)/g).map((part, i) =>
        part.startsWith('**') && part.endsWith('**')
          ? <strong key={i} style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{part.slice(2, -2)}</strong>
          : part
      )}
    </span>
  )
}

export default function FloatingCoach() {
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [pulse, setPulse] = useState(false)
  const [apiOnline, setApiOnline] = useState(false)
  const chatEndRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { journey, trackAction } = useJourney()

  const tier = journey.profile?.tier
  const pageTip = PAGE_TIPS[location.pathname]

  // Check if API is up
  useEffect(() => {
    api.get('/health')
      .then(r => r.status === 200 && setApiOnline(true))
      .catch(() => setApiOnline(false))
  }, [])

  // Auto-greet when coach opens
  useEffect(() => {
    if (!open || msgs.length > 0) return
    const greeting = journey.profile
      ? `${journey.profile.tierInfo.emoji} Welcome back, **${journey.profile.tierInfo.label}**!\n\nYou're on **${pageTip?.title || 'a new page'}** — ${pageTip?.hint || ''}\n\nAsk me anything, or try: *"What should I do next?"*`
      : `Hi! I'm **Finet Coach** — powered by Gemini AI 🤖\n\nI explain every financial concept, guide you through Finet, and build your personalised plan.\n\nStart by typing a question or open the **AI Coach** page to set up your full profile.`
    setMsgs([{ role: 'coach', content: greeting }])
  }, [open])

  // Pulse when page changes
  useEffect(() => {
    if (!open) { setPulse(true); setTimeout(() => setPulse(false), 3000) }
  }, [location.pathname])

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs, typing])

  const send = useCallback(async (overrideMsg) => {
    const text = (overrideMsg ?? input).trim()
    if (!text) return
    setMsgs(m => [...m, { role: 'user', content: text }])
    setInput('')
    setTyping(true)
    trackAction('used_coach_chat')

    try {
      if (apiOnline) {
        const res = await api.post('/chat', {
          message: text,
          profile: journey.profile || {},
          history: msgs.slice(-6),
        })
        setMsgs(m => [...m, { role: 'coach', content: res.data.reply }])
      } else {
        // Offline fallback
        const lower = text.toLowerCase()
        let reply = `I'm **Finet Coach** — the API server isn't running yet, but I can still help!\n\n`
        if (lower.includes('next') || lower.includes('what should')) {
          reply += journey.profile
            ? `Your next action: **${journey.profile.nextStep}**. ${journey.profile.capitalContext}`
            : 'Complete the AI Coach quiz first so I can build your personalised roadmap!'
        } else if (lower.includes('level') || lower.includes('xp')) {
          reply += `You're **Level ${journey.level}** with **${journey.xp} XP**. Keep exploring and completing milestones!`
        } else if (pageTip && lower.includes('explain')) {
          reply += pageTip.hint
        } else {
          reply += `You asked about: "${text}". Start the Python API server to get full Gemini AI responses. Run: \`cd server && python main.py\``
        }
        setMsgs(m => [...m, { role: 'coach', content: reply }])
      }
    } catch (e) {
      setMsgs(m => [...m, { role: 'coach', content: 'Network error. Make sure the Finet API server is running on port 8000.' }])
    } finally {
      setTyping(false)
    }
  }, [input, msgs, journey, apiOnline, pageTip, trackAction])

  const QUICK = ['What should I do next?', `Explain ${pageTip?.title || 'this page'}`, 'What is a SIP?']

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(s => !s)}
        style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 1000,
          width: 52, height: 52, borderRadius: '50%',
          background: open ? 'var(--accent-indigo)' : 'var(--bg-card)',
          border: `1.5px solid ${open ? 'var(--accent-indigo)' : pulse ? 'rgba(99,102,241,0.6)' : 'var(--border)'}`,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
          boxShadow: open ? '0 0 24px rgba(99,102,241,0.5)' : pulse ? '0 0 20px rgba(99,102,241,0.25)' : '0 4px 20px rgba(0,0,0,0.4)',
        }}
        title="Finet AI Coach"
      >
        {open ? <X size={20} color="#fff" /> : <Sparkles size={20} color={pulse ? '#818cf8' : 'var(--text-primary)'} />}
      </button>
      {pulse && !open && (
        <div style={{ position: 'fixed', bottom: 22, right: 22, zIndex: 999, width: 64, height: 64, borderRadius: '50%', border: '2px solid rgba(99,102,241,0.35)', animation: 'pulse-ring 1.5s ease-out forwards', pointerEvents: 'none' }} />
      )}

      {/* Chat panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 92, right: 28, zIndex: 999,
          width: 380, height: 520, background: 'var(--bg-card)',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16,
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
          animation: 'slideUp 0.3s cubic-bezier(0.16,1,0.3,1)', overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(99,102,241,0.06)' }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={15} color="var(--accent-indigo)" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Finet Coach</div>
              <div style={{ fontSize: '0.65rem', color: apiOnline ? 'var(--green)' : 'var(--yellow)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: apiOnline ? 'var(--green)' : 'var(--yellow)' }} />
                {apiOnline ? `Gemini AI · ${pageTip?.title || 'Active'}` : 'Offline mode'}
              </div>
            </div>
            <button onClick={() => { navigate('/coach'); setOpen(false) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.68rem', color: 'var(--accent-indigo)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
              Full <ChevronRight size={11} />
            </button>
          </div>

          {/* XP bar */}
          <div style={{ padding: '7px 18px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>LVL {journey.level}</span>
            <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
              <div style={{ height: '100%', width: `${journey.xp % 100}%`, background: 'linear-gradient(90deg, var(--accent-indigo), var(--accent-purple))', borderRadius: 2, transition: 'width 0.6s' }} />
            </div>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>{journey.xp % 100}/100 XP</span>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {msgs.map((msg, i) => {
              const isUser = msg.role === 'user'
              return (
                <div key={i} style={{ display: 'flex', gap: 8, justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
                  {!isUser && <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}><Sparkles size={11} color="var(--accent-indigo)" /></div>}
                  <div style={{ maxWidth: '80%', padding: '9px 13px', background: isUser ? 'var(--text-primary)' : 'rgba(255,255,255,0.04)', border: isUser ? 'none' : '1px solid rgba(255,255,255,0.06)', borderRadius: isUser ? '13px 13px 3px 13px' : '3px 13px 13px 13px', color: isUser ? '#000' : 'var(--text-secondary)', fontSize: '0.82rem' }}>
                    {isUser ? msg.content : <SimpleMarkdown text={msg.content} />}
                  </div>
                </div>
              )
            })}
            {typing && (
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Sparkles size={11} color="var(--accent-indigo)" /></div>
                <div style={{ padding: '9px 13px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '3px 13px 13px 13px', display: 'flex', gap: 4, alignItems: 'center' }}>
                  {[0,1,2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--text-muted)', animation: `bounce 1.2s ease-in-out ${i*0.15}s infinite` }} />)}
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick prompts */}
          <div style={{ padding: '6px 12px', display: 'flex', gap: 5, flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            {QUICK.map(q => (
              <button key={q} onClick={() => send(q)}
                style={{ fontSize: '0.66rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', padding: '3px 9px', borderRadius: 20, cursor: 'pointer', color: 'var(--text-muted)', fontFamily: 'var(--font-main)', whiteSpace: 'nowrap' }}>
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding: '9px 12px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8 }}>
            <input className="input" value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask anything about money…"
              style={{ flex: 1, fontSize: '0.82rem', padding: '8px 12px' }} />
            <button onClick={() => send()} style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--accent-indigo)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Send size={13} color="#fff" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
