import React, { useState } from 'react'
import { NEWS } from '../data/appData'
import { Newspaper, Flame, Clock, Calendar, ExternalLink, Filter, ChevronUp, ChevronRight, Zap } from 'lucide-react'

const CATEGORIES = ['All', 'Mutual Funds', 'Stocks', 'Tax', 'RBI Policy', 'Crypto', 'Insurance', 'Real Estate']
const COMPLEXITY = ['All', 'beginner', 'intermediate', 'advanced']
const COMPLEXITY_LABELS = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' }
const CAT_COLORS = { 'Mutual Funds': '#8b5cf6', 'Stocks': '#10b981', 'Tax': '#f59e0b', 'RBI Policy': '#22d3ee', 'Crypto': '#f97316', 'Insurance': '#ec4899', 'Real Estate': '#c084fc' }

export default function FinNews() {
    const [catFilter, setCatFilter] = useState('All')
    const [complexFilter, setComplexFilter] = useState('All')
    const [expandedId, setExpandedId] = useState(null)

    const filtered = NEWS.filter(a =>
        (catFilter === 'All' || a.category === catFilter) &&
        (complexFilter === 'All' || a.complexity === complexFilter)
    )

    const hot = NEWS.filter(a => a.hot)

    return (
        <div className="anim-fade">
            <div style={{ marginBottom: 48, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', marginBottom: 6, fontWeight: 500, letterSpacing: '-0.04em' }}>Intelligence Stream</h1>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Curated financial signal processing, adjusted for system complexity.</p>
                </div>
            </div>

            {/* Hot picks */}
            <div style={{ marginBottom: 48 }}>
                <div className="stat-label" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
                    <Flame size={16} color="var(--yellow)" /> HIGH-FREQUENCY SIGNALS
                </div>
                <div className="bento-grid">
                    {hot.map(a => (
                        <div key={a.id}
                            className="bento-card bento-6 card-accent"
                            style={{ cursor: 'pointer', padding: 32 }}
                            onClick={() => setExpandedId(prev => prev === a.id ? null : a.id)}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: CAT_COLORS[a.category] || 'var(--accent)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{a.category}</div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <span style={{ fontSize: '0.65rem', background: 'rgba(250, 204, 21, 0.1)', color: 'var(--yellow)', padding: '2px 8px', borderRadius: 4, fontWeight: 700, letterSpacing: '0.05em' }}>HOT</span>
                                    <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', padding: '2px 8px', borderRadius: 4, fontWeight: 600, textTransform: 'uppercase' }}>{COMPLEXITY_LABELS[a.complexity]}</span>
                                </div>
                            </div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12, lineHeight: 1.4, letterSpacing: '-0.02em' }}>{a.title}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>{a.summary}</div>

                            {expandedId === a.id && (
                                <div className="anim-slide" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 16, marginBottom: 20, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                    {a.full}
                                </div>
                            )}

                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={12} /> {a.time.toUpperCase()}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {a.readTime.toUpperCase()}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><ExternalLink size={12} /> {a.source.toUpperCase()}</span>
                                <span style={{ marginLeft: 'auto', color: 'var(--text-primary)', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'var(--font-main)' }}>{expandedId === a.id ? 'Collapse ↑' : 'Expand ↓'}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Filters */}
            <div className="card" style={{ marginBottom: 32, padding: '24px 32px' }}>
                <div style={{ marginBottom: 24 }}>
                    <div className="stat-label" style={{ marginBottom: 12 }}>CLASSIFICATION FILTER</div>
                    <div className="filter-pills" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {CATEGORIES.map(c => (
                            <button key={c} className={`pill ${catFilter === c ? 'active' : ''}`} style={{ background: catFilter === c ? 'var(--text-primary)' : 'rgba(255,255,255,0.03)', color: catFilter === c ? 'var(--bg-deep)' : 'var(--text-secondary)', border: catFilter === c ? 'none' : '1px solid var(--border)', padding: '6px 16px', borderRadius: 'var(--radius-pill)', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => setCatFilter(c)}>{c}</button>
                        ))}
                    </div>
                </div>
                <div>
                    <div className="stat-label" style={{ marginBottom: 12 }}>SYSTEM COMPLEXITY</div>
                    <div className="filter-pills" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {COMPLEXITY.map(c => (
                            <button key={c} className={`pill ${complexFilter === c ? 'active' : ''}`} style={{ background: complexFilter === c ? 'var(--text-primary)' : 'rgba(255,255,255,0.03)', color: complexFilter === c ? 'var(--bg-deep)' : 'var(--text-secondary)', border: complexFilter === c ? 'none' : '1px solid var(--border)', padding: '6px 16px', borderRadius: 'var(--radius-pill)', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => setComplexFilter(c)}>
                                {c === 'All' ? 'ALL' : COMPLEXITY_LABELS[c].toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Article grid */}
            <div>
                <div className="section-title" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Newspaper size={16} color="var(--text-muted)" /> DATA STREAM ({filtered.length})
                </div>
                {filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 64, color: 'var(--text-muted)', background: 'var(--bg-deep)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                        <Filter size={32} style={{ marginBottom: 16, opacity: 0.3 }} />
                        <div style={{ fontWeight: 500, letterSpacing: '-0.02em', fontSize: '1.1rem' }}>No telemetry matches current filters.</div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {filtered.map(a => (
                            <div key={a.id} className="card" style={{ cursor: 'pointer', padding: 24, transition: 'all 0.2s', background: 'var(--bg-deep)' }} onClick={() => setExpandedId(prev => prev === a.id ? null : a.id)}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 600, color: CAT_COLORS[a.category] || 'var(--accent)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{a.category}</div>
                                    <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', padding: '2px 8px', borderRadius: 4, fontWeight: 600, textTransform: 'uppercase' }}>{COMPLEXITY_LABELS[a.complexity]}</span>
                                </div>
                                <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.01em' }}>{a.title}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>{a.summary}</div>

                                {expandedId === a.id && (
                                    <div className="anim-slide" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 16, marginBottom: 16, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                        {a.full}
                                    </div>
                                )}

                                <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={12} /> {a.time.toUpperCase()}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {a.readTime.toUpperCase()}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><ExternalLink size={12} /> {a.source.toUpperCase()}</span>
                                    <span style={{ marginLeft: 'auto', color: 'var(--text-primary)', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'var(--font-main)' }}>{expandedId === a.id ? 'Collapse ↑' : 'Expand ↓'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
