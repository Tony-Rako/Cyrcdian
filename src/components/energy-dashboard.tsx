'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Zap,
  Battery,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Info,
  Target,
  Moon,
  Sun,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  getCircadianData,
  getCurrentLocation,
  type CircadianData,
  type LocationCoords as _LocationCoords,
} from '@/lib/circadian'
import {
  calculateSleepDebt,
  getSleepSessions,
  getSleepDebtSeverity,
  getSleepDebtRecovery,
} from '@/lib/sleep-debt'
import {
  generateEnergyPrediction,
  getCurrentCircadianPhase,
  generateEnergyInsights,
} from '@/lib/energy-tracking'
import { format, addHours as _addHours } from 'date-fns'
import {
  EnergyData as _EnergyData,
  SleepDebt,
  EnergyPrediction,
  CircadianPhase,
  EnergyInsight,
} from '@/types/energy'

export function EnergyDashboard() {
  const [circadianData, setCircadianData] = useState<CircadianData | null>(null)
  const [sleepDebt, setSleepDebt] = useState<SleepDebt | null>(null)
  const [energyPrediction, setEnergyPrediction] =
    useState<EnergyPrediction | null>(null)
  const [circadianPhase, setCircadianPhase] = useState<CircadianPhase | null>(
    null
  )
  const [insights, setInsights] = useState<EnergyInsight[]>([])
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  // Initialize circadian data and calculations
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Get user location and circadian data
        const userLocation = await getCurrentLocation()
        const circadian = getCircadianData(new Date(), userLocation)
        setCircadianData(circadian)

        // Calculate sleep debt from stored sessions
        const sessions = getSleepSessions()
        const debt = calculateSleepDebt(sessions)
        setSleepDebt(debt)

        // Generate energy predictions
        const prediction = generateEnergyPrediction(circadian, debt)
        setEnergyPrediction(prediction)

        // Get current circadian phase
        const phase = getCurrentCircadianPhase(
          circadian,
          prediction.currentLevel
        )
        setCircadianPhase(phase)

        // Generate insights
        const generatedInsights = generateEnergyInsights(
          debt,
          prediction.currentLevel,
          phase,
          prediction.hourlyForecast
        )
        setInsights(generatedInsights)
      } catch (_error) {
        console.error('Error initializing energy data:', _error)
        // Fallback with default data
        const circadian = getCircadianData(new Date())
        setCircadianData(circadian)
        const debt = calculateSleepDebt([])
        setSleepDebt(debt)
      }
    }

    initializeData()
  }, [])

  // Recalculate energy prediction every minute
  useEffect(() => {
    if (circadianData && sleepDebt) {
      const prediction = generateEnergyPrediction(circadianData, sleepDebt)
      setEnergyPrediction(prediction)

      const phase = getCurrentCircadianPhase(
        circadianData,
        prediction.currentLevel
      )
      setCircadianPhase(phase)
    }
  }, [currentTime, circadianData, sleepDebt])

  if (!circadianData || !sleepDebt || !energyPrediction || !circadianPhase) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <Zap className="h-12 w-12 mx-auto mb-4 animate-pulse" />
          <p>Loading your energy data...</p>
        </div>
      </div>
    )
  }

  const debtSeverity = getSleepDebtSeverity(sleepDebt.totalHours)
  const recovery = getSleepDebtRecovery(sleepDebt.totalHours)
  const hoursToSleep = Math.floor(energyPrediction.timeToOptimalSleep / 60)
  const minutesToSleep = energyPrediction.timeToOptimalSleep % 60

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pb-20">
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-white"
        >
          <h1 className="text-4xl font-bold mb-2 flex items-center justify-center">
            <Zap className="h-8 w-8 mr-3 text-yellow-400" />
            Energy
          </h1>
          <p className="text-purple-200">Optimize your daily energy rhythm</p>
        </motion.div>

        {/* Current Energy Level */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div
                    className={`p-4 rounded-full ${
                      energyPrediction.currentLevel.phase === 'peak'
                        ? 'bg-green-500/30'
                        : energyPrediction.currentLevel.phase === 'moderate'
                          ? 'bg-yellow-500/30'
                          : energyPrediction.currentLevel.phase === 'low'
                            ? 'bg-orange-500/30'
                            : 'bg-red-500/30'
                    }`}
                  >
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-white">
                      {energyPrediction.currentLevel.level}%
                    </h3>
                    <p className="text-purple-200 capitalize">
                      {energyPrediction.currentLevel.phase} Energy
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-purple-200 mb-1">
                    {circadianPhase.energyTrend === 'rising' ? (
                      <TrendingUp className="h-4 w-4 mr-1 text-green-400" />
                    ) : circadianPhase.energyTrend === 'falling' ? (
                      <TrendingDown className="h-4 w-4 mr-1 text-orange-400" />
                    ) : (
                      <Target className="h-4 w-4 mr-1 text-blue-400" />
                    )}
                    <span className="text-sm">
                      {circadianPhase.energyTrend}
                    </span>
                  </div>
                  <p className="text-xs text-purple-300">
                    {Math.round(energyPrediction.currentLevel.confidence * 100)}
                    % confidence
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Energy Timeline */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                24-Hour Energy Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Timeline visualization */}
                <div className="relative h-24 bg-black/20 rounded-lg overflow-hidden">
                  <div className="absolute inset-0 flex">
                    {energyPrediction.hourlyForecast
                      .slice(0, 24)
                      .map((forecast, index) => {
                        const width = 100 / 24
                        const height = (forecast.level / 100) * 80 + 10
                        const isCurrentHour = index === 0

                        return (
                          <div
                            key={index}
                            className="flex flex-col justify-end relative"
                            style={{ width: `${width}%` }}
                          >
                            <div
                              className={`transition-all duration-300 ${
                                forecast.phase === 'peak'
                                  ? 'bg-green-400'
                                  : forecast.phase === 'moderate'
                                    ? 'bg-yellow-400'
                                    : forecast.phase === 'low'
                                      ? 'bg-orange-400'
                                      : 'bg-red-400'
                              } ${isCurrentHour ? 'ring-2 ring-white' : ''}`}
                              style={{ height: `${height}%` }}
                            />
                            {isCurrentHour && (
                              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                  </div>
                </div>

                {/* Timeline labels */}
                <div className="flex justify-between text-xs text-purple-200">
                  <span>Now</span>
                  <span>+6h</span>
                  <span>+12h</span>
                  <span>+18h</span>
                  <span>+24h</span>
                </div>

                {/* Next peak/low indicators */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center text-green-400 mb-1">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">Next Peak</span>
                    </div>
                    <p className="text-white font-mono">
                      {format(energyPrediction.nextPeakTime, 'HH:mm')}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center text-orange-400 mb-1">
                      <TrendingDown className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">Next Dip</span>
                    </div>
                    <p className="text-white font-mono">
                      {format(energyPrediction.nextLowTime, 'HH:mm')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sleep Debt Meter */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Battery className="h-5 w-5 mr-2" />
                Sleep Debt
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Debt meter */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-purple-200">Debt Level</span>
                  <span
                    className={`font-medium ${
                      debtSeverity.color === 'green'
                        ? 'text-green-400'
                        : debtSeverity.color === 'yellow'
                          ? 'text-yellow-400'
                          : debtSeverity.color === 'orange'
                            ? 'text-orange-400'
                            : 'text-red-400'
                    }`}
                  >
                    {sleepDebt.totalHours.toFixed(1)}h{' '}
                    {debtSeverity.description}
                  </span>
                </div>

                <div className="h-3 bg-black/30 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      debtSeverity.color === 'green'
                        ? 'bg-green-400'
                        : debtSeverity.color === 'yellow'
                          ? 'bg-yellow-400'
                          : debtSeverity.color === 'orange'
                            ? 'bg-orange-400'
                            : 'bg-red-400'
                    }`}
                    style={{
                      width: `${Math.min(100, (sleepDebt.totalHours / 10) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Recovery info */}
              {sleepDebt.totalHours > 1 && (
                <div className="bg-black/20 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">
                        Recovery Timeline
                      </p>
                      <p className="text-purple-200 text-sm">
                        {recovery.daysToRecover} days with extra sleep
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-mono">
                        {format(recovery.recoveryDate, 'MMM dd')}
                      </p>
                      <p className="text-purple-200 text-xs">Target date</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Sleep Countdown */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-400/30 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="text-center">
                <Moon className="h-8 w-8 mx-auto mb-3 text-purple-300" />
                <h3 className="text-2xl font-bold text-white mb-2">
                  {hoursToSleep > 0
                    ? `${hoursToSleep}h ${minutesToSleep}m`
                    : `${minutesToSleep}m`}
                </h3>
                <p className="text-purple-200">Until optimal bedtime</p>
                <p className="text-sm text-purple-300 mt-1">
                  Recommended:{' '}
                  {format(energyPrediction.recommendedBedtime, 'HH:mm')}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Current Phase & Recommendations */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center capitalize">
                <Sun className="h-5 w-5 mr-2" />
                {circadianPhase.phase.replace('-', ' ')} Phase
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-purple-200">{circadianPhase.description}</p>

              <div>
                <h4 className="text-white font-medium mb-2">
                  Recommendations:
                </h4>
                <ul className="space-y-1">
                  {circadianPhase.recommendations.map((rec, index) => (
                    <li
                      key={index}
                      className="text-purple-200 text-sm flex items-start"
                    >
                      <CheckCircle className="h-3 w-3 mr-2 mt-0.5 text-green-400 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-white font-medium mb-2">
                  Optimal Activities:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {circadianPhase.optimalActivities.map((activity, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-purple-500/30 text-purple-200 text-xs rounded-full"
                    >
                      {activity}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Insights */}
        {insights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Smart Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights.slice(0, 3).map(insight => (
                  <div
                    key={insight.id}
                    className={`p-3 rounded-lg border ${
                      insight.type === 'warning'
                        ? 'bg-red-500/20 border-red-400/30'
                        : insight.type === 'success'
                          ? 'bg-green-500/20 border-green-400/30'
                          : insight.type === 'info'
                            ? 'bg-blue-500/20 border-blue-400/30'
                            : 'bg-purple-500/20 border-purple-400/30'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {insight.type === 'warning' && (
                          <AlertTriangle className="h-4 w-4 text-red-400" />
                        )}
                        {insight.type === 'success' && (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        )}
                        {insight.type === 'info' && (
                          <Info className="h-4 w-4 text-blue-400" />
                        )}
                        {insight.type === 'tip' && (
                          <Zap className="h-4 w-4 text-purple-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-medium text-sm">
                          {insight.title}
                        </h4>
                        <p className="text-purple-200 text-xs mt-1">
                          {insight.message}
                        </p>
                        {insight.actionable && insight.action && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2 text-xs"
                            onClick={insight.action.onClick}
                          >
                            {insight.action.label}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
