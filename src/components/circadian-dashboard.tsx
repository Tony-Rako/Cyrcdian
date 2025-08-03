'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Sun, Moon, Clock, Timer, Bell } from 'lucide-react'
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
  calculateOptimalBedtimes,
  getTimeRemaining,
  formatSleepTime,
  parseWakeTime,
} from '@/lib/sleep'
import { wakeDetectionService } from '@/lib/wake-detection'
import { notificationService } from '@/lib/notifications'
import { BottomNavigation } from '@/components/bottom-navigation'

export function CircadianDashboard() {
  const [circadianData, setCircadianData] = useState<CircadianData | null>(null)
  const [_location, setLocation] = useState<LocationCoords | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [wakeTime, setWakeTime] = useState('07:00')
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

  // Calculate remaining awake time based on optimal bedtime
  useEffect(() => {
    if (!wakeTime) return

    const targetWakeTime = parseWakeTime(wakeTime)
    const sleepCalculation = calculateOptimalBedtimes(targetWakeTime)
    const optimalBedtime = sleepCalculation.recommendedBedtimes.find(
      bt => bt.quality === 'optimal'
    )

    if (optimalBedtime && optimalBedtime.bedtime > currentTime) {
      const remaining = getTimeRemaining(optimalBedtime.bedtime)
      setAwakeTimeRemaining(remaining)
    } else {
      setAwakeTimeRemaining('')
    }
  }, [wakeTime, currentTime])

  // Start wake detection service
  useEffect(() => {
    wakeDetectionService.start()
    return () => wakeDetectionService.stop()
  }, [])

  const sunPhase = circadianData ? getCurrentSunPhase(circadianData) : null
  const sleepCalculation = calculateOptimalBedtimes(parseWakeTime(wakeTime))

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
      <div className="container mx-auto px-4 py-8">
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

          {/* Wake Time Input */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Sun className="h-5 w-5 mr-2" />
                  Set Wake Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <input
                    type="time"
                    value={wakeTime}
                    onChange={e => setWakeTime(e.target.value)}
                    className="bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white text-xl font-mono focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                  <p className="text-purple-200">
                    When do you want to wake up?
                  </p>
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

          {/* Optimal Bedtimes */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Moon className="h-5 w-5 mr-2" />
                  Optimal Bedtimes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {sleepCalculation.recommendedBedtimes.map((bedtime, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className={`p-4 rounded-lg border ${
                      bedtime.quality === 'optimal'
                        ? 'bg-purple-500/30 border-purple-400/50'
                        : 'bg-white/10 border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <Moon className="h-4 w-4 text-purple-300" />
                          <span className="text-xl font-semibold text-white">
                            {formatSleepTime(bedtime.bedtime)}
                          </span>
                          <span className="text-sm text-purple-200">
                            ({bedtime.duration}h)
                          </span>
                        </div>
                        <p className="text-sm text-purple-200 mt-1">
                          {bedtime.cycles} cycles • {bedtime.quality}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {bedtime.quality === 'optimal' && (
                          <div className="text-purple-300 mr-2">
                            <span className="text-sm font-medium">
                              Recommended
                            </span>
                          </div>
                        )}
                        <Button
                          size="sm"
                          onClick={async () => {
                            const targetWakeTime = parseWakeTime(wakeTime)
                            await notificationService.scheduleBedtimeReminder(
                              bedtime.bedtime,
                              targetWakeTime
                            )
                            await notificationService.scheduleWakeAlarm(
                              targetWakeTime
                            )
                          }}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <Bell className="h-3 w-3 mr-1" />
                          Alarm
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

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
