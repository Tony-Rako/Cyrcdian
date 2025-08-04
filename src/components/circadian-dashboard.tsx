'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Sun, Moon, Clock, Timer, Bell, Copy, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  getCircadianData,
  getCurrentLocation,
  getCurrentSunPhase,
  type CircadianData,
  type LocationCoords,
} from '@/lib/circadian'
import {
  calculateEnhancedSleepSchedule,
  getTimeRemaining,
  formatSleepTime,
  formatAwakeDuration,
  getTimeDifference,
  parseWakeTime,
  type EnhancedSleepCalculation,
} from '@/lib/sleep'
import { wakeDetectionService } from '@/lib/wake-detection'
import { notificationService } from '@/lib/notifications'
import { BottomNavigation } from '@/components/bottom-navigation'

export function CircadianDashboard() {
  const [circadianData, setCircadianData] = useState<CircadianData | null>(null)
  const [_location, setLocation] = useState<LocationCoords | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [currentWakeTime, setCurrentWakeTime] = useState('09:45')
  const [targetWakeTime, setTargetWakeTime] = useState('04:15')
  const [customAwakeDuration, setCustomAwakeDuration] = useState<
    number | undefined
  >(undefined)
  const [enhancedCalculation, setEnhancedCalculation] =
    useState<EnhancedSleepCalculation | null>(null)
  const [awakeTimeRemaining, setAwakeTimeRemaining] = useState<string>('')

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  // Get user location and calculate circadian data
  useEffect(() => {
    const initializeCircadianData = async () => {
      try {
        const userLocation = await getCurrentLocation()
        setLocation(userLocation)

        const data = getCircadianData(new Date(), userLocation)
        setCircadianData(data)
      } catch {
        // Fallback to default location
        const data = getCircadianData(new Date())
        setCircadianData(data)
      }
    }

    initializeCircadianData()
  }, [])

  // Calculate enhanced sleep schedule and remaining awake time
  useEffect(() => {
    if (!currentWakeTime || !targetWakeTime) return

    try {
      const currentWake = parseWakeTime(currentWakeTime)
      const targetWake = parseWakeTime(targetWakeTime)

      // Ensure target wake time is after current wake time
      if (targetWake <= currentWake) {
        targetWake.setDate(targetWake.getDate() + 1)
      }

      const calculation = calculateEnhancedSleepSchedule(
        currentWake,
        targetWake,
        customAwakeDuration
      )

      setEnhancedCalculation(calculation)

      // Calculate remaining awake time until best bedtime alarm
      if (
        calculation.bestMatch &&
        calculation.bestMatch.bedtimeAlarm > currentTime
      ) {
        const remaining = getTimeRemaining(calculation.bestMatch.bedtimeAlarm)
        setAwakeTimeRemaining(remaining)
      } else {
        setAwakeTimeRemaining('')
      }
    } catch (error) {
      console.warn('Sleep calculation error:', error)
      setEnhancedCalculation(null)
      setAwakeTimeRemaining('')
    }
  }, [currentWakeTime, targetWakeTime, customAwakeDuration, currentTime])

  // Start wake detection service
  useEffect(() => {
    wakeDetectionService.start()
    return () => wakeDetectionService.stop()
  }, [])

  const sunPhase = circadianData ? getCurrentSunPhase(circadianData) : null

  const getSunPhaseColor = (phase: string) => {
    switch (phase) {
      case 'dawn':
        return 'from-orange-400 to-yellow-400'
      case 'day':
        return 'from-blue-400 to-cyan-400'
      case 'dusk':
        return 'from-purple-400 to-pink-400'
      case 'night':
        return 'from-purple-600 to-indigo-800'
      default:
        return 'from-gray-400 to-gray-600'
    }
  }

  const getSunPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'dawn':
      case 'day':
        return <Sun className="h-8 w-8" />
      case 'dusk':
      case 'night':
        return <Moon className="h-8 w-8" />
      default:
        return <Clock className="h-8 w-8" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-2">Cyrcdian</h1>
            <p className="text-purple-200">Optimize your circadian rhythm</p>
          </div>

          {/* Sun Phase Card */}
          {sunPhase && (
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
                        className={`p-3 rounded-full bg-gradient-to-r ${getSunPhaseColor(sunPhase.phase)}`}
                      >
                        {getSunPhaseIcon(sunPhase.phase)}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white capitalize">
                          {sunPhase.phase}
                        </h3>
                        <p className="text-purple-200">Current sun phase</p>
                      </div>
                    </div>
                    <div className="text-right text-white">
                      <p className="text-sm text-purple-200">
                        Next transition in
                      </p>
                      <p className="text-lg font-semibold">
                        {Math.floor(sunPhase.timeToNext / 60)}h{' '}
                        {sunPhase.timeToNext % 60}m
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Dual Wake Time Inputs */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Sleep Schedule Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-purple-200 font-medium">
                      Current Wake Time (Today)
                    </label>
                    <input
                      type="time"
                      value={currentWakeTime}
                      onChange={e => setCurrentWakeTime(e.target.value)}
                      className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white text-xl font-mono focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-purple-200 font-medium">
                      Desired Wake Time (Tomorrow)
                    </label>
                    <input
                      type="time"
                      value={targetWakeTime}
                      onChange={e => setTargetWakeTime(e.target.value)}
                      className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white text-xl font-mono focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>
                </div>

                {/* Custom Awake Duration */}
                <div className="space-y-2">
                  <label className="text-sm text-purple-200 font-medium">
                    Custom Awake Duration (Optional, 11.5-14.5 hours)
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="number"
                      min="11.5"
                      max="14.5"
                      step="0.5"
                      value={customAwakeDuration || ''}
                      onChange={e =>
                        setCustomAwakeDuration(
                          e.target.value
                            ? parseFloat(e.target.value)
                            : undefined
                        )
                      }
                      placeholder="e.g., 13.0"
                      className="bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white font-mono focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                    <span className="text-purple-200">hours</span>
                    {customAwakeDuration && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCustomAwakeDuration(undefined)}
                        className="text-purple-200 border-purple-400/50 hover:bg-purple-400/20"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Countdown Timer */}
          {awakeTimeRemaining && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-400/30 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center space-x-4">
                    <Timer className="h-8 w-8 text-purple-300" />
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-white">
                        {awakeTimeRemaining}
                      </h3>
                      <p className="text-purple-200">
                        Remaining awake time until optimal bedtime
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Enhanced Sleep Options */}
          {enhancedCalculation && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Moon className="h-5 w-5 mr-2" />
                    Sleep Schedule Options
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {enhancedCalculation.sleepOptions.map((option, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className={`p-4 rounded-lg border ${
                        option.quality === 'recommended' ||
                        option === enhancedCalculation.bestMatch
                          ? 'bg-purple-500/30 border-purple-400/50'
                          : option.quality === 'custom'
                            ? 'bg-blue-500/20 border-blue-400/40'
                            : 'bg-white/10 border-white/20'
                      }`}
                    >
                      <div className="space-y-4">
                        {/* Header with awake duration and quality */}
                        <div className="flex items-start justify-between">
                          <div className="flex flex-col space-y-2">
                            <div className="flex items-center space-x-3">
                              <span className="text-xl font-bold text-white">
                                {formatAwakeDuration(option.awakeHours)}
                              </span>
                              <span className="text-sm text-purple-200 font-medium">
                                awake
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span
                                className={`text-xs px-3 py-1 rounded-full font-semibold ${
                                  option.quality === 'recommended'
                                    ? 'bg-purple-600 text-white'
                                    : option.quality === 'custom'
                                      ? 'bg-blue-600 text-white'
                                      : option.quality === 'short'
                                        ? 'bg-orange-600 text-white'
                                        : 'bg-indigo-600 text-white'
                                }`}
                              >
                                {option.quality.toUpperCase()}
                              </span>
                              {option === enhancedCalculation.bestMatch && (
                                <span className="text-xs px-3 py-1 rounded-full bg-green-600 text-white font-semibold">
                                  BEST MATCH
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-purple-200 font-medium mb-1">
                              Match Score
                            </div>
                            <div className="text-2xl font-bold text-white">
                              {option.matchScore}%
                            </div>
                          </div>
                        </div>

                        {/* Sleep timing details */}
                        <div className="bg-black/20 rounded-lg p-4 space-y-3">
                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <div className="text-xs text-purple-300 font-medium uppercase tracking-wide">
                                Bedtime Alarm
                              </div>
                              <div className="text-white font-bold text-2xl">
                                {formatSleepTime(option.bedtimeAlarm)}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="text-xs text-purple-300 font-medium uppercase tracking-wide">
                                Actual Sleep
                              </div>
                              <div className="text-white font-bold text-2xl">
                                {formatSleepTime(option.actualSleepTime)}
                              </div>
                            </div>
                          </div>

                          <div className="border-t border-white/10 pt-3">
                            <div className="grid grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <div className="text-xs text-purple-300 font-medium uppercase tracking-wide">
                                  Wake Time
                                </div>
                                <div className="text-white font-bold text-2xl">
                                  {formatSleepTime(option.calculatedWakeTime)}
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="text-xs text-purple-300 font-medium uppercase tracking-wide">
                                  Sleep Duration
                                </div>
                                <div className="text-white font-bold text-lg">
                                  {formatAwakeDuration(
                                    option.actualSleepDuration
                                  )}
                                </div>
                                <div className="text-purple-200 text-sm font-medium">
                                  {option.cycles} complete cycles
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Wake time difference and action */}
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex flex-col space-y-1">
                            <div className="text-xs text-purple-300 font-medium uppercase tracking-wide">
                              Target Difference
                            </div>
                            <div className="text-sm text-white font-semibold">
                              {getTimeDifference(
                                option.calculatedWakeTime,
                                enhancedCalculation.targetWakeTime
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2">
                            <Button
                              size="lg"
                              onClick={async () => {
                                // Schedule web notifications
                                await notificationService.scheduleBedtimeReminder(
                                  option.bedtimeAlarm,
                                  option.calculatedWakeTime
                                )
                                await notificationService.scheduleWakeAlarm(
                                  option.calculatedWakeTime
                                )

                                // Show iOS integration options
                                const capabilities =
                                  notificationService.getDeviceCapabilities()
                                if (capabilities.isIOS) {
                                  const shouldCreateShortcuts = confirm(
                                    '🍎 iOS detected! Would you like to create Shortcuts for reliable iOS alarms?\n\n' +
                                      'This will help ensure your alarms work even when the app is closed.'
                                  )

                                  if (shouldCreateShortcuts) {
                                    // Get the alarm IDs (bedtime-reminder and wake-alarm are the default IDs)
                                    setTimeout(async () => {
                                      await notificationService.createIOSShortcut(
                                        'bedtime-reminder'
                                      )
                                      await notificationService.createIOSShortcut(
                                        'wake-alarm'
                                      )
                                    }, 1000)
                                  }
                                }
                              }}
                              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                              <Bell className="h-4 w-4 mr-2" />
                              Set Alarms
                            </Button>

                            {/* iOS Quick Actions */}
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={async () => {
                                  await notificationService.copyAlarmTime(
                                    'bedtime-reminder'
                                  )
                                }}
                                className="flex-1 border-green-400/30 text-green-200 hover:bg-green-500/10 text-xs h-7"
                              >
                                <Copy className="h-3 w-3 mr-1" />
                                Copy
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={async () => {
                                  await notificationService.addAlarmToCalendar(
                                    'wake-alarm'
                                  )
                                }}
                                className="flex-1 border-orange-400/30 text-orange-200 hover:bg-orange-500/10 text-xs h-7"
                              >
                                <Calendar className="h-3 w-3 mr-1" />
                                Cal
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Circadian Information */}
          {circadianData && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">
                    Today&apos;s Sun Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-200">Sunrise</span>
                      <span className="text-white font-medium">
                        {formatSleepTime(circadianData.sunrise)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-purple-200">Solar Noon</span>
                      <span className="text-white font-medium">
                        {formatSleepTime(circadianData.solarNoon)}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-200">Sunset</span>
                      <span className="text-white font-medium">
                        {formatSleepTime(circadianData.sunset)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-purple-200">Night</span>
                      <span className="text-white font-medium">
                        {formatSleepTime(circadianData.nauticalDusk)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
      <BottomNavigation />
    </div>
  )
}
