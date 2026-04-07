import React, { useState, useEffect } from 'react'
import { Newspaper, RefreshCw, ExternalLink, TrendingUp, AlertCircle } from 'lucide-react'
import { FeatureInfoBadge } from '../components/FeatureTips'

import api from '../utils/api'

const CATEGORIES = ['All', 'Stocks', 'Mutual Funds', 'RBI Policy', 'Tax', 'Economy', 'Real Estate', 'Crypto', 'Insurance', 'Global Markets', 'Markets']
const COMPLEXITY = ['All', 'Beginner', 'Intermediate', 'Advanced']

const COMPLEXITY_COLOR = {
  Beginner:     { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', text: 'var(--green)' },
  Intermediate: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', text: 'var(--yellow)' },
  Advanced:     { bg: 'rgba(244,63,94,0.1)',  border: 'rgba(244,63,94,0.3)',  text: 'var(--red)' },
}

const SENTIMENT_COLOR = {
  Bullish:       'var(--green)',
  Somewhat_Bullish: '#86efac',
  Neutral:       'var(--text-muted)',
  Somewhat_Bearish: '#fca5a5',
  Bearish:       'var(--red)',
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d)) return ''
  const diff = Math.floor((Date.now() - d) / 1000)
  if (diff < 60)   return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return d.toLocaleDateString('en-IN')
}

function ArticleCard({ article }) {
  const cpx = COMPLEXITY_COLOR[article.complexity] || COMPLEXITY_COLOR.Intermediate
  return (
    <a href={article.url && article.url !== '#' ? article.url : undefined}
      target="_blank" rel="noopener noreferrer"
      style={{ textDecoration: 'none', display: 'block' }}>
      <div className="card" style={{
        background: 'var(--bg-deep)', padding: '20px 24px', cursor: 'pointer',
        transition: 'all 0.2s',
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none' }}
      >
        {/* Meta row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>
            {article.source?.toUpperCase()}
          </span>
          <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>·</span>
          <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{timeAgo(article.publishedAt)}</span>
          {article.category && (
            <>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>·</span>
              <span style={{ fontSize: '0.62rem', color: 'var(--accent-indigo)', fontWeight: 600 }}>{article.category}</span>
            </>
          )}
          {article.sentiment && (
            <span style={{ fontSize: '0.62rem', color: SENTIMENT_COLOR[article.sentiment] || 'var(--text-muted)', fontWeight: 600, marginLeft: 'auto' }}>
              {article.sentiment.replace(/_/g, ' ')}
            </span>
          )}
          <span style={{ marginLeft: article.sentiment ? 0 : 'auto', fontSize: '0.62rem', padding: '2px 8px', borderRadius: 20, background: cpx.bg, border: `1px solid ${cpx.border}`, color: cpx.text, fontWeight: 600 }}>
            {article.complexity}
          </span>
        </div>

        {/* Title */}
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--text-primary)', lineHeight: 1.45, marginBottom: 8 }}>
          {article.title}
        </h3>

        {/* Description */}
        {article.description && (
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {article.description}
          </p>
        )}

        {article.url && article.url !== '#' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 10, color: 'var(--accent-indigo)', fontSize: '0.75rem', fontWeight: 500 }}>
            <ExternalLink size={12} /> Read article
          </div>
        )}
      </div>
    </a>
  )
}

