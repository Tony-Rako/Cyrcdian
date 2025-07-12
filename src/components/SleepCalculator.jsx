import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Moon, Sun, Calculator, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const SleepCalculator = ({ onScheduleAlarm, settings, onUpdateSettings }) => {
  const [wakeTime, setWakeTime] = useState(settings?.wakeTime || '06:00');
  const [selectedCycles, setSelectedCycles] = useState(4);
  const [calculatedTimes, setCalculatedTimes] = useState([]);
  const { toast } = useToast();

  const sleepCycles = [
    { cycles: 3, duration: '4.5h', description: 'Kurzer Schlaf' },
    { cycles: 4, duration: '6h', description: 'Optimal für die meisten' },
    { cycles: 5, duration: '7.5h', description: 'Ausgiebiger Schlaf' },
    { cycles: 6, duration: '9h', description: 'Langer Schlaf' }
  ];

  const calculateBedtimes = () => {
    const [hours, minutes] = wakeTime.split(':').map(Number);
    const wakeDateTime = new Date();
    wakeDateTime.setHours(hours, minutes, 0, 0);
    
    const times = sleepCycles.map(cycle => {
      const bedTime = new Date(wakeDateTime);
      bedTime.setHours(bedTime.getHours() - (cycle.cycles * 1.5));
      
      // If bedtime is next day, adjust
      if (bedTime > wakeDateTime) {
        bedTime.setDate(bedTime.getDate() - 1);
      }
      
      return {
        ...cycle,
        bedTime: bedTime.toLocaleTimeString('de-DE', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        sleepAlarmTime: new Date(bedTime.getTime() - 30 * 60000).toLocaleTimeString('de-DE', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      };
    });
    
    setCalculatedTimes(times);
  };

  useEffect(() => {
    calculateBedtimes();
  }, [wakeTime]);

  const handleSetAlarm = (bedTime, sleepAlarmTime) => {
    onScheduleAlarm({
      type: 'sleep',
      time: sleepAlarmTime,
      message: 'Zeit fürs Bett! 🌙'
    });
    
    onScheduleAlarm({
      type: 'wake',
      time: wakeTime,
      message: 'Guten Morgen! ☀️'
    });

    onUpdateSettings({ wakeTime, selectedCycles });
    
    toast({
      title: "Alarme eingestellt! ⏰",
      description: `Schlaf-Alarm: ${sleepAlarmTime}, Weck-Alarm: ${wakeTime}`,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Wake Time Input */}
      <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
        <div className="flex items-center space-x-3 mb-4">
          <Sun className="w-6 h-6 text-yellow-400" />
          <h2 className="text-xl font-bold text-white">Weckzeit einstellen</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Wann möchtest du aufwachen?
            </label>
            <input
              type="time"
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-lg font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Sleep Cycle Options */}
      <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
        <div className="flex items-center space-x-3 mb-4">
          <Calculator className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-bold text-white">Optimale Bettzeiten</h2>
        </div>
        
        <div className="space-y-3">
          {calculatedTimes.map((time, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                selectedCycles === time.cycles
                  ? 'bg-purple-500/20 border-purple-400'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
              onClick={() => setSelectedCycles(time.cycles)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <Moon className="w-4 h-4 text-purple-300" />
                    <span className="font-bold text-white">{time.bedTime}</span>
                    <span className="text-sm text-purple-200">({time.duration})</span>
                  </div>
                  <p className="text-sm text-gray-300 mt-1">{time.description}</p>
                  <p className="text-xs text-purple-200 mt-1">
                    Schlaf-Alarm: {time.sleepAlarmTime}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-purple-300">
                    {time.cycles} Zyklen
                  </div>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetAlarm(time.bedTime, time.sleepAlarmTime);
                    }}
                    className="mt-2 bg-purple-500 hover:bg-purple-600"
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    Alarm
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-2xl p-4 border border-purple-400/20">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Clock className="w-4 h-4 text-purple-300" />
          </div>
          <div>
            <h3 className="font-semibold text-purple-200 mb-1">Wissenschaftlich fundiert</h3>
            <p className="text-sm text-purple-100/80">
              Jeder Schlafzyklus dauert etwa 1,5 Stunden. Das Aufwachen zwischen den Zyklen 
              sorgt für erholsameren Schlaf und weniger Müdigkeit.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SleepCalculator;
