export interface AlarmOptions {
  id: string
  time: Date
  label: string
  type: 'bedtime' | 'wake'
  isEnabled: boolean
  sound?: string
  vibrate?: boolean
}

export interface NotificationPermissionStatus {
  granted: boolean
  denied: boolean
  default: boolean
}

class NotificationService {
  private alarms: Map<string, AlarmOptions> = new Map()
  private timeouts: Map<string, NodeJS.Timeout> = new Map()

  constructor() {
    this.loadAlarms()
  }

  /**
   * Request notification permission from the user
   */
  async requestPermission(): Promise<NotificationPermissionStatus> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return { granted: false, denied: true, default: false }
    }

    const permission = await Notification.requestPermission()

    return {
      granted: permission === 'granted',
      denied: permission === 'denied',
      default: permission === 'default',
    }
  }

  /**
   * Check current notification permission status
   */
  getPermissionStatus(): NotificationPermissionStatus {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return { granted: false, denied: true, default: false }
    }

    return {
      granted: Notification.permission === 'granted',
      denied: Notification.permission === 'denied',
      default: Notification.permission === 'default',
    }
  }

  /**
   * Schedule an alarm
   */
  async scheduleAlarm(options: AlarmOptions): Promise<boolean> {
    const permission = this.getPermissionStatus()
    if (!permission.granted) {
      const newPermission = await this.requestPermission()
      if (!newPermission.granted) {
        return false
      }
    }

    // Clear existing alarm with same ID
    this.cancelAlarm(options.id)

    // Store alarm
    this.alarms.set(options.id, options)
    this.saveAlarms()

    // Schedule notification
    const now = new Date()
    const timeUntilAlarm = options.time.getTime() - now.getTime()

    if (timeUntilAlarm > 0) {
      const timeout = setTimeout(() => {
        this.triggerAlarm(options)
      }, timeUntilAlarm)

      this.timeouts.set(options.id, timeout)
    }

    return true
  }

  /**
   * Cancel an alarm
   */
  cancelAlarm(id: string): void {
    const timeout = this.timeouts.get(id)
    if (timeout) {
      clearTimeout(timeout)
      this.timeouts.delete(id)
    }

    this.alarms.delete(id)
    this.saveAlarms()
  }

  /**
   * Get all scheduled alarms
   */
  getAlarms(): AlarmOptions[] {
    return Array.from(this.alarms.values())
  }

  /**
   * Enable or disable an alarm
   */
  toggleAlarm(id: string, enabled: boolean): void {
    const alarm = this.alarms.get(id)
    if (!alarm) return

    alarm.isEnabled = enabled
    this.alarms.set(id, alarm)
    this.saveAlarms()

    if (enabled) {
      this.scheduleAlarm(alarm)
    } else {
      const timeout = this.timeouts.get(id)
      if (timeout) {
        clearTimeout(timeout)
        this.timeouts.delete(id)
      }
    }
  }

  /**
   * Trigger an alarm notification
   */
  private triggerAlarm(alarm: AlarmOptions): void {
    if (!alarm.isEnabled) return

    const title =
      alarm.type === 'bedtime' ? '🌙 Bedtime Reminder' : '☀️ Wake Up!'
    const body =
      alarm.label ||
      (alarm.type === 'bedtime' ? 'Time to get ready for bed' : 'Good morning!')

    // Show notification
    const notificationOptions: NotificationOptions = {
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      tag: alarm.id,
      requireInteraction: true,
    }

    // Add vibrate if supported (some browsers/platforms support it)
    if (alarm.vibrate && 'vibrate' in navigator) {
      navigator.vibrate([200, 100, 200])
    }

    const notification = new Notification(title, notificationOptions)

    // Auto-close after 30 seconds
    setTimeout(() => {
      notification.close()
    }, 30000)

    // Handle notification click
    notification.onclick = () => {
      window.focus()
      notification.close()

      // Try to open iOS Clock app if on iOS
      if (this.isIOS()) {
        this.openIOSClockApp(alarm)
      }
    }

    // Remove alarm from timeouts since it's been triggered
    this.timeouts.delete(alarm.id)
  }

  /**
   * Check if running on iOS
   */
  private isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent)
  }

  /**
   * Attempt to open iOS Clock app
   */
  private openIOSClockApp(_alarm: AlarmOptions): void {
    if (!this.isIOS()) return

    // Try to open Clock app with deep link
    const clockUrl = 'clock-alarm://'
    const fallbackUrl = 'https://support.apple.com/en-us/HT208655' // How to set alarms article

    // Create a hidden link and try to open it
    const link = document.createElement('a')
    link.href = clockUrl
    link.style.display = 'none'
    document.body.appendChild(link)

    // Set a timeout to redirect to fallback if Clock app doesn't open
    const timeout = setTimeout(() => {
      window.open(fallbackUrl, '_blank')
    }, 1500)

    // Try to open Clock app
    link.click()

    // If we get a blur event quickly, the app probably opened
    const handleBlur = () => {
      clearTimeout(timeout)
      window.removeEventListener('blur', handleBlur)
    }
    window.addEventListener('blur', handleBlur)

    // Clean up
    setTimeout(() => {
      document.body.removeChild(link)
      window.removeEventListener('blur', handleBlur)
    }, 2000)
  }

  /**
   * Show a simple notification
   */
  async showNotification(
    title: string,
    body: string,
    options?: NotificationOptions
  ): Promise<void> {
    const permission = this.getPermissionStatus()
    if (!permission.granted) {
      const newPermission = await this.requestPermission()
      if (!newPermission.granted) {
        return
      }
    }

    new Notification(title, {
      body,
      icon: '/icons/icon-192x192.png',
      ...options,
    })
  }

  /**
   * Schedule bedtime reminder
   */
  async scheduleBedtimeReminder(
    bedtime: Date,
    wakeTime: Date
  ): Promise<boolean> {
    // Schedule reminder 30 minutes before bedtime
    const reminderTime = new Date(bedtime.getTime() - 30 * 60 * 1000)

    const alarmOptions: AlarmOptions = {
      id: 'bedtime-reminder',
      time: reminderTime,
      label: `Get ready for bed to wake up at ${wakeTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      type: 'bedtime',
      isEnabled: true,
      vibrate: true,
    }

    return this.scheduleAlarm(alarmOptions)
  }

  /**
   * Schedule wake up alarm
   */
  async scheduleWakeAlarm(wakeTime: Date): Promise<boolean> {
    const alarmOptions: AlarmOptions = {
      id: 'wake-alarm',
      time: wakeTime,
      label: 'Time to wake up! Start your day with energy.',
      type: 'wake',
      isEnabled: true,
      vibrate: true,
    }

    return this.scheduleAlarm(alarmOptions)
  }

  /**
   * Load alarms from localStorage
   */
  private loadAlarms(): void {
    if (typeof window === 'undefined') return

    try {
      const data = localStorage.getItem('cyrcdian-alarms')
      if (!data) return

      const alarms = JSON.parse(data)
      alarms.forEach((alarm: any) => {
        // Convert time string back to Date
        alarm.time = new Date(alarm.time)
        this.alarms.set(alarm.id, alarm)

        // Reschedule if still in future and enabled
        if (alarm.isEnabled && alarm.time > new Date()) {
          this.scheduleAlarm(alarm)
        }
      })
    } catch {
      // Silently handle loading errors
    }
  }

  /**
   * Save alarms to localStorage
   */
  private saveAlarms(): void {
    if (typeof window === 'undefined') return

    try {
      const alarms = Array.from(this.alarms.values())
      localStorage.setItem('cyrcdian-alarms', JSON.stringify(alarms))
    } catch {
      // Silently handle saving errors
    }
  }

  /**
   * Clear all alarms
   */
  clearAllAlarms(): void {
    this.timeouts.forEach(timeout => clearTimeout(timeout))
    this.timeouts.clear()
    this.alarms.clear()
    this.saveAlarms()
  }
}

// Export singleton instance
export const notificationService = new NotificationService()

// Export types and service class
export { NotificationService }
