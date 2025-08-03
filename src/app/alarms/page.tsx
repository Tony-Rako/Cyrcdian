'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Bell,
  Moon,
  Sun,
  Plus,
  Settings,
  Trash2,
  Power as _Power,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { notificationService, type AlarmOptions } from '@/lib/notifications'
import { formatSleepTime } from '@/lib/sleep'
import { BottomNavigation } from '@/components/bottom-navigation'

export default function AlarmsPage() {
  const [alarms, setAlarms] = useState<AlarmOptions[]>([])
  const [permissionStatus, setPermissionStatus] = useState(
    notificationService.getPermissionStatus()
  )

  useEffect(() => {
    loadAlarms()
    setPermissionStatus(notificationService.getPermissionStatus())
  }, [])

  const loadAlarms = () => {
    const currentAlarms = notificationService.getAlarms()
    setAlarms(currentAlarms)
  }

  const handleRequestPermission = async () => {
    const status = await notificationService.requestPermission()
    setPermissionStatus(status)
  }

  const handleToggleAlarm = (id: string, enabled: boolean) => {
    notificationService.toggleAlarm(id, enabled)
    loadAlarms()
  }

  const handleDeleteAlarm = (id: string) => {
    notificationService.cancelAlarm(id)
    loadAlarms()
  }

  const handleTestNotification = async () => {
    await notificationService.showNotification(
      '🔔 Test Notification',
      'This is how your alarms will appear!'
    )
  }

  const handleQuickBedtimeAlarm = async () => {
    const now = new Date()
    const bedtime = new Date(now)
    bedtime.setHours(22, 30, 0, 0)

    // If 22:30 has passed today, set for tomorrow
    if (bedtime <= now) {
      bedtime.setDate(bedtime.getDate() + 1)
    }

    const wakeTime = new Date(bedtime)
    wakeTime.setHours(7, 0, 0, 0)
    wakeTime.setDate(wakeTime.getDate() + 1)

    await notificationService.scheduleBedtimeReminder(bedtime, wakeTime)
    await notificationService.scheduleWakeAlarm(wakeTime)
    loadAlarms()
  }

  const getAlarmIcon = (type: 'bedtime' | 'wake') => {
    return type === 'bedtime' ? Moon : Sun
  }

  const getAlarmColor = (type: 'bedtime' | 'wake') => {
    return type === 'bedtime' ? 'purple' : 'orange'
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
            <h1 className="text-3xl font-bold mb-2">Alarms & Notifications</h1>
            <p className="text-purple-200">
              Manage your sleep reminders and wake-up alarms
            </p>
          </div>

          {/* Permission Status */}
          {!permissionStatus.granted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-yellow-500/20 border-yellow-400/30 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Bell className="h-5 w-5 text-yellow-300" />
                      <div>
                        <h3 className="text-white font-semibold">
                          Enable Notifications
                        </h3>
                        <p className="text-yellow-200 text-sm">
                          Allow notifications to receive bedtime reminders and
                          wake-up alarms
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleRequestPermission}
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      Enable
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Quick Setup</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={handleQuickBedtimeAlarm}
                  className="bg-purple-600 hover:bg-purple-700 flex items-center justify-center space-x-2"
                  disabled={!permissionStatus.granted}
                >
                  <Moon className="h-4 w-4" />
                  <span>Default Sleep Schedule</span>
                </Button>

                <Button
                  onClick={handleTestNotification}
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 flex items-center justify-center space-x-2"
                  disabled={!permissionStatus.granted}
                >
                  <Bell className="h-4 w-4" />
                  <span>Test Notification</span>
                </Button>

                <Button
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 flex items-center justify-center space-x-2"
                  disabled
                >
                  <Plus className="h-4 w-4" />
                  <span>Custom Alarm</span>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Active Alarms */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span>Active Alarms</span>
                  <span className="text-sm font-normal text-purple-200">
                    {alarms.filter(a => a.isEnabled).length} enabled
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {alarms.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 mx-auto text-purple-300 mb-4" />
                    <p className="text-purple-200">No alarms set</p>
                    <p className="text-sm text-purple-300 mt-2">
                      Use quick setup or create custom alarms to get started
                    </p>
                  </div>
                ) : (
                  alarms.map((alarm, index) => {
                    const Icon = getAlarmIcon(alarm.type)
                    const color = getAlarmColor(alarm.type)

                    return (
                      <motion.div
                        key={alarm.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className="bg-white/10 rounded-lg p-4 border border-white/10"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`p-2 bg-${color}-500/30 rounded-lg`}
                            >
                              <Icon className={`h-5 w-5 text-${color}-300`} />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xl font-semibold text-white">
                                  {formatSleepTime(alarm.time)}
                                </span>
                                <span
                                  className={`text-xs px-2 py-1 rounded-full bg-${color}-500/20 text-${color}-300`}
                                >
                                  {alarm.type === 'bedtime'
                                    ? 'Bedtime'
                                    : 'Wake up'}
                                </span>
                              </div>
                              <p className="text-sm text-purple-200 mt-1">
                                {alarm.label}
                              </p>
                              <p className="text-xs text-purple-300">
                                {alarm.time > new Date()
                                  ? `In ${Math.ceil((alarm.time.getTime() - new Date().getTime()) / (1000 * 60 * 60))} hours`
                                  : 'Past due'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <Switch
                              checked={alarm.isEnabled}
                              onCheckedChange={checked =>
                                handleToggleAlarm(alarm.id, checked)
                              }
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAlarm(alarm.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* iOS Integration Info */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-blue-500/20 border-blue-400/30 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Settings className="h-5 w-5 text-blue-300 mt-1" />
                  <div>
                    <h3 className="text-white font-semibold mb-2">
                      iOS Integration
                    </h3>
                    <p className="text-blue-200 text-sm mb-3">
                      On iOS devices, tapping alarm notifications will attempt
                      to open the Clock app for additional alarm management.
                    </p>
                    <div className="text-xs text-blue-300 space-y-1">
                      <div>• Web alarms work when the app is open</div>
                      <div>• For background alarms, use the iOS Clock app</div>
                      <div>
                        • Notifications require permission and active browser
                        tab
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
      <BottomNavigation />
    </div>
  )
}
