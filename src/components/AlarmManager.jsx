import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Moon, Sun, Volume2, VolumeX, Repeat, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const AlarmManager = ({ settings, onUpdateSettings, onScheduleNotification }) => {
  const [alarmSettings, setAlarmSettings] = useState({
    sleepAlarmEnabled: settings?.sleepAlarmEnabled ?? true,
    wakeAlarmEnabled: settings?.wakeAlarmEnabled ?? true,
    sleepAlarmOffset: settings?.sleepAlarmOffset ?? 30,
    snoozeEnabled: settings?.snoozeEnabled ?? true,
    snoozeDuration: settings?.snoozeDuration ?? 90, // 1.5 hours in minutes
    alarmSound: settings?.alarmSound ?? 'gentle',
    vibrationEnabled: settings?.vibrationEnabled ?? true,
    weekendMode: settings?.weekendMode ?? false
  });
  
  const { toast } = useToast();

  const alarmSounds = [
    { id: 'gentle', name: 'Sanft', description: 'Ruhige Töne' },
    { id: 'nature', name: 'Natur', description: 'Vogelgezwitscher' },
    { id: 'classic', name: 'Klassisch', description: 'Standard-Alarm' },
    { id: 'progressive', name: 'Progressiv', description: 'Langsam lauter' }
  ];

  const handleSettingChange = (key, value) => {
    const newSettings = { ...alarmSettings, [key]: value };
    setAlarmSettings(newSettings);
    onUpdateSettings(newSettings);
  };

  const testAlarm = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Test-Alarm 🔔', {
        body: 'So würde dein Alarm aussehen!',
        icon: '/icon-192.png',
        tag: 'test-alarm'
      });
    }
    
    if (alarmSettings.vibrationEnabled && 'vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
    
    toast({
      title: "Test-Alarm ausgelöst! 🔔",
      description: "So würden deine Benachrichtigungen aussehen.",
    });
  };

  const scheduleWeeklyAlarms = () => {
    if (!settings?.wakeTime) {
      toast({
        title: "Keine Weckzeit eingestellt",
        description: "Bitte stelle zuerst eine Weckzeit im Rechner ein.",
      });
      return;
    }

    // Schedule alarms for the next 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      // Skip weekends if weekend mode is disabled
      if (!alarmSettings.weekendMode && (date.getDay() === 0 || date.getDay() === 6)) {
        continue;
      }
      
      if (alarmSettings.sleepAlarmEnabled) {
        onScheduleNotification({
          type: 'sleep',
          time: settings.wakeTime,
          offset: -alarmSettings.sleepAlarmOffset,
          message: 'Zeit fürs Bett! 🌙',
          date: date.toISOString().split('T')[0]
        });
      }
      
      if (alarmSettings.wakeAlarmEnabled) {
        onScheduleNotification({
          type: 'wake',
          time: settings.wakeTime,
          message: 'Guten Morgen! ☀️',
          date: date.toISOString().split('T')[0]
        });
      }
    }
    
    toast({
      title: "Wöchentliche Alarme eingestellt! 📅",
      description: "Alarme für die nächsten 7 Tage wurden geplant.",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Alarm Status */}
      <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
        <div className="flex items-center space-x-3 mb-4">
          <Bell className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-bold text-white">Alarm-Einstellungen</h2>
        </div>
        
        <div className="space-y-4">
          {/* Sleep Alarm Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Moon className="w-5 h-5 text-purple-400" />
              <div>
                <p className="font-medium text-white">Schlaf-Alarm</p>
                <p className="text-sm text-purple-200">
                  {alarmSettings.sleepAlarmOffset} Min vor Bettzeit
                </p>
              </div>
            </div>
            <button
              onClick={() => handleSettingChange('sleepAlarmEnabled', !alarmSettings.sleepAlarmEnabled)}
              className={`w-12 h-6 rounded-full transition-all ${
                alarmSettings.sleepAlarmEnabled ? 'bg-purple-500' : 'bg-gray-600'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                alarmSettings.sleepAlarmEnabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {/* Wake Alarm Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Sun className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="font-medium text-white">Weck-Alarm</p>
                <p className="text-sm text-purple-200">Zur eingestellten Zeit</p>
              </div>
            </div>
            <button
              onClick={() => handleSettingChange('wakeAlarmEnabled', !alarmSettings.wakeAlarmEnabled)}
              className={`w-12 h-6 rounded-full transition-all ${
                alarmSettings.wakeAlarmEnabled ? 'bg-purple-500' : 'bg-gray-600'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                alarmSettings.wakeAlarmEnabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Alarm Sound Settings */}
      <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
        <div className="flex items-center space-x-3 mb-4">
          <Volume2 className="w-6 h-6 text-purple-400" />
          <h3 className="text-lg font-bold text-white">Alarm-Ton</h3>
        </div>
        
        <div className="space-y-3">
          {alarmSounds.map(sound => (
            <motion.button
              key={sound.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSettingChange('alarmSound', sound.id)}
              className={`w-full p-3 rounded-xl border transition-all text-left ${
                alarmSettings.alarmSound === sound.id
                  ? 'bg-purple-500/20 border-purple-400'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">{sound.name}</p>
                  <p className="text-sm text-purple-200">{sound.description}</p>
                </div>
                {alarmSettings.alarmSound === sound.id && (
                  <div className="w-2 h-2 bg-purple-400 rounded-full" />
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-bold text-white mb-4">Erweiterte Einstellungen</h3>
        
        <div className="space-y-4">
          {/* Snooze Settings */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Repeat className="w-5 h-5 text-purple-400" />
              <div>
                <p className="font-medium text-white">Snooze (1,5h Zyklen)</p>
                <p className="text-sm text-purple-200">Schlummern in natürlichen Intervallen</p>
              </div>
            </div>
            <button
              onClick={() => handleSettingChange('snoozeEnabled', !alarmSettings.snoozeEnabled)}
              className={`w-12 h-6 rounded-full transition-all ${
                alarmSettings.snoozeEnabled ? 'bg-purple-500' : 'bg-gray-600'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                alarmSettings.snoozeEnabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {/* Vibration */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-purple-400 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
              <div>
                <p className="font-medium text-white">Vibration</p>
                <p className="text-sm text-purple-200">Zusätzliche haptische Benachrichtigung</p>
              </div>
            </div>
            <button
              onClick={() => handleSettingChange('vibrationEnabled', !alarmSettings.vibrationEnabled)}
              className={`w-12 h-6 rounded-full transition-all ${
                alarmSettings.vibrationEnabled ? 'bg-purple-500' : 'bg-gray-600'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                alarmSettings.vibrationEnabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {/* Weekend Mode */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-purple-400" />
              <div>
                <p className="font-medium text-white">Wochenend-Modus</p>
                <p className="text-sm text-purple-200">Alarme auch Sa/So</p>
              </div>
            </div>
            <button
              onClick={() => handleSettingChange('weekendMode', !alarmSettings.weekendMode)}
              className={`w-12 h-6 rounded-full transition-all ${
                alarmSettings.weekendMode ? 'bg-purple-500' : 'bg-gray-600'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                alarmSettings.weekendMode ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          onClick={testAlarm}
          className="w-full bg-purple-500 hover:bg-purple-600"
        >
          <Bell className="w-4 h-4 mr-2" />
          Test-Alarm
        </Button>
        
        <Button
          onClick={scheduleWeeklyAlarms}
          variant="outline"
          className="w-full border-purple-400 text-purple-300 hover:bg-purple-500/20"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Wöchentliche Alarme einrichten
        </Button>
      </div>
    </motion.div>
  );
};

export default AlarmManager;