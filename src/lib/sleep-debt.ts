import { SleepDebt, SleepSession, EnergySettings } from '@/types/energy'
import {
  addDays,
  subDays,
  differenceInHours,
  startOfDay,
  endOfDay as _endOfDay,
} from 'date-fns'

const _STORAGE_KEY = 'cyrcdian_sleep_debt'
const SESSIONS_KEY = 'cyrcdian_sleep_sessions'
const DEFAULT_OPTIMAL_SLEEP = 8 // hours

/**
 * Calculate current sleep debt based on recent sleep sessions
 */
export function calculateSleepDebt(
  sessions: SleepSession[],
  settings: Partial<EnergySettings> = {}
): SleepDebt {
  const optimalSleepHours =
    settings.optimalSleepDuration || DEFAULT_OPTIMAL_SLEEP
  const today = startOfDay(new Date())
  const sevenDaysAgo = subDays(today, 7)

  // Filter sessions from last 7 days
  const recentSessions = sessions.filter(
    session => session.date >= sevenDaysAgo && session.date <= today
  )

  let totalDebt = 0
  let dailyDeficit = 0
  const weeklyDeficits: number[] = []

  // Calculate debt for each day
  for (let i = 0; i < 7; i++) {
    const date = addDays(sevenDaysAgo, i)
    const daySession = recentSessions.find(
      session =>
        startOfDay(session.date).getTime() === startOfDay(date).getTime()
    )

    let dayDeficit: number
    if (daySession) {
      dayDeficit = Math.max(0, optimalSleepHours - daySession.actualSleepHours)
    } else {
      // No data available, assume full deficit
      dayDeficit = optimalSleepHours
    }

    totalDebt += dayDeficit
    weeklyDeficits.push(dayDeficit)

    // Today's deficit
    if (startOfDay(date).getTime() === startOfDay(today).getTime()) {
      dailyDeficit = dayDeficit
    }
  }

  const weeklyAverage =
    weeklyDeficits.reduce((sum, deficit) => sum + deficit, 0) / 7

  return {
    totalHours: Math.round(totalDebt * 10) / 10,
    dailyDeficit: Math.round(dailyDeficit * 10) / 10,
    weeklyAverage: Math.round(weeklyAverage * 10) / 10,
    optimalSleepHours,
    lastUpdated: new Date(),
  }
}

/**
 * Add a new sleep session and update debt
 */
export function addSleepSession(session: SleepSession): void {
  const sessions = getSleepSessions()

  // Remove existing session for the same date if it exists
  const filteredSessions = sessions.filter(
    s => startOfDay(s.date).getTime() !== startOfDay(session.date).getTime()
  )

  // Add new session
  filteredSessions.push(session)

  // Keep only last 30 days of data
  const thirtyDaysAgo = subDays(new Date(), 30)
  const recentSessions = filteredSessions.filter(s => s.date >= thirtyDaysAgo)

  // Sort by date
  recentSessions.sort((a, b) => a.date.getTime() - b.date.getTime())

  saveSleepSessions(recentSessions)
}

/**
 * Get stored sleep sessions from localStorage
 */
export function getSleepSessions(): SleepSession[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(SESSIONS_KEY)
    if (!stored) return []

    const sessions = JSON.parse(stored)
    return sessions.map((session: any) => ({
      ...session,
      date: new Date(session.date),
      bedtime: new Date(session.bedtime),
      wakeTime: new Date(session.wakeTime),
    }))
  } catch (error) {
    console.error('Error loading sleep sessions:', error)
    return []
  }
}

/**
 * Save sleep sessions to localStorage
 */
function saveSleepSessions(sessions: SleepSession[]): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
  } catch (error) {
    console.error('Error saving sleep sessions:', error)
  }
}

/**
 * Create a sleep session from bedtime and wake time
 */
export function createSleepSession(
  bedtime: Date,
  wakeTime: Date,
  quality: SleepSession['quality'] = 'good',
  source: SleepSession['source'] = 'manual'
): SleepSession {
  const actualSleepHours = differenceInHours(wakeTime, bedtime)
  const plannedSleepHours = DEFAULT_OPTIMAL_SLEEP // Could be made configurable

  return {
    date: startOfDay(wakeTime),
    bedtime,
    wakeTime,
    actualSleepHours,
    plannedSleepHours,
    quality,
    sleepDebtImpact: plannedSleepHours - actualSleepHours,
    source,
  }
}

/**
 * Get sleep debt recovery timeline
 */
export function getSleepDebtRecovery(
  currentDebt: number,
  dailyExtra: number = 1
): { daysToRecover: number; recoveryDate: Date } {
  if (currentDebt <= 0) {
    return { daysToRecover: 0, recoveryDate: new Date() }
  }

  const daysToRecover = Math.ceil(currentDebt / dailyExtra)
  const recoveryDate = addDays(new Date(), daysToRecover)

  return { daysToRecover, recoveryDate }
}

/**
 * Get sleep debt severity level
 */
export function getSleepDebtSeverity(debt: number): {
  level: 'none' | 'mild' | 'moderate' | 'severe' | 'extreme'
  description: string
  color: string
} {
  if (debt <= 1) {
    return {
      level: 'none',
      description: 'Well rested',
      color: 'green',
    }
  } else if (debt <= 3) {
    return {
      level: 'mild',
      description: 'Slightly tired',
      color: 'yellow',
    }
  } else if (debt <= 6) {
    return {
      level: 'moderate',
      description: 'Noticeably tired',
      color: 'orange',
    }
  } else if (debt <= 10) {
    return {
      level: 'severe',
      description: 'Very tired',
      color: 'red',
    }
  } else {
    return {
      level: 'extreme',
      description: 'Exhausted',
      color: 'red',
    }
  }
}

/**
 * Calculate sleep efficiency
 */
export function calculateSleepEfficiency(sessions: SleepSession[]): number {
  if (sessions.length === 0) return 0

  const recentSessions = sessions.slice(-7) // Last 7 sessions
  const efficiencies = recentSessions.map(session => {
    const timeInBed = differenceInHours(session.wakeTime, session.bedtime)
    return session.actualSleepHours / timeInBed
  })

  const averageEfficiency =
    efficiencies.reduce((sum, eff) => sum + eff, 0) / efficiencies.length
  return Math.round(averageEfficiency * 100)
}
