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
    // Only load alarms if we're in the browser environment
    if (typeof window !== 'undefined') {
      this.loadAlarms()
    }
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
   * Trigger an alarm notification with enhanced iOS features
   */
  private triggerAlarm(alarm: AlarmOptions): void {
    if (!alarm.isEnabled) return

    const title =
      alarm.type === 'bedtime' ? '🌙 Bedtime Reminder' : '☀️ Wake Up!'
    const body =
      alarm.label ||
      (alarm.type === 'bedtime' ? 'Time to get ready for bed' : 'Good morning!')

    // Enhanced notification options for iOS
    const notificationOptions: NotificationOptions & { actions?: any[] } = {
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      tag: alarm.id,
      requireInteraction: true,
      silent: false,
    }

    // Add actions if supported (experimental feature, may not work on all browsers)
    if ('serviceWorker' in navigator) {
      notificationOptions.actions = [
        {
          action: 'ios-setup',
          title: '📱 Setup iOS Alarm',
        },
        {
          action: 'copy-time',
          title: '📋 Copy Time',
        },
        {
          action: 'calendar',
          title: '📅 Add to Calendar',
        },
      ]
    }

    // Enhanced vibration patterns for different alarm types
    if (alarm.vibrate && 'vibrate' in navigator) {
      const pattern =
        alarm.type === 'bedtime'
          ? [200, 100, 200] // Gentle pattern for bedtime
          : [300, 200, 300, 200, 300] // More intense for wake up
      navigator.vibrate(pattern)
    }

    const notification = new Notification(title, notificationOptions)

    // Extended auto-close for better user interaction
    const autoCloseTimeout = setTimeout(() => {
      notification.close()
    }, 60000) // 60 seconds instead of 30

    // Enhanced notification click handling
    notification.onclick = () => {
      clearTimeout(autoCloseTimeout)
      window.focus()
      notification.close()

      // Enhanced iOS integration
      if (this.isIOS()) {
        this.openIOSClockApp(alarm)
      }
    }

    // Handle notification action clicks (iOS Safari may not support this fully)
    if ('addEventListener' in notification) {
      notification.addEventListener('notificationclick', (event: any) => {
        clearTimeout(autoCloseTimeout)
        event.notification.close()

        switch (event.action) {
          case 'ios-setup':
            this.openIOSClockApp(alarm)
            break
          case 'copy-time':
            this.copyAlarmTimeToClipboard(alarm)
            break
          case 'calendar':
            this.createCalendarAlarm(alarm)
            break
          default:
            window.focus()
            if (this.isIOS()) {
              this.openIOSClockApp(alarm)
            }
        }
      })
    }

    // Remove alarm from timeouts since it's been triggered
    this.timeouts.delete(alarm.id)
  }

  /**
   * Check if running on iOS
   */
  private isIOS(): boolean {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return false
    }
    return /iPad|iPhone|iPod/.test(navigator.userAgent)
  }

  /**
   * Enhanced iOS integration with multiple methods
   */
  private async openIOSClockApp(alarm: AlarmOptions): Promise<void> {
    if (!this.isIOS()) return

    // Method 1: Try to create iOS Shortcut URL for alarm
    await this.createIOSShortcutUrl(alarm)

    // Method 2: Show manual setup instructions
    setTimeout(() => {
      this.showIOSAlarmInstructions(alarm)
    }, 2000)
  }

  /**
   * Generate iOS Shortcuts URL for alarm creation
   */
  private async createIOSShortcutUrl(alarm: AlarmOptions): Promise<void> {
    const time = alarm.time
    const hours = time.getHours()
    const minutes = time.getMinutes()

    // Create Shortcuts URL to add alarm
    const shortcutActions = [
      {
        WFWorkflowActionIdentifier: 'is.workflow.actions.alarm.create',
        WFWorkflowActionParameters: {
          WFAlarmTime: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
          WFAlarmLabel:
            alarm.label ||
            `Cyrcdian ${alarm.type === 'bedtime' ? 'Bedtime' : 'Wake'} Alarm`,
        },
      },
    ]

    const shortcutData = {
      WFWorkflowName: `Set ${alarm.type === 'bedtime' ? 'Bedtime' : 'Wake'} Alarm`,
      WFWorkflowActions: shortcutActions,
      WFWorkflowClientVersion: '2302.0.4',
      WFWorkflowIcon: {
        WFWorkflowIconStartColor:
          alarm.type === 'bedtime' ? 4292311808 : 4294902015,
        WFWorkflowIconGlyphNumber: 59717,
      },
    }

    try {
      const shortcutUrl = `shortcuts://import-workflow/?url=${encodeURIComponent(
        'data:application/json;base64,' + btoa(JSON.stringify(shortcutData))
      )}&name=${encodeURIComponent(shortcutData.WFWorkflowName)}`

      // Try to open Shortcuts app
      window.location.href = shortcutUrl
    } catch (error) {
      console.warn('Failed to create Shortcuts URL:', error)
    }
  }

  /**
   * Show iOS alarm setup instructions
   */
  private showIOSAlarmInstructions(alarm: AlarmOptions): void {
    const time = alarm.time
    const timeString = time.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })

    const instructions = `
      📱 iOS Alarm Setup Instructions:
      
      ⏰ Time: ${timeString}
      📝 Label: ${alarm.label}
      
      Quick Setup Options:
      1️⃣ Say: "Hey Siri, set an alarm for ${timeString}"
      2️⃣ Open Clock app → Alarm → + → Set time to ${timeString}
      3️⃣ Add to Calendar as reminder with notification
      
      💡 Tip: Use the Shortcuts app for automated alarm creation!
    `

    // Show as notification or alert
    if (Notification.permission === 'granted') {
      const notificationOptions: NotificationOptions = {
        body: `Time: ${timeString}\nLabel: ${alarm.label}\n\nTap to see setup instructions`,
        requireInteraction: true,
      }

      new Notification('🔔 Set up your iOS alarm', notificationOptions)
    } else {
      alert(instructions)
    }
  }

  /**
   * Copy alarm time to clipboard for easy setup
   */
  async copyAlarmTimeToClipboard(alarm: AlarmOptions): Promise<boolean> {
    const timeString = alarm.time.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })

    try {
      await navigator.clipboard.writeText(timeString)

      // Show confirmation
      await this.showNotification(
        '📋 Time Copied!',
        `${timeString} copied to clipboard. Open Clock app and paste.`
      )
      return true
    } catch (error) {
      console.warn('Failed to copy to clipboard:', error)
      return false
    }
  }

  /**
   * Create calendar event as alarm backup
   */
  async createCalendarAlarm(alarm: AlarmOptions): Promise<void> {
    if (!this.isIOS()) return

    const time = alarm.time
    const title = `🔔 ${alarm.type === 'bedtime' ? 'Bedtime' : 'Wake Up'} Alarm`
    const details = alarm.label || 'Cyrcdian sleep schedule alarm'

    // Create calendar URL
    const startTime =
      time.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    const endTime =
      new Date(time.getTime() + 5 * 60 * 1000)
        .toISOString()
        .replace(/[-:]/g, '')
        .split('.')[0] + 'Z'

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startTime}/${endTime}&details=${encodeURIComponent(details)}&reminder=1`

    window.open(calendarUrl, '_blank')
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

  /**
   * Public method to copy alarm time to clipboard
   */
  async copyAlarmTime(alarmId: string): Promise<boolean> {
    const alarm = this.alarms.get(alarmId)
    if (!alarm) return false
    return this.copyAlarmTimeToClipboard(alarm)
  }

  /**
   * Public method to create calendar event for alarm
   */
  async addAlarmToCalendar(alarmId: string): Promise<void> {
    const alarm = this.alarms.get(alarmId)
    if (!alarm) return
    await this.createCalendarAlarm(alarm)
  }

  /**
   * Public method to create iOS shortcut for alarm
   */
  async createIOSShortcut(alarmId: string): Promise<void> {
    const alarm = this.alarms.get(alarmId)
    if (!alarm) return
    await this.createIOSShortcutUrl(alarm)
  }

  /**
   * Get setup instructions for iOS alarm
   */
  getIOSSetupInstructions(alarmId: string): string | null {
    const alarm = this.alarms.get(alarmId)
    if (!alarm) return null

    const timeString = alarm.time.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })

    return `Set up iOS alarm for ${timeString}:

