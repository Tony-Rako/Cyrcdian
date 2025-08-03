import { addMinutes, format, parse, subMinutes } from 'date-fns'

export interface SleepCycle {
  bedtime: Date
  duration: number // in hours
  cycles: number
  quality: 'short' | 'optimal' | 'extended'
}

export interface SleepCalculation {
  wakeTime: Date
  recommendedBedtimes: SleepCycle[]
  currentTime: Date
  timeUntilBedtime: number | undefined // minutes until recommended bedtime
  timeUntilWake: number | undefined // minutes until wake time
}

// 90-minute sleep cycle in minutes
const SLEEP_CYCLE_MINUTES = 90
const FALL_ASLEEP_MINUTES = 15 // Average time to fall asleep

/**
 * Calculate optimal bedtimes based on desired wake time
 */
export function calculateOptimalBedtimes(wakeTime: Date): SleepCalculation {
  const currentTime = new Date()
  const recommendedBedtimes: SleepCycle[] = []

  // Calculate bedtimes for 3-6 sleep cycles (4.5-9 hours of sleep)
  for (let cycles = 3; cycles <= 6; cycles++) {
    const sleepMinutes = cycles * SLEEP_CYCLE_MINUTES
    const totalMinutes = sleepMinutes + FALL_ASLEEP_MINUTES

    const bedtime = subMinutes(wakeTime, totalMinutes)
    const duration = sleepMinutes / 60 // Convert to hours

    let quality: 'short' | 'optimal' | 'extended'
    if (cycles <= 3) quality = 'short'
    else if (cycles >= 5) quality = 'extended'
    else quality = 'optimal'

    recommendedBedtimes.push({
      bedtime,
      duration,
      cycles,
      quality,
    })
  }

  // Find the next recommended bedtime
  const nextBedtime = recommendedBedtimes.find(bt => bt.bedtime > currentTime)
  const timeUntilBedtime = nextBedtime
    ? Math.floor(
        (nextBedtime.bedtime.getTime() - currentTime.getTime()) / (1000 * 60)
      )
    : undefined

  const timeUntilWake = Math.floor(
    (wakeTime.getTime() - currentTime.getTime()) / (1000 * 60)
  )

  return {
    wakeTime,
    recommendedBedtimes,
    currentTime,
    timeUntilBedtime,
    timeUntilWake: timeUntilWake > 0 ? timeUntilWake : undefined,
  }
}

/**
 * Calculate bedtime for a specific number of sleep cycles
 */
export function calculateBedtimeForCycles(
  wakeTime: Date,
  cycles: number
): Date {
  const sleepMinutes = cycles * SLEEP_CYCLE_MINUTES
  const totalMinutes = sleepMinutes + FALL_ASLEEP_MINUTES
  return subMinutes(wakeTime, totalMinutes)
}

/**
 * Calculate wake time for a specific bedtime and cycles
 */
export function calculateWakeTimeFromBedtime(
  bedtime: Date,
  cycles: number
): Date {
  const sleepMinutes = cycles * SLEEP_CYCLE_MINUTES
  const totalMinutes = sleepMinutes + FALL_ASLEEP_MINUTES
  return addMinutes(bedtime, totalMinutes)
}

/**
 * Format time for display
 */
export function formatSleepTime(date: Date): string {
  return format(date, 'HH:mm')
}

/**
 * Format duration for display
 */
export function formatDuration(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return `${h}h${m > 0 ? ` ${m}m` : ''}`
}

/**
 * Parse time string (HH:mm) and set it to today or tomorrow if it's in the past
 */
export function parseWakeTime(timeString: string): Date {
  const today = new Date()
  const time = parse(timeString, 'HH:mm', today)

  // If the time is in the past, assume it's for tomorrow
  if (time < today) {
    time.setDate(time.getDate() + 1)
  }

  return time
}

/**
 * Get time remaining until a specific time in a human-readable format
 */
export function getTimeRemaining(targetTime: Date): string {
  const now = new Date()
  const diff = targetTime.getTime() - now.getTime()

  if (diff <= 0) return '0 minutes'

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

/**
 * Check if current time is within sleep hours
 */
export function isInSleepWindow(bedtime: Date, wakeTime: Date): boolean {
  const now = new Date()

  // Handle case where bedtime is on previous day
  if (bedtime > wakeTime) {
    return now >= bedtime || now <= wakeTime
  }

  return now >= bedtime && now <= wakeTime
}
