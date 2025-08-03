import { getTimes } from 'suncalc'
import { addHours, subHours } from 'date-fns'

export interface CircadianData {
  sunrise: Date
  sunset: Date
  solarNoon: Date
  nauticalDawn: Date
  nauticalDusk: Date
  optimalSleepWindow: {
    start: Date
    end: Date
  }
  optimalWakeWindow: {
    start: Date
    end: Date
  }
}

export interface LocationCoords {
  latitude: number
  longitude: number
}

// Default coordinates (San Francisco) if geolocation is not available
const DEFAULT_COORDS: LocationCoords = {
  latitude: 37.7749,
  longitude: -122.4194,
}

/**
 * Get circadian rhythm data for a given date and location
 */
export function getCircadianData(
  date: Date,
  coords?: LocationCoords
): CircadianData {
  const location = coords || DEFAULT_COORDS
  const times = getTimes(date, location.latitude, location.longitude)

  // Optimal sleep window: 2-4 hours after sunset
  const optimalSleepStart = addHours(times.sunset, 2)
  const optimalSleepEnd = addHours(times.sunset, 4)

  // Optimal wake window: 30 minutes before to 1 hour after sunrise
  const optimalWakeStart = subHours(times.sunrise, 0.5)
  const optimalWakeEnd = addHours(times.sunrise, 1)

  return {
    sunrise: times.sunrise,
    sunset: times.sunset,
    solarNoon: times.solarNoon,
    nauticalDawn: times.nauticalDawn,
    nauticalDusk: times.nauticalDusk,
    optimalSleepWindow: {
      start: optimalSleepStart,
      end: optimalSleepEnd,
    },
    optimalWakeWindow: {
      start: optimalWakeStart,
      end: optimalWakeEnd,
    },
  }
}

/**
 * Get user's current location using geolocation API
 */
export function getCurrentLocation(): Promise<LocationCoords> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      error => {
        console.warn('Geolocation error:', error.message)
        // Fallback to default location
        resolve(DEFAULT_COORDS)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000, // 10 minutes
      }
    )
  })
}

/**
 * Calculate how aligned a sleep schedule is with circadian rhythm
 */
export function calculateCircadianAlignment(
  bedtime: Date,
  wakeTime: Date,
  circadianData: CircadianData
): {
  sleepAlignment: number // 0-100
  wakeAlignment: number // 0-100
  overallAlignment: number // 0-100
  recommendations: string[]
} {
  const recommendations: string[] = []

  // Calculate sleep alignment (how close bedtime is to optimal sleep window)
  const sleepAlignment = calculateTimeWindowAlignment(
    bedtime,
    circadianData.optimalSleepWindow.start,
    circadianData.optimalSleepWindow.end
  )

  // Calculate wake alignment (how close wake time is to optimal wake window)
  const wakeAlignment = calculateTimeWindowAlignment(
    wakeTime,
    circadianData.optimalWakeWindow.start,
    circadianData.optimalWakeWindow.end
  )

  const overallAlignment = (sleepAlignment + wakeAlignment) / 2

  // Generate recommendations
  if (sleepAlignment < 70) {
    const optimalRange = `${formatTime(circadianData.optimalSleepWindow.start)} - ${formatTime(circadianData.optimalSleepWindow.end)}`
    recommendations.push(
      `Try going to bed between ${optimalRange} for better circadian alignment`
    )
  }

  if (wakeAlignment < 70) {
    const optimalRange = `${formatTime(circadianData.optimalWakeWindow.start)} - ${formatTime(circadianData.optimalWakeWindow.end)}`
    recommendations.push(
      `Try waking up between ${optimalRange} to align with your natural rhythm`
    )
  }

  if (overallAlignment >= 80) {
    recommendations.push(
      'Your sleep schedule is well-aligned with your circadian rhythm!'
    )
  }

  return {
    sleepAlignment,
    wakeAlignment,
    overallAlignment,
    recommendations,
  }
}

/**
 * Calculate alignment percentage for a time within a window
 */
function calculateTimeWindowAlignment(
  time: Date,
  windowStart: Date,
  windowEnd: Date
): number {
  const timeMs = time.getTime()
  const startMs = windowStart.getTime()
  const endMs = windowEnd.getTime()

  // If time is within the optimal window, return 100%
  if (timeMs >= startMs && timeMs <= endMs) {
    return 100
  }

  // Calculate how far outside the window the time is
  const windowDuration = endMs - startMs
  const maxDeviation = windowDuration * 2 // Allow 2x window duration for gradual falloff

  let deviation: number
  if (timeMs < startMs) {
    deviation = startMs - timeMs
  } else {
    deviation = timeMs - endMs
  }

  // Calculate alignment percentage with gradual falloff
  const alignment = Math.max(0, 100 - (deviation / maxDeviation) * 100)
  return Math.round(alignment)
}

/**
 * Format time for display
 */
function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

/**
 * Get current sun phase
 */
export function getCurrentSunPhase(circadianData: CircadianData): {
  phase: 'night' | 'dawn' | 'day' | 'dusk'
  nextTransition: Date
  timeToNext: number // minutes
} {
  const now = new Date()
  const currentMs = now.getTime()

  if (currentMs < circadianData.nauticalDawn.getTime()) {
    return {
      phase: 'night',
      nextTransition: circadianData.nauticalDawn,
      timeToNext: Math.floor(
        (circadianData.nauticalDawn.getTime() - currentMs) / (1000 * 60)
      ),
    }
  }

  if (currentMs < circadianData.sunrise.getTime()) {
    return {
      phase: 'dawn',
      nextTransition: circadianData.sunrise,
      timeToNext: Math.floor(
        (circadianData.sunrise.getTime() - currentMs) / (1000 * 60)
      ),
    }
  }

  if (currentMs < circadianData.sunset.getTime()) {
    return {
      phase: 'day',
      nextTransition: circadianData.sunset,
      timeToNext: Math.floor(
        (circadianData.sunset.getTime() - currentMs) / (1000 * 60)
      ),
    }
  }

  if (currentMs < circadianData.nauticalDusk.getTime()) {
    return {
      phase: 'dusk',
      nextTransition: circadianData.nauticalDusk,
      timeToNext: Math.floor(
        (circadianData.nauticalDusk.getTime() - currentMs) / (1000 * 60)
      ),
    }
  }

  return {
    phase: 'night',
    nextTransition: circadianData.nauticalDawn,
    timeToNext: Math.floor(
      (circadianData.nauticalDawn.getTime() - currentMs) / (1000 * 60)
    ),
  }
}
