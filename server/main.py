# ─── Finet Python API Server ──────────────────────────────────────────────────
# Endpoints:
#   GET  /api/news          — real financial news (NewsAPI + Alpha Vantage + BS4)
#   POST /api/chat          — Gemini AI coaching (gemini-2.0-flash)
#   GET  /api/market-pulse  — quick index data from Alpha Vantage
# ─────────────────────────────────────────────────────────────────────────────

import os
import re
import json
import time
import requests
from datetime import datetime, timedelta
from bs4 import BeautifulSoup
import google.generativeai as genai
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from auth import create_access_token, verify_password, get_password_hash, decode_access_token
from models import Base, User, BudgetNode, Transaction, PortfolioItem, Loan

load_dotenv()

# ─── Database ──────────────────────────────────────────────────────────────────
SQLALCHEMY_DATABASE_URL = "sqlite:///./finet.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

app = FastAPI(title="Finet API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── API Keys (from .env) ─────────────────────────────────────────────────────
NEWS_API_KEY      = os.getenv("NEWS_API_KEY", "")
ALPHA_VANTAGE_KEY = os.getenv("ALPHA_VANTAGE_KEY", "")
GEMINI_API_KEY    = os.getenv("GEMINI_API_KEY", "")

# Configure Gemini
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# ─── Simple in-memory cache ───────────────────────────────────────────────────
_cache = {}

def cached(key: str, ttl_secs: int, fn):
    now = time.time()
    if key in _cache and now - _cache[key]["ts"] < ttl_secs:
        return _cache[key]["data"]
    result = fn()
    _cache[key] = {"ts": now, "data": result}
    return result

# ─────────────────────────────────────────────────────────────────────────────
#  NEWS ENDPOINT
# ─────────────────────────────────────────────────────────────────────────────

MONEYCONTROL_URL = "https://www.moneycontrol.com/news/business/markets/"

def scrape_moneycontrol():
    """Scrape Moneycontrol Markets news via BS4."""
    articles = []
    try:
        resp = requests.get(
            MONEYCONTROL_URL,
            headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"},
            timeout=8
        )
        soup = BeautifulSoup(resp.text, "html.parser")
        for item in soup.select("li.clearfix")[:12]:
            a = item.find("a")
            if not a:
                continue
            h2 = item.find("h2")
            p  = item.find("p")
            articles.append({
                "title":       h2.get_text(strip=True) if h2 else a.get_text(strip=True),
                "description": p.get_text(strip=True) if p else "",
                "url":         a.get("href", ""),
                "source":      "Moneycontrol",
                "publishedAt": datetime.utcnow().isoformat(),
                "category":    "Markets",
                "complexity":  "Intermediate",
            })
    except Exception as e:
        print(f"[BS4 scrape] error: {e}")
    return articles

def fetch_newsapi(query="Indian stock market mutual fund investment"):
    """Fetch from NewsAPI."""
    if not NEWS_API_KEY:
        return []
    try:
        from_date = (datetime.utcnow() - timedelta(days=3)).strftime("%Y-%m-%d")
        resp = requests.get(
            "https://newsapi.org/v2/everything",
            params={
                "q": query,
                "language": "en",
                "sortBy": "publishedAt",
                "from": from_date,
                "pageSize": 20,
                "apiKey": NEWS_API_KEY,
            },
            timeout=8
        )
        data = resp.json()
        articles = []
        for a in data.get("articles", []):
            if not a.get("title") or a["title"] == "[Removed]":
                continue
            articles.append({
                "title":       a["title"],
                "description": a.get("description") or "",
                "url":         a.get("url", ""),
                "source":      a.get("source", {}).get("name", "NewsAPI"),
                "publishedAt": a.get("publishedAt", ""),
                "category":    classify_article(a["title"]),
                "complexity":  complexity_level(a.get("description", "")),
            })
        return articles
    except Exception as e:
        print(f"[NewsAPI] error: {e}")
        return []

def fetch_alpha_vantage_news():
    """Fetch news sentiment from Alpha Vantage."""
    if not ALPHA_VANTAGE_KEY:
        return []
    try:
        resp = requests.get(
            "https://www.alphavantage.co/query",
            params={
                "function": "NEWS_SENTIMENT",
                "topics": "earnings,ipo,mergers_and_acquisitions,economy_macro",
                "sort": "LATEST",
                "limit": 15,
                "apikey": ALPHA_VANTAGE_KEY,
            },
            timeout=10
        )
        data = resp.json()
        articles = []
        for item in data.get("feed", []):
            articles.append({
                "title":       item.get("title", ""),
                "description": item.get("summary", ""),
                "url":         item.get("url", ""),
                "source":      item.get("source", "Alpha Vantage"),
                "publishedAt": item.get("time_published", ""),
                "sentiment":   item.get("overall_sentiment_label", "Neutral"),
                "category":    "Global Markets",
                "complexity":  "Advanced",
            })
        return articles
    except Exception as e:
        print(f"[AlphaVantage] error: {e}")
        return []

KEYWORDS_MAP = {
    "mutual fund":    "Mutual Funds",
    "sip":            "Mutual Funds",
    "nifty":          "Stocks",
    "sensex":         "Stocks",
    "ipo":            "Stocks",
    "rbi":            "RBI Policy",
    "interest rate":  "RBI Policy",
    "inflation":      "Economy",
    "gdp":            "Economy",
    "real estate":    "Real Estate",
    "tax":            "Tax",
    "income tax":     "Tax",
    "crypto":         "Crypto",
    "bitcoin":        "Crypto",
    "insurance":      "Insurance",
}

def classify_article(title: str) -> str:
    t = title.lower()
    for kw, cat in KEYWORDS_MAP.items():
        if kw in t:
            return cat
    return "Markets"

def complexity_level(desc: str) -> str:
    desc = desc.lower()
    if any(w in desc for w in ["derivative", "yield curve", "quantitative", "arbitrage", "futures", "options", "hedge"]):
        return "Advanced"
    if any(w in desc for w in ["portfolio", "nifty", "sensex", "equity", "sip", "mutual fund", "emi"]):
        return "Intermediate"
    return "Beginner"

FALLBACK_NEWS = [
    {"title": "Why Index Funds Beat Most Active Funds in India", "description": "Over a 10-year period, over 85% of actively managed large-cap funds underperformed their benchmark index. Here's why passive investing wins.", "url": "#", "source": "Finet Insights", "publishedAt": datetime.utcnow().isoformat(), "category": "Mutual Funds", "complexity": "Beginner"},
    {"title": "RBI Holds Repo Rate at 6.5% — What This Means for Your EMIs", "description": "The Reserve Bank of India kept rates unchanged. Fixed deposit rates remain attractive, and home loan EMIs stay stable for now.", "url": "#", "source": "Finet Insights", "publishedAt": datetime.utcnow().isoformat(), "category": "RBI Policy", "complexity": "Intermediate"},
    {"title": "How to Start a ₹500/month SIP: Step by Step", "description": "Starting a SIP doesn't require a demat account. You can invest in a mutual fund directly with ₹500 through Groww or Zerodha Coin.", "url": "#", "source": "Finet Insights", "publishedAt": datetime.utcnow().isoformat(), "category": "Mutual Funds", "complexity": "Beginner"},
    {"title": "Understanding Capital Gains Tax on Stocks and Mutual Funds", "description": "STCG at 15%, LTCG at 10% above ₹1 lakh — learn how to plan your redemptions to minimise tax outgo.", "url": "#", "source": "Finet Insights", "publishedAt": datetime.utcnow().isoformat(), "category": "Tax", "complexity": "Intermediate"},
    {"title": "What is a Debt Fund and Why Should You Use One?", "description": "Debt funds invest in bonds and government securities. They're ideal for your emergency fund and short-term parking of money.", "url": "#", "source": "Finet Insights", "publishedAt": datetime.utcnow().isoformat(), "category": "Mutual Funds", "complexity": "Beginner"},
    {"title": "Sensex Hits 75,000: What's Driving the Bull Run?", "description": "FII inflows, strong quarterly earnings, and a stable rupee are among the key factors fuelling the current market rally.", "url": "#", "source": "Finet Insights", "publishedAt": datetime.utcnow().isoformat(), "category": "Stocks", "complexity": "Intermediate"},
]

@app.get("/api/news")
def get_news():
    def _fetch_all():
        results = []

        # 1. NewsAPI (most reliable)
        results.extend(fetch_newsapi())

        # 2. Alpha Vantage (global sentiment)
        if ALPHA_VANTAGE_KEY:
            results.extend(fetch_alpha_vantage_news())

        # 3. BS4 scrape Moneycontrol
        scraped = scrape_moneycontrol()
        results.extend(scraped)

        # Deduplicate by title
        seen = set()
        unique = []
        for a in results:
            key = a["title"][:60]
            if key not in seen:
                seen.add(key)
                unique.append(a)

        return unique if unique else FALLBACK_NEWS

    articles = cached("news", 600, _fetch_all)  # cache 10 min
    return {"articles": articles, "count": len(articles), "cached": True}


# ─────────────────────────────────────────────────────────────────────────────
#  AI CHAT ENDPOINT (Gemini)
# ─────────────────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    profile: dict = {}
    history: list = []

SYSTEM_PROMPT = """You are Finet Coach — an expert, empathetic AI financial advisor for Indian users.
Your role: teach personal finance concepts clearly, give actionable advice tailored to the user's profile, and help them grow their money intelligently.

Rules:
- Always answer in the context of INDIAN finance (INR, SEBI, NSE/BSE, RBI, Indian tax laws)
- If user is a beginner/teen: use simple language, avoid jargon, use relatable examples (chai, cricket, Swiggy)
- If user is advanced: be precise, mention specific funds, ratios, strategies
- Always give at least one concrete next action
- Be encouraging but honest about risks
- Keep responses concise (under 200 words) unless explaining a complex concept
- Never give specific stock picks. Recommend index funds for beginners.
- Format with **bold** for key terms

User profile context will be provided. Adapt your tone and depth accordingly."""

@app.post("/api/chat")
def chat(req: ChatRequest, current_user: User = Depends(get_current_user)):
    if not GEMINI_API_KEY:
        from coach_fallback import get_fallback_response
        return {"reply": get_fallback_response(req.message, req.profile)}

    try:
        # Improved model naming and parameter handling
        model = genai.GenerativeModel(
            model_name="models/gemini-2.0-flash", 
            system_instruction=SYSTEM_PROMPT,
        )

        profile_ctx = ""
        if req.profile:
            tier  = req.profile.get("tier", "BEGINNER")
            goal  = req.profile.get("goalText", "grow money")
            cap   = req.profile.get("answers", {}).get("capital", "unknown")
            age   = req.profile.get("answers", {}).get("age", "unknown")
            profile_ctx = f"\n[USER PROFILE: Age={age}, Capital=₹{cap}, Tier={tier}, Goal={goal}]\n"

        history = []
        for msg in req.history[-6:]:
            history.append({
                "role": "user" if msg["role"] == "user" else "model",
                "parts": [msg["content"]]
            })

        # Test if model is responsive
        try:
            chat_session = model.start_chat(history=history)
            response = chat_session.send_message(profile_ctx + req.message)
            return {"reply": response.text}
        except Exception as api_err:
            print(f"[Gemini API Call] error: {api_err}")
            # Fallback if specific model fails
            return {"reply": "I'm having trouble connecting to my brain right now. Please try again or check your API key."}

    except Exception as e:
        print(f"[Gemini Structure] error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ─── AUTH ENDPOINTS ─────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    phone: str
    password: str
    full_name: str = ""

class LoginRequest(BaseModel):
    phone: str
    password: str

@app.post("/api/auth/register")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.phone == req.phone).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Phone number already registered")
    
    hashed_pass = get_password_hash(req.password)
    new_user = User(phone=req.phone, hashed_password=hashed_pass, full_name=req.full_name)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = create_access_token(data={"sub": str(new_user.id)})
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": {"id": new_user.id, "phone": new_user.phone, "full_name": new_user.full_name}
    }

