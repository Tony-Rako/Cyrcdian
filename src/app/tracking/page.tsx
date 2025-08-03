'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Moon, Sun, Clock, TrendingUp, Calendar, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { wakeDetectionService, type SleepSession } from '@/lib/wake-detection'
import { formatSleepTime, formatDuration } from '@/lib/sleep'
import { BottomNavigation } from '@/components/bottom-navigation'

export default function TrackingPage() {
  const [sleepHistory, setSleepHistory] = useState<SleepSession[]>([])
  const [averageSleep, setAverageSleep] = useState<number | null>(null)
  const [consistency, setConsistency] = useState<number | null>(null)

  useEffect(() => {
    // Load sleep data
    const history = wakeDetectionService.getSleepHistory()
    setSleepHistory(history.slice(-7)) // Show last 7 sessions

    // Calculate metrics
    const avgSleep = wakeDetectionService.getAverageSleepDuration(7)
    setAverageSleep(avgSleep)

    const consistencyScore = wakeDetectionService.getSleepConsistency(7)
    setConsistency(consistencyScore)
  }, [])

  const handleManualLog = () => {
    // For demo - would open a modal in real app
    const bedtime = new Date()
    bedtime.setHours(23, 30, 0, 0)
    bedtime.setDate(bedtime.getDate() - 1)

    const wakeTime = new Date()
    wakeTime.setHours(7, 0, 0, 0)

    wakeDetectionService.logManualSleep(bedtime, wakeTime, 4)

    // Refresh data
    const history = wakeDetectionService.getSleepHistory()
    setSleepHistory(history.slice(-7))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pb-20">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="text-center text-white">
            <h1 className="text-3xl font-bold mb-2">Sleep Tracking</h1>
            <p className="text-purple-200">
              Monitor your sleep patterns and progress
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-500/30 rounded-lg">
                      <Clock className="h-5 w-5 text-purple-300" />
                    </div>
                    <div>
                      <p className="text-purple-200 text-sm">Average Sleep</p>
                      <p className="text-white font-semibold">
                        {averageSleep
                          ? formatDuration(averageSleep / 60)
                          : 'No data'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-500/30 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-blue-300" />
                    </div>
                    <div>
                      <p className="text-purple-200 text-sm">Consistency</p>
                      <p className="text-white font-semibold">
                        {consistency ? `${consistency}%` : 'No data'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-500/30 rounded-lg">
                      <Calendar className="h-5 w-5 text-green-300" />
                    </div>
                    <div>
                      <p className="text-purple-200 text-sm">Sessions</p>
                      <p className="text-white font-semibold">
                        {sleepHistory.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Manual Log Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-semibold">
                      Manual Sleep Entry
                    </h3>
                    <p className="text-purple-200 text-sm">
                      Log sleep manually or let the app detect automatically
                    </p>
                  </div>
                  <Button
                    onClick={handleManualLog}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Sleep
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Sleep Sessions */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">
                  Recent Sleep Sessions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {sleepHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <Moon className="h-12 w-12 mx-auto text-purple-300 mb-4" />
                    <p className="text-purple-200">No sleep data yet</p>
                    <p className="text-sm text-purple-300 mt-2">
                      Sleep sessions will be automatically detected or you can
                      log them manually
                    </p>
                  </div>
                ) : (
                  sleepHistory.map((session, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="bg-white/10 rounded-lg p-4 border border-white/10"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {session.isAutoDetected ? (
                            <div className="p-2 bg-green-500/30 rounded-lg">
                              <Moon className="h-4 w-4 text-green-300" />
                            </div>
                          ) : (
                            <div className="p-2 bg-blue-500/30 rounded-lg">
                              <Clock className="h-4 w-4 text-blue-300" />
                            </div>
                          )}
                          <div>
                            <div className="flex items-center space-x-4 text-white">
                              {session.bedtime && (
                                <span className="flex items-center space-x-1">
                                  <Moon className="h-3 w-3" />
                                  <span>
                                    {formatSleepTime(session.bedtime)}
                                  </span>
                                </span>
                              )}
                              {session.wakeTime && (
                                <span className="flex items-center space-x-1">
                                  <Sun className="h-3 w-3" />
                                  <span>
                                    {formatSleepTime(session.wakeTime)}
                                  </span>
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-purple-200">
                              {session.duration
                                ? formatDuration(session.duration / 60)
                                : 'Unknown duration'}
                              {session.cycles && ` • ${session.cycles} cycles`}
                              {session.isAutoDetected
                                ? ' • Auto-detected'
                                : ' • Manual entry'}
                            </p>
                          </div>
                        </div>
                        {session.quality && (
                          <div className="text-yellow-400">
                            {'★'.repeat(session.quality)}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
      <BottomNavigation />
    </div>
  )
}