1. "Hey Siri, set an alarm for ${timeString}"
2. Open Clock app → Alarm → + → ${timeString}
3. Use Shortcuts app for automation
4. Add to Calendar with notification

Label: ${alarm.label}`
  }

  /**
   * Check if device supports enhanced features
   */
  getDeviceCapabilities(): {
    isIOS: boolean
    hasNotifications: boolean
    hasVibrate: boolean
    hasClipboard: boolean
    hasShortcuts: boolean
  } {
    // Check if we're running in browser environment
    if (typeof window === 'undefined') {
      return {
        isIOS: false,
        hasNotifications: false,
        hasVibrate: false,
        hasClipboard: false,
        hasShortcuts: false,
      }
    }

    return {
      isIOS: this.isIOS(),
      hasNotifications: 'Notification' in window,
      hasVibrate: 'vibrate' in navigator,
      hasClipboard: 'clipboard' in navigator,
      hasShortcuts: this.isIOS(), // Shortcuts app is iOS-specific
    }
  }

  /**
   * Test alarm functionality
   */
  async testAlarmSystem(): Promise<{
    notifications: boolean
    vibration: boolean
    sound: boolean
    iosIntegration: boolean
  }> {
    const results = {
      notifications: false,
      vibration: false,
      sound: false,
      iosIntegration: false,
    }

    // Test notifications
    try {
      const permission = await this.requestPermission()
      results.notifications = permission.granted

      if (permission.granted) {
        await this.showNotification(
          '🧪 Test Notification',
          'Alarm system is working!'
        )
      }
    } catch {
      // Test failed
    }

    // Test vibration
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(200)
        results.vibration = true
      } catch {
        // Vibration test failed
      }
    }

    // Test iOS integration
    results.iosIntegration = this.isIOS()

    // Sound test (basic - just check if Audio API is available)
    results.sound = 'Audio' in window

    return results
  }
}

// Export singleton instance
export const notificationService = new NotificationService()

// Export types and service class
export { NotificationService }