@app.post("/api/auth/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone == req.phone).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid phone or password")
    
    access_token = create_access_token(data={"sub": str(user.id)})
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": {"id": user.id, "phone": user.phone, "full_name": user.full_name}
    }

@app.get("/api/auth/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id, 
        "phone": current_user.phone, 
        "full_name": current_user.full_name,
        "email": current_user.email
    }


# ─── DATA ENDPOINTS ─────────────────────────────────────────────────────────────

@app.get("/api/user/data")
def get_user_data(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    nodes = db.query(BudgetNode).filter(BudgetNode.user_id == current_user.id).all()
    txs = db.query(Transaction).filter(Transaction.user_id == current_user.id).all()
    portfolio = db.query(PortfolioItem).filter(PortfolioItem.user_id == current_user.id).all()
    
    return {
        "nodes": nodes,
        "transactions": txs,
        "portfolio": portfolio
    }

@app.post("/api/user/transaction")
def add_transaction(req: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    amount = float(req.get("amount", 0))
    category = req.get("category")
    
    new_tx = Transaction(
        user_id=current_user.id,
        title=req.get("title"),
        amount=amount,
        category=category,
        date=datetime.utcnow(),
        note=req.get("note")
    )
    db.add(new_tx)
    
    # Update node spent
    node = db.query(BudgetNode).filter(BudgetNode.user_id == current_user.id, BudgetNode.name == category).first()
    if node:
        node.spent += amount
    
    db.commit()
    return {"status": "ok"}

@app.post("/api/user/portfolio")
def add_portfolio_item(req: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_item = PortfolioItem(
        user_id=current_user.id,
        name=req.get("name"),
        type=req.get("type"),
        invested=float(req.get("invested", 0)),
        current_value=float(req.get("current_value", 0)),
        roi=0.0,
        color=req.get("color", "#6366f1")
    )
    # Calculate initial ROI
    if new_item.invested > 0:
        new_item.roi = ((new_item.current_value - new_item.invested) / new_item.invested) * 100
        
    db.add(new_item)
    db.commit()
    return {"status": "ok"}

@app.post("/api/user/loans")
def add_loan(req: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_loan = Loan(
        user_id=current_user.id,
        name=req.get("name"),
        bank=req.get("bank"),
        principal=float(req.get("principal", 0)),
        remaining=float(req.get("remaining", 0)),
        interest_rate=float(req.get("interest_rate", 0)),
        tenure_months=int(req.get("tenure_months", 0)),
        emi=float(req.get("emi", 0))
    )
    db.add(new_loan)
    db.commit()
    return {"status": "ok"}

@app.post("/api/user/nodes")
def add_budget_node(req: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_node = BudgetNode(
        user_id=current_user.id,
        name=req.get("name"),
        percent=float(req.get("percent", 0)),
        color=req.get("color", "#6366f1"),
        spent=0.0
    )
    db.add(new_node)
    db.commit()
    return {"status": "ok"}


# ─────────────────────────────────────────────────────────────────────────────
#  MARKET PULSE (Alpha Vantage — quick index quote)
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/api/market-pulse")
def get_market_pulse():
    if not ALPHA_VANTAGE_KEY:
        return {"error": "No Alpha Vantage key configured", "data": []}

    symbols = ["^BSESN", "^NSEI"]  # Sensex, Nifty
    results = []

    def _fetch():
        for sym in symbols:
            try:
                resp = requests.get(
                    "https://www.alphavantage.co/query",
                    params={"function": "GLOBAL_QUOTE", "symbol": sym, "apikey": ALPHA_VANTAGE_KEY},
                    timeout=8
                )
                data = resp.json().get("Global Quote", {})
                if data:
                    results.append({
                        "symbol":  sym,
                        "price":   float(data.get("05. price", 0)),
                        "change":  float(data.get("09. change", 0)),
                        "pct":     float(data.get("10. change percent", "0%").replace("%", "")),
                    })
            except Exception as e:
                print(f"[AV market] {sym}: {e}")
        return results

    data = cached("market_pulse", 300, _fetch)
    return {"data": data}


@app.get("/health")
def health():
    return {
        "status": "ok",
        "gemini": bool(GEMINI_API_KEY),
        "newsapi": bool(NEWS_API_KEY),
        "alphavantage": bool(ALPHA_VANTAGE_KEY),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
