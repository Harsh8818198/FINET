<div align="center">

<img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
<img src="https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
<img src="https://img.shields.io/badge/D3.js-F9A03C?style=for-the-badge&logo=d3.js&logoColor=white" />
<img src="https://img.shields.io/badge/TradingView_Charts-2962FF?style=for-the-badge&logo=tradingview&logoColor=white" />

# FINET — Financial Intelligence Terminal

**A personal finance command centre built for India's next generation of investors.**

*Award track · College Project · Full-Stack · React + D3*

</div>

---

## Overview

**FINET** is a premium financial management web application designed to democratize personal finance in India. From a teen with ₹5,000 pocket money to a salaried professional managing a growing portfolio — FINET adapts to every user through a cognitive AI coaching engine and professional-grade market visualizations.

The UI is built on the **"Obsidian" design system** — a high-density, monochromatic financial terminal aesthetic inspired by Bloomberg Terminal, Zerodha Kite, and Apple's design language.

---

## ✨ Key Features

### 🤖 AI FinCoach — Cognitive Financial Advisor
- **5-question onboarding quiz** detects the user's financial knowledge tier: Explorer (teen), Starter, Builder, or Strategist
- Generates a **personalized financial roadmap** with phase-wise, actionable milestones (toggle-able checklist)
- **Contextual chat assistant** — answers are calibrated to the user's profile (a teen asking "what is SIP?" gets a different answer than an intermediate investor)
- 100% offline — no external API dependency. Powered by a rule-based cognitive engine (`coachEngine.js`)

### 📊 Market Intelligence — Pro-Grade Live Charts
- **TradingView OHLC Candlestick chart** for Sensex (5-min bars, live-ticking every 3s via `lightweight-charts`)
- **6 live indices** — Sensex, Nifty 50, Bank Nifty, IT, Mid Cap 150, Next 50 — with real-time value fluctuation
- **Top 5 Gainers & Losers** table with volume
- **Sector Heatmap** — 12 sectors color-coded by direction and intensity of change

### 💸 NodeBudget — Visual Finance Graph
- D3.js force-directed graph representing budget allocation as animated nodes (Needs / Wants / Invest)
- Interactive: add custom nodes, drag, resize, and track spending per category
- Real-time progress arcs showing spend vs. budget per node

### 📈 Equity Vault
- Portfolio tracker with ROI calculations and investment breakdown
- Add/edit investments with type (Index Fund, Mid Cap, Direct Equity, etc.)
- Historical return visualization

### 🏦 Liability Manager
- Loan tracking with EMI breakdown, remaining principal, and progress bars
- Total debt overview with interest rate comparisons

### 🧠 Intelligence Stream (FinNews)
- Curated financial articles with complexity filters (Beginner / Intermediate / Advanced)
- Category filters: Mutual Funds, Stocks, Tax, RBI Policy, Crypto, Insurance, Real Estate

### 👥 Expert Neural Net (MentorConnect)
- Browse SEBI-registered mentors and financial coaches
- AI-powered mentor recommendation based on your goal (Stocks, Tax, Retirement, etc.)
- Slot booking modal with confirmation flow

### 🌐 Social Intelligence (Community Hub)
- Community posts with upvote system, tags, and category filters
- Active financial challenges with participation tracking
- Achievement badges for financial milestones

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 18 + Vite 5 |
| Routing | React Router v6 |
| State Management | React Context API |
| Visualizations | D3.js v7, TradingView `lightweight-charts` v5 |
| Icons | `lucide-react` |
| Persistence | `localStorage` |
| Fonts | Inter, JetBrains Mono (Google Fonts) |
| Styling | Vanilla CSS with custom design token system |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm v9+

### Installation

```bash
# Clone the repository
git clone https://github.com/Harsh8818198/FINET.git
cd FINET

# Install client dependencies
cd client
npm install

# Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📁 Project Structure

```
FINET/
└── client/
    ├── public/
    └── src/
        ├── components/
        │   ├── charts/         # TradingView candlestick chart
        │   ├── graph/          # D3 force-node graph
        │   └── ...             # Shared UI components
        ├── data/
        │   └── appData.jsx     # Mock data (mentors, news, community)
        ├── hooks/
        │   └── useMarketData.jsx
        ├── layout/
        │   ├── Sidebar.jsx
        │   └── Topbar.jsx
        ├── pages/
        │   ├── Dashboard.jsx
        │   ├── FinCoach.jsx    # AI coaching page
        │   ├── Markets.jsx     # Live market intelligence
        │   ├── Investments.jsx
        │   ├── Loans.jsx
        │   ├── Budget.jsx
        │   ├── FinNews.jsx
        │   ├── Mentors.jsx
        │   └── Community.jsx
        ├── styles/
        │   └── globals.css     # Obsidian design system
        └── utils/
            └── coachEngine.js  # Cognitive AI profile engine
```

---

## 🎨 Design System — "Obsidian"

FINET uses a custom CSS variable-based design token system:

| Token | Value | Usage |
|---|---|---|
| `--bg-deep` | `#000000` | Page background |
| `--bg-card` | `#0a0a0a` | Card surfaces |
| `--accent-indigo` | `#6366f1` | Primary accent, CTA |
| `--font-main` | `Inter` | All UI text |
| `--font-mono` | `JetBrains Mono` | Data, prices, tickers |

---

## 🔮 Roadmap

- [ ] Gemini API integration for live AI chat responses
- [ ] Real NSE/BSE data via free public APIs
- [ ] User authentication (Supabase or Firebase)
- [ ] SIP calculator and goal-based investment planner
- [ ] PWA support for mobile

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
  Built with ☕ and a financial terminal aesthetic.
</div>
