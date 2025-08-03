export interface WakeEvent {
  timestamp: Date
  confidence: 'low' | 'medium' | 'high'
  source: 'visibility' | 'user-interaction' | 'manual'
}

export interface SleepSession {
  bedtime?: Date
  wakeTime?: Date
  duration?: number // in minutes
  quality: number | undefined // 1-5 rating
  cycles?: number
  isAutoDetected: boolean
}

class WakeDetectionService {
  private lastVisibilityChange: Date | null = null
  private sleepThresholdMinutes = 180 // 3 hours minimum for sleep detection
  private wakeCallbacks: ((event: WakeEvent) => void)[] = []
  private isActive = false

  constructor() {
    this.setupVisibilityDetection()
    this.setupUserInteractionDetection()
  }

  /**
   * Start wake detection monitoring
   */
  start(): void {
    this.isActive = true
  }

  /**
   * Stop wake detection monitoring
   */
  stop(): void {
    this.isActive = false
  }

  /**
   * Add callback for wake events
   */
  onWakeDetected(callback: (event: WakeEvent) => void): void {
    this.wakeCallbacks.push(callback)
  }

  /**
   * Remove wake event callback
   */
  removeWakeCallback(callback: (event: WakeEvent) => void): void {
    this.wakeCallbacks = this.wakeCallbacks.filter(cb => cb !== callback)
  }

  /**
   * Setup Page Visibility API for screen state detection
   */
  private setupVisibilityDetection(): void {
    if (typeof document === 'undefined') return

    document.addEventListener('visibilitychange', () => {
      if (!this.isActive) return

      const now = new Date()

      if (document.visibilityState === 'visible') {
        // Screen became visible - potential wake event
        this.handleScreenVisible(now)
      } else {
        // Screen became hidden - potential sleep start
        this.handleScreenHidden(now)
      }
    })
  }

  /**
   * Setup user interaction detection for additional wake signals
   */
  private setupUserInteractionDetection(): void {
    if (typeof window === 'undefined') return

    const events = ['mousedown', 'keydown', 'touchstart', 'focus']

    events.forEach(eventType => {
      window.addEventListener(
        eventType,
        () => {
          if (!this.isActive) return

          const now = new Date()
          this.handleUserInteraction(now)
        },
        { passive: true }
      )
    })
  }

  /**
   * Handle screen becoming visible
   */
  private handleScreenVisible(now: Date): void {
    if (!this.lastVisibilityChange) {
      this.lastVisibilityChange = now
      return
    }

    const inactiveMinutes =
      (now.getTime() - this.lastVisibilityChange.getTime()) / (1000 * 60)

    // If screen was hidden for more than sleep threshold, consider it a wake event
    if (inactiveMinutes >= this.sleepThresholdMinutes) {
      const confidence = this.calculateWakeConfidence(inactiveMinutes)

      const wakeEvent: WakeEvent = {
        timestamp: now,
        confidence,
        source: 'visibility',
      }

      this.notifyWakeEvent(wakeEvent)

      // Store sleep session data
      this.storeSleepSession(this.lastVisibilityChange, now, inactiveMinutes)
    }

    this.lastVisibilityChange = now
  }

  /**
   * Handle screen becoming hidden
   */
  private handleScreenHidden(now: Date): void {
    this.lastVisibilityChange = now
  }

  /**
   * Handle user interaction events
   */
  private handleUserInteraction(now: Date): void {
    // User interaction after long inactivity could indicate wake
    if (this.lastVisibilityChange) {
      const inactiveMinutes =
        (now.getTime() - this.lastVisibilityChange.getTime()) / (1000 * 60)

      if (inactiveMinutes >= this.sleepThresholdMinutes) {
        const wakeEvent: WakeEvent = {
          timestamp: now,
          confidence: 'medium',
          source: 'user-interaction',
        }

        this.notifyWakeEvent(wakeEvent)
      }
    }
  }

  /**
   * Calculate confidence level based on inactivity duration
   */
  private calculateWakeConfidence(
    inactiveMinutes: number
  ): 'low' | 'medium' | 'high' {
    if (inactiveMinutes >= 480) return 'high' // 8+ hours
    if (inactiveMinutes >= 360) return 'medium' // 6+ hours
    return 'low' // 3-6 hours
  }

  /**
   * Notify all registered callbacks about wake event
   */
  private notifyWakeEvent(event: WakeEvent): void {
    this.wakeCallbacks.forEach(callback => {
      try {
        callback(event)
      } catch {
        // Silently handle callback errors
      }
    })
  }

