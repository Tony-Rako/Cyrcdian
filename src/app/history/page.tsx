'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Calendar, TrendingUp, Moon, Sun } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { wakeDetectionService, type SleepSession } from '@/lib/wake-detection'
import { formatSleepTime, formatDuration } from '@/lib/sleep'
import { BottomNavigation } from '@/components/bottom-navigation'
import { format, subDays, eachDayOfInterval } from 'date-fns'

export default function HistoryPage() {
  const [sleepHistory, setSleepHistory] = useState<SleepSession[]>([])
  const [weeklyData, setWeeklyData] = useState<any[]>([])

  useEffect(() => {
    const history = wakeDetectionService.getSleepHistory()
    setSleepHistory(history)

    // Create weekly chart data
    const last7Days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date(),
    })

    const chartData = last7Days.map(day => {
      const dayStart = new Date(day)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(day)
      dayEnd.setHours(23, 59, 59, 999)

      const sessionsForDay = history.filter(
        session =>
          session.wakeTime &&
          session.wakeTime >= dayStart &&
          session.wakeTime <= dayEnd
      )

      const avgDuration =
        sessionsForDay.length > 0
          ? sessionsForDay.reduce((sum, s) => sum + (s.duration || 0), 0) /
            sessionsForDay.length /
            60
          : 0

      return {
        day: format(day, 'EEE'),
        duration: Math.round(avgDuration * 10) / 10,
        sessions: sessionsForDay.length,
      }
    })

    setWeeklyData(chartData)
  }, [])

  const getConsistencyScore = () => {
    return wakeDetectionService.getSleepConsistency(30) || 0
  }

  const getAverageQuality = () => {
    const qualityRatings = sleepHistory
      .filter(s => s.quality)
      .map(s => s.quality!)

    if (qualityRatings.length === 0) return null

    return (
      Math.round(
        (qualityRatings.reduce((sum, q) => sum + q, 0) /
          qualityRatings.length) *
          10
      ) / 10
    )
  }

  const maxDuration = Math.max(...weeklyData.map(d => d.duration), 8)

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
            <h1 className="text-3xl font-bold mb-2">Sleep History</h1>
            <p className="text-purple-200">
              Analyze your sleep patterns over time
            </p>
          </div>

          {/* Weekly Sleep Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Last 7 Days
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between space-x-2 h-32">
                  {weeklyData.map((data, index) => (
                    <motion.div
                      key={data.day}
                      initial={{ height: 0 }}
                      animate={{
                        height: `${(data.duration / maxDuration) * 100}%`,
                      }}
                      transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                      className="flex-1 bg-gradient-to-t from-purple-500 to-purple-300 rounded-t-sm min-h-[4px] relative group"
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {data.duration}h
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="flex justify-between mt-2">
                  {weeklyData.map(data => (
                    <div key={data.day} className="flex-1 text-center">
                      <span className="text-sm text-purple-200">
                        {data.day}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Monthly Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-500/30 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-blue-300" />
                    </div>
                    <div>
                      <p className="text-purple-200 text-sm">Consistency</p>
                      <p className="text-white font-semibold text-lg">
                        {getConsistencyScore()}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-yellow-500/30 rounded-lg">
                      <span className="text-yellow-300 text-lg">★</span>
                    </div>
                    <div>
                      <p className="text-purple-200 text-sm">Avg Quality</p>
                      <p className="text-white font-semibold text-lg">
                        {getAverageQuality()
                          ? `${getAverageQuality()}/5`
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
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-500/30 rounded-lg">
                      <Calendar className="h-5 w-5 text-green-300" />
                    </div>
                    <div>
                      <p className="text-purple-200 text-sm">Total Sessions</p>
                      <p className="text-white font-semibold text-lg">
                        {sleepHistory.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* All Sleep Sessions */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">All Sleep Sessions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                {sleepHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <Moon className="h-12 w-12 mx-auto text-purple-300 mb-4" />
                    <p className="text-purple-200">No sleep history yet</p>
                    <p className="text-sm text-purple-300 mt-2">
                      Start tracking your sleep to see analytics here
                    </p>
                  </div>
                ) : (
                  sleepHistory
                    .sort(
                      (a, b) =>
                        (b.wakeTime?.getTime() || 0) -
                        (a.wakeTime?.getTime() || 0)
                    )
                    .map((session, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + (index % 5) * 0.1 }}
                        className="bg-white/10 rounded-lg p-4 border border-white/10"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`p-2 rounded-lg ${
                                session.isAutoDetected
                                  ? 'bg-green-500/30'
                                  : 'bg-blue-500/30'
                              }`}
                            >
                              <Moon
                                className={`h-4 w-4 ${
                                  session.isAutoDetected
                                    ? 'text-green-300'
                                    : 'text-blue-300'
                                }`}
                              />
                            </div>
                            <div>
                              <div className="flex items-center space-x-4 text-white">
                                {session.wakeTime && (
                                  <span className="text-sm text-purple-200">
                                    {format(session.wakeTime, 'MMM d, yyyy')}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-4 text-white mt-1">
                                {session.bedtime && (
                                  <span className="flex items-center space-x-1 text-sm">
                                    <Moon className="h-3 w-3" />
                                    <span>
                                      {formatSleepTime(session.bedtime)}
                                    </span>
                                  </span>
                                )}
                                {session.wakeTime && (
                                  <span className="flex items-center space-x-1 text-sm">
                                    <Sun className="h-3 w-3" />
                                    <span>
                                      {formatSleepTime(session.wakeTime)}
                                    </span>
                                  </span>
                                )}
                                {session.duration && (
                                  <span className="text-sm text-purple-200">
                                    {formatDuration(session.duration / 60)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            {session.quality && (
                              <div className="text-yellow-400 mb-1">
                                {'★'.repeat(session.quality)}
                              </div>
                            )}
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                session.isAutoDetected
                                  ? 'bg-green-500/20 text-green-300'
                                  : 'bg-blue-500/20 text-blue-300'
                              }`}
                            >
                              {session.isAutoDetected ? 'Auto' : 'Manual'}
                            </span>
                          </div>
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
