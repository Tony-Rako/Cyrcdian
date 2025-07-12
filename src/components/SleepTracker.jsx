import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Play, Square, Clock, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const SleepTracker = ({ onAddRecord, lastRecord }) => {
  const [isTracking, setIsTracking] = useState(false);
  const [sleepStartTime, setSleepStartTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [autoDetected, setAutoDetected] = useState(false);
  const { toast } = useToast();

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Auto-detection of sleep/wake based on device activity
  useEffect(() => {
    const handleActivity = () => {
      setLastActivity(Date.now());
      
      // If we detect activity after 6+ hours of inactivity, assume wake up
      if (isTracking && sleepStartTime) {
        const sleepDuration = (Date.now() - sleepStartTime) / (1000 * 60 * 60);
        if (sleepDuration >= 4) { // Minimum 4 hours sleep
          handleWakeUp(true);
        }
      }
    };

    const handleInactivity = () => {
      const inactiveTime = Date.now() - lastActivity;
      const inactiveHours = inactiveTime / (1000 * 60 * 60);
      
      // Auto-detect sleep after 30 minutes of inactivity (between 20:00-02:00)
      const hour = new Date().getHours();
      if (!isTracking && inactiveHours >= 0.5 && (hour >= 20 || hour <= 2)) {
        handleSleepStart(true);
      }
    };

    // Listen for various activity events
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Check for inactivity every 5 minutes
    const inactivityTimer = setInterval(handleInactivity, 5 * 60 * 1000);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      clearInterval(inactivityTimer);
    };
  }, [isTracking, sleepStartTime, lastActivity]);

  const handleSleepStart = (autoDetected = false) => {
    const now = new Date();
    setSleepStartTime(now.getTime());
    setIsTracking(true);
    setAutoDetected(autoDetected);
    
    toast({
      title: autoDetected ? "Schlaf automatisch erkannt 🌙" : "Schlaf-Tracking gestartet 🌙",
      description: `Beginn: ${now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`,
    });
  };

  const handleWakeUp = (autoDetected = false) => {
    if (!sleepStartTime) return;
    
    const now = new Date();
    const sleepDuration = (now.getTime() - sleepStartTime) / (1000 * 60 * 60);
    const cycles = Math.round(sleepDuration / 1.5);
    
    const record = {
      id: Date.now(),
      date: now.toISOString().split('T')[0],
      sleepTime: new Date(sleepStartTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
      wakeTime: now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
      duration: sleepDuration,
      cycles: cycles,
      quality: null,
      autoDetected: autoDetected
    };
    
    onAddRecord(record);
    setIsTracking(false);
    setSleepStartTime(null);
    setAutoDetected(false);
    
    toast({
      title: autoDetected ? "Aufwachen automatisch erkannt ☀️" : "Schlaf beendet ☀️",
      description: `Dauer: ${sleepDuration.toFixed(1)}h (${cycles} Zyklen)`,
    });
  };

  const handleManualEntry = () => {
    toast({
      title: "🚧 Manuelle Eingabe noch nicht implementiert",
      description: "Du kannst diese Funktion in deinem nächsten Prompt anfordern! 🚀",
    });
  };

  const formatDuration = (startTime) => {
    const duration = (currentTime.getTime() - startTime) / (1000 * 60 * 60);
    const hours = Math.floor(duration);
    const minutes = Math.floor((duration - hours) * 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Current Status */}
      <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
        <div className="text-center">
          {isTracking ? (
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="space-y-4"
            >
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto">
                <Moon className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Schlafe gerade...</h2>
                <p className="text-purple-200">
                  Seit: {new Date(sleepStartTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-lg font-mono text-purple-300 mt-2">
                  {formatDuration(sleepStartTime)}
                </p>
                {autoDetected && (
                  <div className="flex items-center justify-center space-x-2 mt-3">
                    <Smartphone className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-400">Automatisch erkannt</span>
                  </div>
                )}
              </div>
              <Button
                onClick={() => handleWakeUp(false)}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
              >
                <Sun className="w-4 h-4 mr-2" />
                Aufgewacht
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="space-y-4"
            >
              <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto">
                <Sun className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Wach</h2>
                <p className="text-purple-200">
                  {currentTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <Button
                onClick={() => handleSleepStart(false)}
                className="bg-purple-500 hover:bg-purple-600"
              >
                <Moon className="w-4 h-4 mr-2" />
                Schlafen gehen
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleManualEntry}
          className="bg-black/20 backdrop-blur-lg rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all"
        >
          <Clock className="w-6 h-6 text-purple-400 mx-auto mb-2" />
          <span className="text-sm font-medium text-white">Manuell eingeben</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => toast({
            title: "🚧 Smart-Tracking noch nicht implementiert",
            description: "Du kannst diese Funktion in deinem nächsten Prompt anfordern! 🚀",
          })}
          className="bg-black/20 backdrop-blur-lg rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all"
        >
          <Smartphone className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <span className="text-sm font-medium text-white">Smart-Tracking</span>
        </motion.button>
      </div>

      {/* Last Sleep Record */}
      {lastRecord && (
        <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-2xl p-4 border border-purple-400/20">
          <h3 className="font-semibold text-purple-200 mb-3">Letzter Schlaf</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-purple-300">Schlafen:</span>
              <p className="text-white font-mono">{lastRecord.sleepTime}</p>
            </div>
            <div>
              <span className="text-purple-300">Aufwachen:</span>
              <p className="text-white font-mono">{lastRecord.wakeTime}</p>
            </div>
            <div>
              <span className="text-purple-300">Dauer:</span>
              <p className="text-white">{lastRecord.duration.toFixed(1)}h</p>
            </div>
            <div>
              <span className="text-purple-300">Zyklen:</span>
              <p className="text-white">{lastRecord.cycles}</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default SleepTracker;
