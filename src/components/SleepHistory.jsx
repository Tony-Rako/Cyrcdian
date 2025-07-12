import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, Clock, Moon, Star, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const SleepHistory = ({ records }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const { toast } = useToast();

  const periods = [
    { id: 'week', label: '7 Tage' },
    { id: 'month', label: '30 Tage' },
    { id: 'all', label: 'Alle' }
  ];

  const getFilteredRecords = () => {
    const now = new Date();
    const days = selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : 365;
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    return records.filter(record => new Date(record.date) >= cutoff);
  };

  const getStats = () => {
    const filteredRecords = getFilteredRecords();
    if (filteredRecords.length === 0) return null;

    const avgDuration = filteredRecords.reduce((sum, r) => sum + r.duration, 0) / filteredRecords.length;
    const avgCycles = filteredRecords.reduce((sum, r) => sum + r.cycles, 0) / filteredRecords.length;
    const totalSleep = filteredRecords.reduce((sum, r) => sum + r.duration, 0);
    
    const qualityRecords = filteredRecords.filter(r => r.quality);
    const avgQuality = qualityRecords.length > 0 
      ? qualityRecords.reduce((sum, r) => sum + r.quality, 0) / qualityRecords.length 
      : null;

    return {
      avgDuration,
      avgCycles,
      totalSleep,
      avgQuality,
      recordCount: filteredRecords.length
    };
  };

  const handleExport = () => {
    const data = getFilteredRecords();
    const csv = [
      'Datum,Schlafen,Aufwachen,Dauer (h),Zyklen,Qualität,Auto-erkannt',
      ...data.map(r => 
        `${r.date},${r.sleepTime},${r.wakeTime},${r.duration.toFixed(1)},${r.cycles},${r.quality || ''},${r.autoDetected ? 'Ja' : 'Nein'}`
      )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `schlaf-historie-${selectedPeriod}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export erfolgreich! 📊",
      description: "Deine Schlafhistorie wurde als CSV-Datei heruntergeladen.",
    });
  };

  const stats = getStats();
  const filteredRecords = getFilteredRecords();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Period Selector */}
      <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-4 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Schlaf-Historie</h2>
          </div>
          <Button
            size="sm"
            onClick={handleExport}
            disabled={filteredRecords.length === 0}
            className="bg-purple-500 hover:bg-purple-600"
          >
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
        </div>
        
        <div className="flex space-x-2">
          {periods.map(period => (
            <button
              key={period.id}
              onClick={() => setSelectedPeriod(period.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedPeriod === period.id
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/10 text-purple-200 hover:bg-white/20'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black/20 backdrop-blur-lg rounded-xl p-4 border border-white/10">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-200">Ø Schlafdauer</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.avgDuration.toFixed(1)}h</p>
            <p className="text-xs text-purple-300">{stats.avgCycles.toFixed(1)} Zyklen</p>
          </div>

          <div className="bg-black/20 backdrop-blur-lg rounded-xl p-4 border border-white/10">
            <div className="flex items-center space-x-2 mb-2">
              <Moon className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-200">Gesamt</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalSleep.toFixed(0)}h</p>
            <p className="text-xs text-purple-300">{stats.recordCount} Nächte</p>
          </div>

          {stats.avgQuality && (
            <div className="bg-black/20 backdrop-blur-lg rounded-xl p-4 border border-white/10 col-span-2">
              <div className="flex items-center space-x-2 mb-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-purple-200">Ø Schlafqualität</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(stats.avgQuality)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-400'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-white font-semibold">{stats.avgQuality.toFixed(1)}/5</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Records List */}
      <div className="space-y-3">
        {filteredRecords.length === 0 ? (
          <div className="bg-black/20 backdrop-blur-lg rounded-xl p-8 border border-white/10 text-center">
            <Calendar className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Keine Daten verfügbar</h3>
            <p className="text-purple-200">
              Starte das Schlaf-Tracking, um deine Historie zu sehen.
            </p>
          </div>
        ) : (
          filteredRecords.map((record, index) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-black/20 backdrop-blur-lg rounded-xl p-4 border border-white/10"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <Moon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">
                      {new Date(record.date).toLocaleDateString('de-DE', { 
                        weekday: 'short', 
                        day: '2-digit', 
                        month: '2-digit' 
                      })}
                    </p>
                    <p className="text-sm text-purple-200">
                      {record.duration.toFixed(1)}h • {record.cycles} Zyklen
                    </p>
                  </div>
                </div>
                
                {record.quality && (
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= record.quality
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-purple-300">Schlafen:</span>
                  <p className="text-white font-mono">{record.sleepTime}</p>
                </div>
                <div>
                  <span className="text-purple-300">Aufwachen:</span>
                  <p className="text-white font-mono">{record.wakeTime}</p>
                </div>
              </div>
              
              {record.autoDetected && (
                <div className="mt-3 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-xs text-green-400">Automatisch erkannt</span>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default SleepHistory;