  /**
   * Store sleep session data in localStorage
   */
  private storeSleepSession(
    bedtime: Date,
    wakeTime: Date,
    durationMinutes: number
  ): void {
    const session: SleepSession = {
      bedtime,
      wakeTime,
      duration: durationMinutes,
      quality: undefined,
      cycles: Math.round(durationMinutes / 90), // Estimate sleep cycles
      isAutoDetected: true,
    }

    try {
      const existingSessions = this.getSleepHistory()
      existingSessions.push(session)

      // Keep only last 30 days of data
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const recentSessions = existingSessions.filter(
        s => s.wakeTime && s.wakeTime >= thirtyDaysAgo
      )

      localStorage.setItem(
        'cyrcdian-sleep-sessions',
        JSON.stringify(recentSessions)
      )
    } catch {
      // Silently handle storage errors
    }
  }

  /**
   * Get sleep history from localStorage
   */
  getSleepHistory(): SleepSession[] {
    try {
      const data = localStorage.getItem('cyrcdian-sleep-sessions')
      if (!data) return []

      const sessions = JSON.parse(data)

      // Convert date strings back to Date objects
      return sessions.map((session: any) => ({
        ...session,
        bedtime: session.bedtime ? new Date(session.bedtime) : undefined,
        wakeTime: session.wakeTime ? new Date(session.wakeTime) : undefined,
      }))
    } catch {
      return []
    }
  }

  /**
   * Manually log a sleep session
   */
  logManualSleep(bedtime: Date, wakeTime: Date, quality?: number): void {
    const durationMinutes =
      (wakeTime.getTime() - bedtime.getTime()) / (1000 * 60)

    const _session: SleepSession = {
      bedtime,
      wakeTime,
      duration: durationMinutes,
      quality,
      cycles: Math.round(durationMinutes / 90),
      isAutoDetected: false,
    }

    this.storeSleepSession(bedtime, wakeTime, durationMinutes)

    // Trigger wake event for manual logging
    const wakeEvent: WakeEvent = {
      timestamp: wakeTime,
      confidence: 'high',
      source: 'manual',
    }

    this.notifyWakeEvent(wakeEvent)
  }

  /**
   * Get average sleep duration from recent sessions
   */
  getAverageSleepDuration(days = 7): number | null {
    const sessions = this.getSleepHistory()
    const recentSessions = sessions
      .filter(s => s.duration && s.wakeTime)
      .filter(s => {
        const daysAgo = new Date()
        daysAgo.setDate(daysAgo.getDate() - days)
        return s.wakeTime! >= daysAgo
      })

    if (recentSessions.length === 0) return null

    const totalMinutes = recentSessions.reduce(
      (sum, session) => sum + session.duration!,
      0
    )
    return totalMinutes / recentSessions.length
  }

  /**
   * Get sleep consistency score (how regular sleep times are)
   */
  getSleepConsistency(days = 7): number | null {
    const sessions = this.getSleepHistory()
    const recentSessions = sessions
      .filter(s => s.bedtime && s.wakeTime)
      .filter(s => {
        const daysAgo = new Date()
        daysAgo.setDate(daysAgo.getDate() - days)
        return s.wakeTime! >= daysAgo
      })

    if (recentSessions.length < 3) return null

    // Calculate standard deviation of bedtimes and wake times
    const bedtimes = recentSessions.map(
      s => s.bedtime!.getHours() * 60 + s.bedtime!.getMinutes()
    )
    const waketimes = recentSessions.map(
      s => s.wakeTime!.getHours() * 60 + s.wakeTime!.getMinutes()
    )

    const bedtimeStd = this.calculateStandardDeviation(bedtimes)
    const waketimeStd = this.calculateStandardDeviation(waketimes)

    // Convert to consistency score (0-100, higher is more consistent)
    const avgStd = (bedtimeStd + waketimeStd) / 2
    const consistency = Math.max(0, 100 - (avgStd / 60) * 100) // Normalize by hour

    return Math.round(consistency)
  }

  /**
   * Calculate standard deviation
   */
  private calculateStandardDeviation(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2))
    const avgSquaredDiff =
      squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length
    return Math.sqrt(avgSquaredDiff)
  }
}

// Export singleton instance
export const wakeDetectionService = new WakeDetectionService()

// Export types and service class
export { WakeDetectionService }
