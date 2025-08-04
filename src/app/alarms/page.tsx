'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Bell,
  Moon,
  Sun,
  Settings,
  Trash2,
  Copy,
  Calendar,
  Smartphone,
  TestTube,
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
  const [deviceCapabilities] = useState(
    notificationService.getDeviceCapabilities()
  )
  const [testResults, setTestResults] = useState<{
    notifications: boolean
    vibration: boolean
    sound: boolean
    iosIntegration: boolean
  } | null>(null)
  const [isTestingSystem, setIsTestingSystem] = useState(false)

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

  const handleTestSystem = async () => {
    setIsTestingSystem(true)
    try {
      const results = await notificationService.testAlarmSystem()
      setTestResults(results)
    } catch (error) {
      console.error('System test failed:', error)
    } finally {
      setIsTestingSystem(false)
    }
  }

  const handleCopyTime = async (alarmId: string) => {
    const success = await notificationService.copyAlarmTime(alarmId)
    if (!success) {
      alert('Failed to copy time to clipboard')
    }
  }

  const handleAddToCalendar = async (alarmId: string) => {
    await notificationService.addAlarmToCalendar(alarmId)
  }

  const handleCreateShortcut = async (alarmId: string) => {
    await notificationService.createIOSShortcut(alarmId)
  }

  const handleShowInstructions = (alarmId: string) => {
    const instructions = notificationService.getIOSSetupInstructions(alarmId)
    if (instructions) {
      alert(instructions)
    }
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
                <CardTitle className="text-white flex items-center justify-between">
                  <span>Quick Setup</span>
                  {deviceCapabilities.isIOS && (
                    <span className="text-xs bg-blue-500/30 text-blue-200 px-2 py-1 rounded-full">
                      iOS Enhanced
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={handleQuickBedtimeAlarm}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 flex items-center justify-center space-x-2 h-12"
                    disabled={!permissionStatus.granted}
                  >
                    <Moon className="h-5 w-5" />
                    <span>Default Sleep Schedule</span>
                  </Button>

                  <Button
                    onClick={handleTestNotification}
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10 flex items-center justify-center space-x-2 h-12"
                    disabled={!permissionStatus.granted}
                  >
                    <Bell className="h-5 w-5" />
                    <span>Test Notification</span>
                  </Button>
                </div>

                {/* System Test */}
                <div className="border-t border-white/10 pt-4">
                  <Button
                    onClick={handleTestSystem}
                    variant="outline"
                    className="w-full border-green-500/30 text-green-200 hover:bg-green-500/10 flex items-center justify-center space-x-2 h-12"
                    disabled={isTestingSystem}
                  >
                    <TestTube
                      className={`h-5 w-5 ${isTestingSystem ? 'animate-pulse' : ''}`}
                    />
                    <span>
                      {isTestingSystem
                        ? 'Testing System...'
                        : 'Test Alarm System'}
                    </span>
                  </Button>

                  {testResults && (
                    <div className="mt-3 p-3 bg-black/20 rounded-lg">
                      <div className="text-sm text-white font-medium mb-2">
                        System Test Results:
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div
                          className={`flex items-center space-x-2 ${testResults.notifications ? 'text-green-300' : 'text-red-300'}`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${testResults.notifications ? 'bg-green-400' : 'bg-red-400'}`}
                          />
                          <span>Notifications</span>
                        </div>
                        <div
                          className={`flex items-center space-x-2 ${testResults.vibration ? 'text-green-300' : 'text-red-300'}`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${testResults.vibration ? 'bg-green-400' : 'bg-red-400'}`}
                          />
                          <span>Vibration</span>
                        </div>
                        <div
                          className={`flex items-center space-x-2 ${testResults.sound ? 'text-green-300' : 'text-red-300'}`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${testResults.sound ? 'bg-green-400' : 'bg-red-400'}`}
                          />
                          <span>Sound</span>
                        </div>
                        <div
                          className={`flex items-center space-x-2 ${testResults.iosIntegration ? 'text-green-300' : 'text-gray-400'}`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${testResults.iosIntegration ? 'bg-green-400' : 'bg-gray-400'}`}
                          />
                          <span>iOS Integration</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
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
                        className="bg-gradient-to-r from-white/10 to-white/5 rounded-xl p-6 border border-white/10 shadow-lg backdrop-blur-sm"
                      >
                        <div className="space-y-4">
                          {/* Main alarm info */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div
                                className={`p-3 bg-${color}-500/30 rounded-xl shadow-lg`}
                              >
                                <Icon className={`h-6 w-6 text-${color}-300`} />
                              </div>
                              <div>
                                <div className="flex items-center space-x-3">
                                  <span className="text-2xl font-bold text-white">
                                    {formatSleepTime(alarm.time)}
                                  </span>
                                  <span
                                    className={`text-xs px-3 py-1 rounded-full bg-${color}-500/30 text-${color}-200 font-semibold`}
                                  >
                                    {alarm.type === 'bedtime'
                                      ? 'BEDTIME'
                                      : 'WAKE UP'}
                                  </span>
                                </div>
                                <p className="text-sm text-purple-200 mt-1 font-medium">
                                  {alarm.label}
                                </p>
                                <p className="text-xs text-purple-300">
                                  {alarm.time > new Date()
                                    ? `In ${Math.ceil((alarm.time.getTime() - new Date().getTime()) / (1000 * 60 * 60))} hours`
                                    : 'Past due'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
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
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg p-2"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* iOS Integration Actions */}
                          {deviceCapabilities.isIOS && (
                            <div className="border-t border-white/10 pt-4">
                              <div className="flex items-center space-x-2 mb-3">
                                <Smartphone className="h-4 w-4 text-blue-300" />
                                <span className="text-sm text-blue-200 font-medium">
                                  iOS Integration
                                </span>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCreateShortcut(alarm.id)}
                                  className="border-blue-400/30 text-blue-200 hover:bg-blue-500/10 text-xs h-8"
                                >
                                  <Settings className="h-3 w-3 mr-1" />
                                  Shortcut
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCopyTime(alarm.id)}
                                  className="border-green-400/30 text-green-200 hover:bg-green-500/10 text-xs h-8"
                                >
                                  <Copy className="h-3 w-3 mr-1" />
                                  Copy
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAddToCalendar(alarm.id)}
                                  className="border-orange-400/30 text-orange-200 hover:bg-orange-500/10 text-xs h-8"
                                >
                                  <Calendar className="h-3 w-3 mr-1" />
                                  Calendar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleShowInstructions(alarm.id)
                                  }
                                  className="border-purple-400/30 text-purple-200 hover:bg-purple-500/10 text-xs h-8"
                                >
                                  <Bell className="h-3 w-3 mr-1" />
                                  Guide
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )
                  })
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Enhanced iOS Integration Info */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border-blue-400/30 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-blue-500/30 rounded-lg">
                    <Smartphone className="h-6 w-6 text-blue-300" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg mb-3 flex items-center">
                      iOS Integration
                      {deviceCapabilities.isIOS && (
                        <span className="ml-2 text-xs bg-green-500/30 text-green-200 px-2 py-1 rounded-full">
                          Active
                        </span>
                      )}
                    </h3>

                    <div className="space-y-4">
                      <p className="text-blue-200 text-sm">
                        Enhanced iOS integration with multiple alarm setup
                        methods for reliable wake-up functionality.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-2">
                          <div className="text-blue-300 font-semibold">
                            ✨ Enhanced Features:
                          </div>
                          <div className="space-y-1 text-blue-200">
                            <div>• Shortcuts app integration</div>
                            <div>• Calendar event backup</div>
                            <div>• One-tap time copying</div>
                            <div>• Voice setup instructions</div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-blue-300 font-semibold">
                            🛡️ Reliability:
                          </div>
                          <div className="space-y-1 text-blue-200">
                            <div>• Multiple backup methods</div>
                            <div>• System test functionality</div>
                            <div>• Rich notifications with actions</div>
                            <div>• Progressive enhancement</div>
                          </div>
                        </div>
                      </div>

                      {deviceCapabilities.isIOS ? (
                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                          <div className="text-green-200 text-sm font-medium">
                            🎉 iOS device detected! Enhanced features are
                            available.
                          </div>
                        </div>
                      ) : (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                          <div className="text-yellow-200 text-sm">
                            💡 For best experience on iOS, open this app in
                            Safari and add to home screen.
                          </div>
                        </div>
                      )}
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
