import {
  EnergyLevel,
  EnergyPrediction,
  CircadianPhase,
  EnergyInsight,
  SleepDebt,
  EnergySettings,
  SleepSession as _SleepSession,
} from '@/types/energy'
import { CircadianData, getCurrentSunPhase } from './circadian'
import {
  calculateSleepDebt as _calculateSleepDebt,
  getSleepDebtSeverity,
} from './sleep-debt'
import {
  addHours,
  addMinutes as _addMinutes,
  differenceInMinutes,
  format,
} from 'date-fns'

/**
 * Calculate current energy level based on circadian rhythm and sleep debt
 */
export function calculateCurrentEnergyLevel(
  circadianData: CircadianData,
  sleepDebt: SleepDebt,
  settings: Partial<EnergySettings> = {}
): EnergyLevel {
  const now = new Date()
  const sunPhase = getCurrentSunPhase(circadianData)

  // Base energy from circadian rhythm (0-100)
  const baseEnergy = getCircadianEnergyLevel(sunPhase.phase, now, circadianData)

  // Sleep debt penalty (reduces energy)
  const debtPenalty = Math.min(40, sleepDebt.totalHours * 5) // Max 40 point penalty

  // Weekly consistency bonus/penalty
  const consistencyBonus = sleepDebt.weeklyAverage < 1 ? 10 : 0

  // Calculate final energy level
  const energyLevel = Math.max(
    5,
    Math.min(100, baseEnergy - debtPenalty + consistencyBonus)
  )

  // Determine energy phase
  let phase: EnergyLevel['phase']
  if (energyLevel >= 80) phase = 'peak'
  else if (energyLevel >= 60) phase = 'moderate'
  else if (energyLevel >= 30) phase = 'low'
  else phase = 'crash'

  // Confidence based on data quality
  const confidence = calculateConfidence(sleepDebt, settings)

  return {
    timestamp: now,
    level: Math.round(energyLevel),
    phase,
    confidence,
  }
}

/**
 * Get base energy level from circadian rhythm
 */
function getCircadianEnergyLevel(
  sunPhase: string,
  currentTime: Date,
  _circadianData: CircadianData
): number {
  const hour = currentTime.getHours()
  const minute = currentTime.getMinutes()
  const timeDecimal = hour + minute / 60

  // Energy curve based on typical circadian rhythm
  switch (sunPhase) {
    case 'night':
      // Very low energy during night (10-30)
      return 10 + Math.sin(((timeDecimal - 22) * Math.PI) / 10) * 10

    case 'dawn':
      // Rising energy during dawn (30-70)
      const dawnProgress = (timeDecimal - 5) / 2 // Assume 2-hour dawn
      return 30 + dawnProgress * 40

    case 'day':
      // Peak energy with afternoon dip
      if (timeDecimal < 12) {
        // Morning peak (70-90)
        return 70 + Math.sin(((timeDecimal - 6) * Math.PI) / 6) * 20
      } else if (timeDecimal < 15) {
        // Afternoon dip (60-75)
        return 75 - Math.sin(((timeDecimal - 12) * Math.PI) / 3) * 15
      } else {
        // Late afternoon recovery (65-80)
        return 65 + Math.sin(((timeDecimal - 15) * Math.PI) / 3) * 15
      }

    case 'dusk':
      // Gradual energy decline (50-80)
      const duskProgress = (timeDecimal - 17) / 3 // Assume 3-hour dusk
      return 80 - duskProgress * 30

    default:
      return 50
  }
}

/**
 * Generate hourly energy forecast for next 24 hours
 */
