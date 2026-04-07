import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

// ────────────────────────────────────────────────────────────────────────────
// Journey Context — tracks every meaningful action a user takes in Finet
// ────────────────────────────────────────────────────────────────────────────

export const JourneyContext = createContext(null)

const DEFAULT_JOURNEY = {
  // Profile (from FinCoach quiz)
  profile: null,           // { tier, tierInfo, goalText, capitalContext, nextStep, answers }

  // XP + level
  xp: 0,
  level: 1,

  // Feature engagement flags
  seenOnboarding: false,
  visitedPages: [],        // list of route paths visited
  completedActions: [],    // 'added_transaction', 'set_income', 'added_investment', etc.

  // Roadmap progress (from FinCoach)
  roadmapDone: [],         // ids of completed roadmap steps

  // Streak
  lastVisit: null,
  streak: 0,

  // Coach
  coachMinimized: false,
}

const XP_REWARDS = {
  page_visit:          5,
  added_transaction:   15,
  set_income:          20,
  added_investment:    25,
  added_loan:          20,
  added_node:          15,
  roadmap_step:        30,
  read_article:        10,
  booked_mentor:       40,
  joined_challenge:    20,
  completed_quiz:      50,
}

function ls(key, fallback) {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback }
  catch { return fallback }
}

export function JourneyProvider({ children }) {
  const [journey, setJourney] = useState(() => ls('finet:journey', DEFAULT_JOURNEY))

  // Persist on every change
  useEffect(() => {
    localStorage.setItem('finet:journey', JSON.stringify(journey))
  }, [journey])

  // ── Helpers ──────────────────────────────────────────────────────────────
  const gainXP = useCallback((action) => {
    const reward = XP_REWARDS[action] || 0
    if (!reward) return
    setJourney(prev => {
      const newXP = prev.xp + reward
      const newLevel = Math.floor(newXP / 100) + 1
      return { ...prev, xp: newXP, level: newLevel }
    })
  }, [])

  const trackPage = useCallback((path) => {
    setJourney(prev => {
      if (prev.visitedPages.includes(path)) return prev
      const newPages = [...prev.visitedPages, path]
      return { ...prev, visitedPages: newPages }
    })
    gainXP('page_visit')
  }, [gainXP])

  const trackAction = useCallback((action) => {
    setJourney(prev => {
      if (prev.completedActions.includes(action)) return prev
      return { ...prev, completedActions: [...prev.completedActions, action] }
    })
    gainXP(action)
  }, [gainXP])

  const setProfile = useCallback((profile) => {
    setJourney(prev => ({ ...prev, profile }))
    gainXP('completed_quiz')
  }, [gainXP])

  const completeRoadmapStep = useCallback((stepId) => {
    setJourney(prev => {
      if (prev.roadmapDone.includes(stepId)) return prev
      return { ...prev, roadmapDone: [...prev.roadmapDone, stepId] }
    })
    gainXP('roadmap_step')
  }, [gainXP])

  const markOnboardingSeen = useCallback(() => {
    setJourney(prev => ({ ...prev, seenOnboarding: true }))
  }, [])

  const resetJourney = useCallback(() => {
    setJourney(DEFAULT_JOURNEY)
  }, [])

  // Streak calculation
  useEffect(() => {
    const today = new Date().toDateString()
    setJourney(prev => {
      if (prev.lastVisit === today) return prev
      const yesterday = new Date(Date.now() - 86400000).toDateString()
      const newStreak = prev.lastVisit === yesterday ? prev.streak + 1 : 1
      return { ...prev, lastVisit: today, streak: newStreak }
    })
  }, [])

  const xpToNextLevel = 100
  const xpInLevel = (journey?.xp || 0) % xpToNextLevel
  const levelProgress = Math.round((xpInLevel / xpToNextLevel) * 100)

  const value = {
    journey,
    gainXP,
    trackPage,
    trackAction,
    setProfile,
    completeRoadmapStep,
    markOnboardingSeen,
    resetJourney,
    xpInLevel,
    levelProgress,
    xpToNextLevel,
  }

  return <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>
}

export function useJourney() {
  return useContext(JourneyContext)
}
