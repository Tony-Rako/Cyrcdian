import { addMinutes, addHours, format, parse, subMinutes } from 'date-fns'

export interface SleepCycle {
  bedtime: Date
  duration: number // in hours
  cycles: number
  quality: 'short' | 'optimal' | 'extended'
}

export interface SleepOption {
  bedtimeAlarm: Date
  actualSleepTime: Date
  calculatedWakeTime: Date
  actualSleepDuration: number // in hours
  cycles: number
  awakeHours: number
  quality: 'custom' | 'short' | 'recommended' | 'extended'
  matchScore: number // 0-100, how well it matches target wake time
}

export interface EnhancedSleepCalculation {
  currentWakeTime: Date
  targetWakeTime: Date
  sleepOptions: SleepOption[]
  bestMatch: SleepOption | null
  customAwakeDuration?: number | undefined
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
const FALL_ASLEEP_MINUTES = 30 // 30-minute sleep onset buffer

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

/**
 * Calculate enhanced sleep schedule based on current wake time and target wake time
 */
export function calculateEnhancedSleepSchedule(
  currentWakeTime: Date,
  targetWakeTime: Date,
  customAwakeDuration?: number
): EnhancedSleepCalculation {
  const sleepOptions: SleepOption[] = []

  // Standard awake duration options (in hours)
  const standardOptions: Array<{
    hours: number
    quality: SleepOption['quality']
  }> = [
    { hours: 14.5, quality: 'short' },
    { hours: 16, quality: 'recommended' },
    { hours: 18, quality: 'extended' },
  ]

  // Add custom option if provided and valid
  if (
    customAwakeDuration &&
    customAwakeDuration >= 11.5 &&
    customAwakeDuration < 14.5
  ) {
    standardOptions.unshift({ hours: customAwakeDuration, quality: 'custom' })
  }

  for (const option of standardOptions) {
    const sleepOption = calculateSleepOptionFromAwakeDuration(
      currentWakeTime,
      targetWakeTime,
      option.hours,
      option.quality
    )
    if (sleepOption) {
      sleepOptions.push(sleepOption)
    }
  }

  // Find best match based on how close calculated wake time is to target
  const bestMatch = sleepOptions.reduce(
    (best, current) => {
      if (!best) return current
      return current.matchScore > best.matchScore ? current : best
    },
    null as SleepOption | null
  )

  return {
    currentWakeTime,
    targetWakeTime,
    sleepOptions,
    bestMatch,
    customAwakeDuration,
  }
}

/**
 * Calculate a single sleep option based on awake duration
 */
function calculateSleepOptionFromAwakeDuration(
  currentWakeTime: Date,
  targetWakeTime: Date,
  awakeHours: number,
  quality: SleepOption['quality']
): SleepOption | null {
  // Calculate bedtime alarm time (awake hours after current wake time)
  const bedtimeAlarm = addHours(currentWakeTime, awakeHours)

  // Actual sleep time is 30 minutes after bedtime alarm
  const actualSleepTime = addMinutes(bedtimeAlarm, FALL_ASLEEP_MINUTES)

  // Calculate possible wake times based on complete sleep cycles
  const possibleWakeTimes: Array<{
    wakeTime: Date
    cycles: number
    duration: number
  }> = []

  // Try 3-6 complete sleep cycles
  for (let cycles = 3; cycles <= 6; cycles++) {
    const sleepDurationMinutes = cycles * SLEEP_CYCLE_MINUTES
    const calculatedWakeTime = addMinutes(actualSleepTime, sleepDurationMinutes)
    const sleepDurationHours = sleepDurationMinutes / 60

    possibleWakeTimes.push({
      wakeTime: calculatedWakeTime,
      cycles,
      duration: sleepDurationHours,
    })
  }

  // Find the wake time closest to target
  const bestWakeTime = possibleWakeTimes.reduce((best, current) => {
    const currentDiff = Math.abs(
      current.wakeTime.getTime() - targetWakeTime.getTime()
    )
    const bestDiff = Math.abs(
      best.wakeTime.getTime() - targetWakeTime.getTime()
    )
    return currentDiff < bestDiff ? current : best
  })

  // Calculate match score (0-100) based on how close to target wake time
  const timeDiffMinutes =
    Math.abs(bestWakeTime.wakeTime.getTime() - targetWakeTime.getTime()) /
    (1000 * 60)
  const maxAcceptableDiff = 60 // 1 hour
  const matchScore = Math.max(
    0,
    100 - (timeDiffMinutes / maxAcceptableDiff) * 100
  )

  return {
    bedtimeAlarm,
    actualSleepTime,
    calculatedWakeTime: bestWakeTime.wakeTime,
    actualSleepDuration: bestWakeTime.duration,
    cycles: bestWakeTime.cycles,
    awakeHours,
    quality,
    matchScore: Math.round(matchScore),
  }
}

/**
 * Format awake duration for display
 */
export function formatAwakeDuration(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

/**
 * Calculate time difference in a readable format
 */
export function getTimeDifference(time1: Date, time2: Date): string {
  const diffMs = Math.abs(time2.getTime() - time1.getTime())
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const hours = Math.floor(diffMinutes / 60)
  const minutes = diffMinutes % 60

  if (hours === 0) return `${minutes}m`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}