export function generateEnergyForecast(
  circadianData: CircadianData,
  sleepDebt: SleepDebt,
  _settings: Partial<EnergySettings> = {}
): EnergyLevel[] {
  const forecast: EnergyLevel[] = []
  const now = new Date()

  for (let i = 0; i < 24; i++) {
    const futureTime = addHours(now, i)
    const futureSunPhase = getCurrentSunPhase(circadianData)

    // Simulate future circadian data (simplified)
    const baseEnergy = getCircadianEnergyLevel(
      futureSunPhase.phase,
      futureTime,
      circadianData
    )

    // Apply sleep debt (assume it improves with sleep)
    let adjustedDebt = sleepDebt.totalHours
    if (i > 8 && i < 16) {
      // Assume sleep between hour 8-16 of forecast
      adjustedDebt = Math.max(0, adjustedDebt - 8) // Recover 8 hours of debt
    }

    const debtPenalty = Math.min(40, adjustedDebt * 5)
    const energyLevel = Math.max(5, Math.min(100, baseEnergy - debtPenalty))

    let phase: EnergyLevel['phase']
    if (energyLevel >= 80) phase = 'peak'
    else if (energyLevel >= 60) phase = 'moderate'
    else if (energyLevel >= 30) phase = 'low'
    else phase = 'crash'

    forecast.push({
      timestamp: futureTime,
      level: Math.round(energyLevel),
      phase,
      confidence: 0.7 - i * 0.02, // Confidence decreases over time
    })
  }

  return forecast
}

/**
 * Get current circadian phase with recommendations
 */
export function getCurrentCircadianPhase(
  circadianData: CircadianData,
  _currentEnergy: EnergyLevel
): CircadianPhase {
  const now = new Date()
  const hour = now.getHours()
  const _sunPhase = getCurrentSunPhase(circadianData)

  if (hour >= 6 && hour < 10) {
    return {
      phase: 'morning-rise',
      description: 'Your body is naturally waking up and energy is rising',
      energyTrend: 'rising',
      recommendations: [
        'Get natural light exposure',
        'Light exercise or stretching',
        'Hydrate well',
      ],
      optimalActivities: ['Planning', 'Light tasks', 'Morning routine'],
    }
  } else if (hour >= 10 && hour < 12) {
    return {
      phase: 'morning-peak',
      description: 'Peak cognitive performance time for most people',
      energyTrend: 'stable',
      recommendations: [
        'Tackle complex tasks',
        'Important meetings',
        'Creative work',
      ],
      optimalActivities: ['Deep work', 'Problem solving', 'Learning'],
    }
  } else if (hour >= 13 && hour < 15) {
    return {
      phase: 'afternoon-dip',
      description: 'Natural energy dip - normal biological response',
      energyTrend: 'falling',
      recommendations: [
        'Take a short break',
        'Light snack if needed',
        'Avoid important decisions',
      ],
      optimalActivities: ['Administrative tasks', 'Emails', 'Light exercise'],
    }
  } else if (hour >= 15 && hour < 18) {
    return {
      phase: 'evening-peak',
      description: 'Second wind - good time for physical activity',
      energyTrend: 'rising',
      recommendations: [
        'Physical exercise',
        'Social activities',
        'Finish important tasks',
      ],
      optimalActivities: ['Exercise', 'Socializing', 'Project completion'],
    }
  } else if (hour >= 18 && hour < 22) {
    return {
      phase: 'wind-down',
      description: 'Body preparing for sleep - start relaxing',
      energyTrend: 'falling',
      recommendations: [
        'Dim the lights',
        'Avoid screens',
        'Relaxing activities',
      ],
      optimalActivities: ['Reading', 'Meditation', 'Light stretching'],
    }
  } else {
    return {
      phase: 'deep-sleep',
      description: 'Time for restorative sleep',
      energyTrend: 'stable',
      recommendations: [
        'Sleep in dark, cool room',
        'No screens or stimulation',
        'Consistent sleep schedule',
      ],
      optimalActivities: ['Sleep', 'Rest', 'Recovery'],
    }
  }
}

/**
 * Generate personalized energy insights
 */
