import React, { useState, useRef, useEffect } from 'react'
import { buildProfile, getCoachResponse } from '../utils/coachEngine'
import { Sparkles, ArrowRight, CheckCircle2, Circle, Send, ChevronDown, RotateCcw, Bot, User } from 'lucide-react'

// ─── QUIZ CONFIG ────────────────────────────────────────────────────────────
const QUIZ = [
    {
        id: 'age', question: "First — how old are you?",
        subtext: "We tailor everything to your stage of life.",
        type: 'number', placeholder: 'e.g. 19', unit: 'years old'
    },
    {
        id: 'capital', question: "How much capital do you have right now?",
        subtext: "This could be savings, pocket money — whatever you can allocate.",
        type: 'number', placeholder: 'e.g. 5000', unit: '₹ available'
    },
    {
        id: 'income', question: "What's your monthly income or allowance?",
        subtext: "Approximate is fine. Type 0 if you're still a student.",
        type: 'number', placeholder: 'e.g. 20000', unit: '₹ / month'
    },
    {
        id: 'experience', question: "What's your investing experience?",
        subtext: "Be honest — this helps us give the right advice.",
        type: 'choice', options: [
            { value: 'never', label: 'Never invested', sub: 'I\'m completely new' },
            { value: 'heard', label: 'Heard about it', sub: 'Know the terms, never acted' },
            { value: 'sip', label: 'Have a SIP', sub: 'Running 1–2 mutual funds' },
            { value: 'some', label: 'Some portfolio', sub: 'Stocks, MFs, maybe more' },
            { value: 'advanced', label: 'Active investor', sub: 'Tracks markets regularly' },
        ]
    },
    {
        id: 'goal', question: "What's your primary money goal?",
        subtext: "We'll design your entire roadmap around this.",
        type: 'choice', options: [
            { value: 'grow', label: 'Grow my money', sub: 'Make it multiply over time' },
            { value: 'save', label: 'Build savings', sub: 'Create a financial safety net' },
            { value: 'invest', label: 'Start investing', sub: 'Put money in the right places' },
            { value: 'debt', label: 'Get out of debt', sub: 'Clear loans while building wealth' },
            { value: 'retire', label: 'Plan for the future', sub: 'Long-term wealth creation' },
        ]
    },
]

// ─── MARKDOWN RENDERER ───────────────────────────────────────────────────────
function SimpleMarkdown({ text }) {
    const parts = text.split(/(\*\*.*?\*\*)/g)
    return (
        <span>
            {parts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={i} style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{part.slice(2, -2)}</strong>
                }
                return part
            })}
        </span>
    )
}