export default function FinNews() {
  const [articles, setArticles]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
  const [catFilter, setCatFilter]     = useState('All')
  const [cpxFilter, setCpxFilter]     = useState('All')
  const [searchQ, setSearchQ]         = useState('')
  const [lastFetch, setLastFetch]     = useState(null)

  const fetchNews = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/news')
      setArticles(res.data.articles || [])
      setLastFetch(new Date())
    } catch (e) {
      setError(e.message)
      // Hardcoded fallback if server is offline
      setArticles([
        { title: 'Why Index Funds Beat Most Active Funds in India', description: 'Over a 10-year period, 85% of actively managed large-cap funds underperformed their benchmark index. Here\'s why passive wins.', url: '#', source: 'Finet Insights', publishedAt: new Date().toISOString(), category: 'Mutual Funds', complexity: 'Beginner' },
        { title: 'RBI Holds Repo Rate at 6.5% — What This Means for Your EMIs', description: 'The Reserve Bank kept rates unchanged. FD rates remain attractive; home loan EMIs stay stable.', url: '#', source: 'Finet Insights', publishedAt: new Date().toISOString(), category: 'RBI Policy', complexity: 'Intermediate' },
        { title: 'How to Start a ₹500/month SIP: Step by Step', description: 'Starting a SIP doesn\'t require a demat account. Invest directly with ₹500 via Groww or Zerodha Coin.', url: '#', source: 'Finet Insights', publishedAt: new Date().toISOString(), category: 'Mutual Funds', complexity: 'Beginner' },
        { title: 'Understanding Capital Gains Tax on Stocks and MFs', description: 'STCG at 15%, LTCG at 10% above ₹1 lakh — plan your redemptions to minimise tax.', url: '#', source: 'Finet Insights', publishedAt: new Date().toISOString(), category: 'Tax', complexity: 'Intermediate' },
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchNews() }, [])

  const filtered = articles.filter(a => {
    const matchCat = catFilter === 'All' || a.category === catFilter
    const matchCpx = cpxFilter === 'All' || a.complexity === cpxFilter
    const matchQ   = !searchQ || a.title.toLowerCase().includes(searchQ.toLowerCase()) || (a.description || '').toLowerCase().includes(searchQ.toLowerCase())
    return matchCat && matchCpx && matchQ
  })

  return (
    <div className="anim-fade">
      {/* Header */}
      <div style={{ marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 500, letterSpacing: '-0.04em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
            Intelligence Stream
            <FeatureInfoBadge tipKey="intel-stream" />
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Real news from NewsAPI & Alpha Vantage · scraped Moneycontrol · updated every 10 min
          </p>
        </div>
        <button onClick={fetchNews} disabled={loading}
          className="btn btn-secondary"
          style={{ fontSize: '0.78rem', gap: 8, opacity: loading ? 0.5 : 1 }}>
          <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          {loading ? 'Fetching…' : 'Refresh'}
        </button>
      </div>

      {/* API status */}
      {error && (
        <div style={{ padding: '12px 16px', background: 'rgba(244,63,94,0.07)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 8, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.82rem', color: 'var(--red)' }}>
          <AlertCircle size={15} /> API server offline — showing fallback articles. Start the Python server to get live news.
        </div>
      )}

      {/* Search */}
      <input className="input" placeholder="Search articles…" value={searchQ} onChange={e => setSearchQ(e.target.value)}
        style={{ width: '100%', marginBottom: 20, fontSize: '0.85rem', padding: '10px 16px' }} />

      {/* Category chips */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCatFilter(c)}
            style={{ fontSize: '0.72rem', padding: '5px 14px', borderRadius: 20, cursor: 'pointer', fontWeight: 500, fontFamily: 'var(--font-main)', transition: 'all 0.15s', background: catFilter === c ? 'var(--text-primary)' : 'rgba(255,255,255,0.03)', color: catFilter === c ? '#000' : 'var(--text-secondary)', border: catFilter === c ? 'none' : '1px solid rgba(255,255,255,0.08)' }}>
            {c}
          </button>
        ))}
      </div>

      {/* Complexity chips */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
        {COMPLEXITY.map(c => (
          <button key={c} onClick={() => setCpxFilter(c)}
            style={{ fontSize: '0.72rem', padding: '4px 12px', borderRadius: 20, cursor: 'pointer', fontWeight: 600, fontFamily: 'var(--font-main)', transition: 'all 0.15s', background: cpxFilter === c ? (COMPLEXITY_COLOR[c]?.bg || 'rgba(255,255,255,0.06)') : 'transparent', color: cpxFilter === c ? (COMPLEXITY_COLOR[c]?.text || 'var(--text-primary)') : 'var(--text-muted)', border: `1px solid ${cpxFilter === c ? (COMPLEXITY_COLOR[c]?.border || 'rgba(255,255,255,0.15)') : 'rgba(255,255,255,0.07)'}` }}>
            {c}
          </button>
        ))}
      </div>

      {/* Stats row */}
      {!loading && (
        <div style={{ display: 'flex', gap: 16, marginBottom: 24, alignItems: 'center' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{filtered.length} ARTICLES</span>
          {lastFetch && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>· Updated {timeAgo(lastFetch)}</span>}
        </div>
      )}

      {/* Articles grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} style={{ height: 140, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, left: '-100%', width: '100%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)', animation: 'progress-shimmer 1.4s ease-in-out infinite' }} />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          No articles match your filters.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {filtered.map((a, i) => <ArticleCard key={i} article={a} />)}
        </div>
      )}
    </div>
  )
}