export function generateEnergyInsights(
  sleepDebt: SleepDebt,
  currentEnergy: EnergyLevel,
  circadianPhase: CircadianPhase,
  forecast: EnergyLevel[]
): EnergyInsight[] {
  const insights: EnergyInsight[] = []

  // Sleep debt warnings
  const debtSeverity = getSleepDebtSeverity(sleepDebt.totalHours)
  if (debtSeverity.level === 'moderate' || debtSeverity.level === 'severe') {
    insights.push({
      id: 'sleep-debt-warning',
      type: 'warning',
      title: 'Sleep Debt Detected',
      message: `You have ${sleepDebt.totalHours}h of sleep debt. This is reducing your energy levels.`,
      actionable: true,
      action: {
        label: 'See Recovery Plan',
        onClick: () => {}, // Will be implemented in component
      },
      priority: debtSeverity.level === 'severe' ? 9 : 7,
    })
  }

  // Energy predictions
  const nextPeak = forecast.find(f => f.phase === 'peak')
  const nextLow = forecast.find(f => f.phase === 'low' || f.phase === 'crash')

  if (nextPeak && differenceInMinutes(nextPeak.timestamp, new Date()) < 120) {
    insights.push({
      id: 'upcoming-peak',
      type: 'success',
      title: 'Peak Energy Approaching',
      message: `Your energy will peak at ${format(nextPeak.timestamp, 'HH:mm')}. Perfect time for important tasks.`,
      actionable: false,
      priority: 6,
    })
  }

  if (nextLow && differenceInMinutes(nextLow.timestamp, new Date()) < 60) {
    insights.push({
      id: 'upcoming-dip',
      type: 'info',
      title: 'Energy Dip Coming',
      message: `Energy will dip at ${format(nextLow.timestamp, 'HH:mm')}. Consider scheduling a break.`,
      actionable: false,
      priority: 5,
    })
  }

  // Circadian phase recommendations
  if (circadianPhase.recommendations.length > 0) {
    insights.push({
      id: 'phase-recommendation',
      type: 'tip',
      title: `${circadianPhase.phase.replace(/-/g, ' ').toUpperCase()} Phase`,
      message:
        circadianPhase.recommendations[0] || 'No specific recommendation',
      actionable: false,
      priority: 4,
    })
  }

  // Sort by priority (highest first)
  return insights.sort((a, b) => b.priority - a.priority)
}

/**
 * Calculate confidence in energy predictions
 */
function calculateConfidence(
  sleepDebt: SleepDebt,
  _settings: Partial<EnergySettings>
): number {
  let confidence = 0.8 // Base confidence

  // Reduce confidence if lots of sleep debt (less predictable)
  if (sleepDebt.totalHours > 5) {
    confidence -= 0.2
  }

  // Increase confidence if we have recent data
  const dataAge = new Date().getTime() - sleepDebt.lastUpdated.getTime()
  const hoursOld = dataAge / (1000 * 60 * 60)
  if (hoursOld < 12) {
    confidence += 0.1
  }

  return Math.max(0.3, Math.min(1.0, confidence))
}

/**
 * Get time until optimal sleep based on circadian data
 */
export function getTimeToOptimalSleep(circadianData: CircadianData): number {
  const now = new Date()
  const optimalSleepStart = circadianData.optimalSleepWindow.start

  // If we're past optimal sleep time, calculate for tomorrow
  let targetSleepTime = optimalSleepStart
  if (targetSleepTime <= now) {
    targetSleepTime = addHours(optimalSleepStart, 24)
  }

  return differenceInMinutes(targetSleepTime, now)
}

/**
 * Generate complete energy prediction
 */
export function generateEnergyPrediction(
  circadianData: CircadianData,
  sleepDebt: SleepDebt,
  settings: Partial<EnergySettings> = {}
): EnergyPrediction {
  const currentLevel = calculateCurrentEnergyLevel(
    circadianData,
    sleepDebt,
    settings
  )
  const hourlyForecast = generateEnergyForecast(
    circadianData,
    sleepDebt,
    settings
  )

  const nextPeakTime =
    hourlyForecast.find(f => f.phase === 'peak')?.timestamp ||
    addHours(new Date(), 12)
  const nextLowTime =
    hourlyForecast.find(f => f.phase === 'low' || f.phase === 'crash')
      ?.timestamp || addHours(new Date(), 6)

  return {
    currentLevel,
    hourlyForecast,
    nextPeakTime,
    nextLowTime,
    recommendedBedtime: circadianData.optimalSleepWindow.start,
    timeToOptimalSleep: getTimeToOptimalSleep(circadianData),
  }
}
