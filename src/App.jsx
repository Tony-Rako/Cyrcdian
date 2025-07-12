import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Moon, Sun, Clock, TrendingUp, Settings, Bell } from 'lucide-react';
import SleepCalculator from '@/components/SleepCalculator';
import SleepTracker from '@/components/SleepTracker';
import SleepHistory from '@/components/SleepHistory';
import AlarmManager from '@/components/AlarmManager';
import { useSleepData } from '@/hooks/useSleepData';
import { useNotifications } from '@/hooks/useNotifications';
import { Toaster } from '@/components/ui/toaster';
import { useWakeDetection } from '@/hooks/useWakeDetection';
import { useToast } from '@/components/ui/use-toast';

function App() {
  const [activeTab, setActiveTab] = useState('calculator');
  const { sleepData, addSleepRecord, updateSettings } = useSleepData();
  const { requestPermission, scheduleNotification } = useNotifications();
  const { toast } = useToast();

  const handleWakeUp = useCallback((sleepStartTime, wakeUpTime) => {
    const sleepDuration = (wakeUpTime - sleepStartTime) / (1000 * 60 * 60);
    const cycles = Math.round(sleepDuration / 1.5);
    const record = {
      id: Date.now(),
      date: new Date(wakeUpTime).toISOString().split('T')[0],
      sleepTime: new Date(sleepStartTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
      wakeTime: new Date(wakeUpTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
      duration: sleepDuration,
      cycles,
      quality: null,
      autoDetected: true,
    };
    addSleepRecord(record);
    toast({
        title: "Aufwachen automatisch erkannt! ☀️",
        description: `Dein Schlaf wurde mit ${sleepDuration.toFixed(1)}h aufgezeichnet.`
    });
  }, [addSleepRecord, toast]);

  const handleBedtimeSelect = useCallback((bedtime) => {
    const sleepAlarmTime = new Date();
    const [hours, minutes] = bedtime.split(':').map(Number);
    sleepAlarmTime.setHours(hours, minutes, 0, 0);
    sleepAlarmTime.setMinutes(sleepAlarmTime.getMinutes() - (sleepData.settings.sleepAlarmOffset || 30));
    const sleepAlarmTimeStr = sleepAlarmTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

    scheduleNotification({
      type: 'sleep',
      time: sleepAlarmTimeStr,
      message: `Zeit fürs Bett! Deine Bettzeit ist um ${bedtime}.`
    });

    toast({
        title: "Schlaf-Alarm eingestellt! 🌙",
        description: `Wir erinnern dich um ${sleepAlarmTimeStr} daran, schlafen zu gehen.`
    });
  }, [scheduleNotification, toast, sleepData.settings.sleepAlarmOffset]);

  useWakeDetection({ onWakeUp: handleWakeUp, onBedtimeSelect: handleBedtimeSelect });

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('SW registered'))
        .catch(() => console.log('SW registration failed'));
    }

    // Request notification permission on load
    requestPermission();
  }, [requestPermission]);

  const tabs = [
    { id: 'calculator', label: 'Berechnung', icon: Clock },
    { id: 'tracker', label: 'Tracking', icon: Moon },
    { id: 'history', label: 'Historie', icon: TrendingUp },
    { id: 'alarms', label: 'Alarme', icon: Bell }
  ];

  return (
    <>
      <Helmet>
        <title>Schlaf-Rhythmus Tracker - Optimiere deinen Schlaf</title>
        <meta name="description" content="Wissenschaftlich fundierte Schlafoptimierung mit 1,5h-Zyklen. Berechne optimale Bett- und Weckzeiten für besseren Schlaf." />
        <meta name="theme-color" content="#1e1b4b" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/20 backdrop-blur-lg border-b border-white/10"
        >
          <div className="max-w-md mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <Moon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">Schlaf-Rhythmus</h1>
                  <p className="text-xs text-purple-200">Optimiere deinen Schlaf</p>
                </div>
              </div>
              <Settings className="w-6 h-6 text-purple-300" />
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="max-w-md mx-auto px-4 py-6">
          {activeTab === 'calculator' && (
            <SleepCalculator 
              onScheduleAlarm={scheduleNotification}
              settings={sleepData.settings}
              onUpdateSettings={updateSettings}
            />
          )}
          {activeTab === 'tracker' && (
            <SleepTracker 
              onAddRecord={addSleepRecord}
              lastRecord={sleepData.records[0]}
            />
          )}
          {activeTab === 'history' && (
            <SleepHistory records={sleepData.records} />
          )}
          {activeTab === 'alarms' && (
            <AlarmManager 
              settings={sleepData.settings}
              onUpdateSettings={updateSettings}
              onScheduleNotification={scheduleNotification}
            />
          )}
        </main>

        {/* Bottom Navigation */}
        <motion.nav 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-0 left-0 right-0 bg-black/30 backdrop-blur-lg border-t border-white/10"
        >
          <div className="max-w-md mx-auto px-4 py-2">
            <div className="flex justify-around">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <motion.button
                    key={tab.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all ${
                      isActive 
                        ? 'bg-purple-500/20 text-purple-300' 
                        : 'text-gray-400 hover:text-purple-300'
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-1" />
                    <span className="text-xs font-medium">{tab.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.nav>

        <Toaster />
      </div>
    </>
  );
}

export default App;