// ─── ROADMAP CARD ───────────────────────────────────────────────────────────
function RoadmapCard({ step, index, onToggle }) {
    const [expanded, setExpanded] = useState(index === 0)
    return (
        <div style={{
            border: `1px solid ${step.done ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.07)'}`,
            borderRadius: 'var(--radius-sm)', background: step.done ? 'rgba(16,185,129,0.04)' : 'rgba(255,255,255,0.02)',
            transition: 'all 0.25s',
        }}>
            <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}
                onClick={() => setExpanded(e => !e)}>
                <button
                    onClick={e => { e.stopPropagation(); onToggle(step.id) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0, color: step.done ? 'var(--green)' : 'var(--text-muted)', transition: 'color 0.2s' }}
                >
                    {step.done ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                </button>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>Phase: {step.phase}</span>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', letterSpacing: '-0.01em', color: step.done ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: step.done ? 'line-through' : 'none' }}>{step.title}</div>
                </div>
                <ChevronDown size={16} color="var(--text-muted)" style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
            </div>
            {expanded && (
                <div className="anim-slide" style={{ padding: '0 24px 20px 60px' }}>
                    <p style={{ fontSize: '0.87rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 14 }}>{step.desc}</p>
                    <div style={{ padding: '12px 16px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', color: 'var(--accent-indigo)', fontWeight: 500 }}>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Action Item</span>
                        {step.action}
                    </div>
                </div>
            )}
        </div>
    )
}

// ─── CHAT BUBBLE ─────────────────────────────────────────────────────────────
function ChatBubble({ msg }) {
    const isUser = msg.role === 'user'
    return (
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
            {!isUser && (
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bot size={16} color="var(--accent-indigo)" />
                </div>
            )}
            <div style={{
                maxWidth: '75%', padding: '14px 18px',
                background: isUser ? 'var(--text-primary)' : 'rgba(255,255,255,0.04)',
                border: isUser ? 'none' : '1px solid rgba(255,255,255,0.07)',
                borderRadius: isUser ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
                color: isUser ? '#000' : 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.65,
            }}>
                {isUser ? msg.content : <SimpleMarkdown text={msg.content} />}
            </div>
            {isUser && (
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <User size={14} color="var(--text-primary)" />
                </div>
            )}
        </div>
    )
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────
export default function FinCoach() {
    const [step, setStep] = useState(0)              // quiz step
    const [answers, setAnswers] = useState({})
    const [currentVal, setCurrentVal] = useState('')
    const [profile, setProfile] = useState(null)
    const [roadmap, setRoadmap] = useState([])
    const [msgs, setMsgs] = useState([])
    const [chatInput, setChatInput] = useState('')
    const [typing, setTyping] = useState(false)
    const chatEndRef = useRef(null)
    const inputRef = useRef(null)

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

    const currentQ = QUIZ[step]
    const isLastQ = step === QUIZ.length - 1

    // Submit quiz step
    const handleNext = () => {
        if (!currentVal && currentQ.type === 'number') return
        const newAnswers = { ...answers, [currentQ.id]: currentVal }
        setAnswers(newAnswers)
        setCurrentVal('')

        if (isLastQ) {
            const p = buildProfile(newAnswers)
            setProfile(p)
            setRoadmap(p.roadmap.map(r => ({ ...r })))
            setMsgs([{
                role: 'coach', content:
                    `${p.tierInfo.emoji} **Welcome, ${p.tierInfo.label}.** I've analyzed your profile.\n\n${p.capitalContext}\n\nYour mission: **${p.goalText}**.\n\nI've built a personalized roadmap below — start with Step 1. Ask me anything, anytime.`
            }])
        } else {
            setStep(s => s + 1)
        }
    }

    const handleChoice = (val) => {
        setCurrentVal(val)
        setTimeout(() => {
            const newAnswers = { ...answers, [currentQ.id]: val }
            setAnswers(newAnswers)
            setCurrentVal('')
            if (isLastQ) {
                const p = buildProfile(newAnswers)
                setProfile(p)
                setRoadmap(p.roadmap.map(r => ({ ...r })))
                setMsgs([{
                    role: 'coach', content:
                        `${p.tierInfo.emoji} **Welcome, ${p.tierInfo.label}.** I've analyzed your profile.\n\n${p.capitalContext}\n\nYour mission: **${p.goalText}**.\n\nI've built a personalized roadmap below — start with Step 1. Ask me anything, anytime.`
                }])
            } else {
                setStep(s => s + 1)
            }
        }, 180)
    }

    const sendMessage = () => {
        if (!chatInput.trim()) return
        const userMsg = { role: 'user', content: chatInput }
        setMsgs(m => [...m, userMsg])
        setChatInput('')
        setTyping(true)
        setTimeout(() => {
            const response = getCoachResponse(chatInput, profile)
            setMsgs(m => [...m, { role: 'coach', content: response }])
            setTyping(false)
        }, 600 + Math.random() * 400)
    }

    const toggleDone = (id) => {
        setRoadmap(r => r.map(step => step.id === id ? { ...step, done: !step.done } : step))
    }

    const reset = () => {
        setStep(0); setAnswers({}); setCurrentVal(''); setProfile(null); setRoadmap([]); setMsgs([])
    }

    const done = roadmap.filter(r => r.done).length

    // ── QUIZ VIEW ──
    if (!profile) {
        const progress = (step / QUIZ.length) * 100
        return (
            <div className="anim-fade" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '100%', maxWidth: 560 }}>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: 48 }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 20, padding: '6px 16px', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 40, background: 'rgba(99,102,241,0.08)' }}>
                            <Sparkles size={14} color="var(--accent-indigo)" />
                            <span style={{ fontSize: '0.75rem', color: 'var(--accent-indigo)', fontWeight: 600, letterSpacing: '0.05em' }}>AI FINANCIAL COACH</span>
                        </div>
                        <h1 style={{ fontSize: '2.2rem', fontWeight: 500, letterSpacing: '-0.04em', marginBottom: 10 }}>Let's build your money plan.</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>5 quick questions. A lifetime of clarity.</p>
                    </div>

                    {/* Progress */}
                    <div style={{ height: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 2, marginBottom: 48, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${progress}%`, background: 'var(--accent-indigo)', transition: 'width 0.4s cubic-bezier(0.16,1,0.3,1)', boxShadow: '0 0 12px rgba(99,102,241,0.5)' }} />
                    </div>

                    {/* Question */}
                    <div className="card" style={{ padding: '40px', background: 'var(--bg-card)' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 16, fontWeight: 600 }}>
                            QUESTION {step + 1} OF {QUIZ.length}
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 500, letterSpacing: '-0.03em', marginBottom: 8, lineHeight: 1.3 }}>{currentQ.question}</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 32 }}>{currentQ.subtext}</p>

                        {currentQ.type === 'number' && (
                            <div style={{ display: 'flex', gap: 12 }}>
                                <div style={{ flex: 1, position: 'relative' }}>
                                    <input
                                        autoFocus
                                        type="number"
                                        className="input"
                                        placeholder={currentQ.placeholder}
                                        value={currentVal}
                                        onChange={e => setCurrentVal(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleNext()}
                                        style={{ fontSize: '1.1rem', padding: '16px 20px', height: 'auto' }}
                                    />
                                    <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{currentQ.unit}</span>
                                </div>
                                <button className="btn btn-primary" onClick={handleNext} style={{ padding: '14px 24px', fontSize: '0.9rem' }}>
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                        )}

                        {currentQ.type === 'choice' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {currentQ.options.map(opt => (
                                    <button key={opt.value} onClick={() => handleChoice(opt.value)}
                                        style={{
                                            background: currentVal === opt.value ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.02)',
                                            border: `1px solid ${currentVal === opt.value ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.07)'}`,
                                            borderRadius: 'var(--radius-sm)', padding: '16px 20px', cursor: 'pointer',
                                            textAlign: 'left', transition: 'all 0.18s',
                                        }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 2 }}>{opt.label}</div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{opt.sub}</div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    // ── COACH VIEW ──
    return (
        <div className="anim-fade">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48 }}>
                <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 12, padding: '4px 12px', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 40, background: 'rgba(99,102,241,0.08)' }}>
                        <Sparkles size={12} color="var(--accent-indigo)" />
                        <span style={{ fontSize: '0.7rem', color: 'var(--accent-indigo)', fontWeight: 600, letterSpacing: '0.05em' }}>{profile.tierInfo.emoji} {profile.tierInfo.label.toUpperCase()}</span>
                    </div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 500, letterSpacing: '-0.04em', marginBottom: 6 }}>Your Financial Roadmap</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{profile.goalText.charAt(0).toUpperCase() + profile.goalText.slice(1)} — personalized for your profile.</p>
                </div>
                <button className="btn btn-secondary" onClick={reset} style={{ fontSize: '0.75rem', gap: 8 }}>
                    <RotateCcw size={14} /> Reset Profile
                </button>
            </div>

            {/* Progress bar */}
            <div style={{ marginBottom: 40 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>MILESTONES COMPLETED</span>
                    <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontWeight: 600 }}>{done} / {roadmap.length}</span>
                </div>
                <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(done / roadmap.length) * 100}%`, background: 'linear-gradient(to right, var(--accent-indigo), var(--accent-purple))', transition: 'width 0.4s', borderRadius: 4 }} />
                </div>
            </div>

            {/* Two-column layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 24 }}>

                {/* Left: Roadmap */}
                <div>
                    <div className="section-title" style={{ marginBottom: 16 }}>Action Roadmap</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {roadmap.map((step, i) => (
                            <RoadmapCard key={step.id} step={step} index={i} onToggle={toggleDone} />
                        ))}
                    </div>
                </div>

                {/* Right: Chat */}
                <div style={{ position: 'sticky', top: 24, height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                    {/* Chat header */}
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Bot size={18} color="var(--accent-indigo)" />
                        </div>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem', letterSpacing: '-0.01em' }}>Finet Coach</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }} />
                                Online · Personalised to your profile
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {msgs.map((msg, i) => <ChatBubble key={i} msg={msg} />)}
                        {typing && (
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Bot size={16} color="var(--accent-indigo)" />
                                </div>
                                <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '4px 16px 16px 16px', display: 'flex', gap: 6, alignItems: 'center' }}>
                                    {[0, 1, 2].map(i => (
                                        <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)', animation: `bounce 1.2s ease-in-out ${i * 0.15}s infinite` }} />
                                    ))}
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Quick prompts */}
                    <div style={{ padding: '8px 16px', display: 'flex', gap: 6, flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        {['What is a SIP?', 'How to start investing?', 'Is crypto safe?'].map(q => (
                            <button key={q} onClick={() => { setChatInput(q); setTimeout(() => { const e = new KeyboardEvent('keydown', { key: 'Enter' }); inputRef.current?.dispatchEvent(e) }, 0) }}
                                style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '4px 10px', borderRadius: 20, cursor: 'pointer', color: 'var(--text-secondary)', transition: 'all 0.15s', fontFamily: 'var(--font-main)', whiteSpace: 'nowrap' }}>
                                {q}
                            </button>
                        ))}
                    </div>

                    {/* Input */}
                    <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 10 }}>
                        <input
                            ref={inputRef}
                            className="input"
                            value={chatInput}
                            onChange={e => setChatInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && sendMessage()}
                            placeholder="Ask anything about money..."
                            style={{ flex: 1, fontSize: '0.85rem', padding: '10px 14px' }}
                        />
                        <button onClick={sendMessage} style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: 'var(--accent-indigo)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', flexShrink: 0 }}>
                            <Send size={16} color="#fff" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
