export interface EnergyLevel {
  timestamp: Date
  level: number // 0-100 (0 = exhausted, 100 = peak energy)
  phase: 'peak' | 'moderate' | 'low' | 'crash'
  confidence: number // 0-1 (how confident we are in this prediction)
}

export interface SleepDebt {
  totalHours: number // Total accumulated sleep debt in hours
  dailyDeficit: number // Today's sleep deficit/surplus in hours
  weeklyAverage: number // Average sleep debt over past 7 days
  optimalSleepHours: number // User's optimal sleep duration
  lastUpdated: Date
}

export interface EnergyPrediction {
  currentLevel: EnergyLevel
  hourlyForecast: EnergyLevel[] // Next 24 hours
  nextPeakTime: Date
  nextLowTime: Date
  recommendedBedtime: Date
  timeToOptimalSleep: number // Minutes until recommended bedtime
}

export interface CircadianPhase {
  phase:
    | 'morning-rise'
    | 'morning-peak'
    | 'afternoon-dip'
    | 'evening-peak'
    | 'wind-down'
    | 'deep-sleep'
  description: string
  energyTrend: 'rising' | 'stable' | 'falling'
  recommendations: string[]
  optimalActivities: string[]
}

export interface EnergyInsight {
  id: string
  type: 'warning' | 'info' | 'success' | 'tip'
  title: string
  message: string
  actionable: boolean
  action?: {
    label: string
    onClick: () => void
  }
  priority: number // 1-10 (10 = highest priority)
  expiresAt?: Date
}

export interface SleepSession {
  date: Date
  bedtime: Date
  wakeTime: Date
  actualSleepHours: number
  plannedSleepHours: number
  quality: 'poor' | 'fair' | 'good' | 'excellent'
  sleepDebtImpact: number // How much this session affected sleep debt (+/-)
  source: 'automatic' | 'manual' // How this data was collected
}

export interface EnergyData {
  sleepDebt: SleepDebt
  prediction: EnergyPrediction
  currentPhase: CircadianPhase
  insights: EnergyInsight[]
  recentSleep: SleepSession[]
  lastCalculated: Date
}

export interface EnergySettings {
  optimalSleepDuration: number // Hours (e.g., 8)
  bedtimeBuffer: number // Minutes before sleep time to start winding down
  wakeTimeConsistency: number // How consistent wake times should be (0-1)
  energyNotifications: boolean
  sleepDebtThreshold: number // Hours of debt before warnings
  chronotype: 'morning' | 'evening' | 'intermediate' // User's natural sleep preference
}

export interface EnergyMetrics {
  weeklyAverageEnergy: number
  sleepConsistencyScore: number // 0-100
  circadianAlignmentScore: number // 0-100
  energyTrend: 'improving' | 'stable' | 'declining'
  sleepEfficiency: number // Actual sleep / time in bed
  chronotypeAlignment: number // How well schedule matches natural rhythm
}
