import { useState, useEffect } from 'react';

export const useSleepData = () => {
  const [sleepData, setSleepData] = useState({
    records: [],
    settings: {
      wakeTime: '06:00',
      selectedCycles: 4,
      sleepAlarmEnabled: true,
      wakeAlarmEnabled: true,
      sleepAlarmOffset: 30,
      snoozeEnabled: true,
      snoozeDuration: 90,
      alarmSound: 'gentle',
      vibrationEnabled: true,
      weekendMode: false
    }
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('sleepTrackerData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setSleepData(parsed);
      } catch (error) {
        console.error('Error loading sleep data:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever sleepData changes
  useEffect(() => {
    localStorage.setItem('sleepTrackerData', JSON.stringify(sleepData));
  }, [sleepData]);

  const addSleepRecord = (record) => {
    setSleepData(prev => ({
      ...prev,
      records: [record, ...prev.records].slice(0, 30) // Keep only last 30 records
    }));
  };

  const updateSettings = (newSettings) => {
    setSleepData(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings }
    }));
  };

  const deleteSleepRecord = (recordId) => {
    setSleepData(prev => ({
      ...prev,
      records: prev.records.filter(record => record.id !== recordId)
    }));
  };

  const updateSleepRecord = (recordId, updates) => {
    setSleepData(prev => ({
      ...prev,
      records: prev.records.map(record => 
        record.id === recordId ? { ...record, ...updates } : record
      )
    }));
  };

  const getWeeklyStats = () => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weeklyRecords = sleepData.records.filter(
      record => new Date(record.date) >= weekAgo
    );

    if (weeklyRecords.length === 0) return null;

    const avgDuration = weeklyRecords.reduce((sum, r) => sum + r.duration, 0) / weeklyRecords.length;
    const avgCycles = weeklyRecords.reduce((sum, r) => sum + r.cycles, 0) / weeklyRecords.length;
    const totalSleep = weeklyRecords.reduce((sum, r) => sum + r.duration, 0);
    
    const qualityRecords = weeklyRecords.filter(r => r.quality);
    const avgQuality = qualityRecords.length > 0 
      ? qualityRecords.reduce((sum, r) => sum + r.quality, 0) / qualityRecords.length 
      : null;

    return {
      avgDuration,
      avgCycles,
      totalSleep,
      avgQuality,
      recordCount: weeklyRecords.length
    };
  };

  const exportData = () => {
    const dataStr = JSON.stringify(sleepData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sleep-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return {
    sleepData,
    addSleepRecord,
    updateSettings,
    deleteSleepRecord,
    updateSleepRecord,
    getWeeklyStats,
    exportData
  };
};
