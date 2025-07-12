import { useState, useEffect, useCallback } from 'react';

export const useNotifications = () => {
  const [permission, setPermission] = useState(Notification.permission);
  const [scheduledNotifications, setScheduledNotifications] = useState([]);

  useEffect(() => {
    // Load scheduled notifications from localStorage
    const saved = localStorage.getItem('scheduledNotifications');
    if (saved) {
      try {
        setScheduledNotifications(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Save scheduled notifications to localStorage
    localStorage.setItem('scheduledNotifications', JSON.stringify(scheduledNotifications));
  }, [scheduledNotifications]);

  const requestPermission = useCallback(async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    }
    return false;
  }, []);

  const scheduleNotification = useCallback((notification) => {
    if (permission !== 'granted') {
      requestPermission();
      return;
    }

    const { type, time, message, date, offset = 0 } = notification;
    
    // Parse time and create target date
    const [hours, minutes] = time.split(':').map(Number);
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(hours, minutes + offset, 0, 0);
    
    // If time has passed today, schedule for tomorrow
    if (targetDate <= new Date() && !date) {
      targetDate.setDate(targetDate.getDate() + 1);
    }

    const timeUntilNotification = targetDate.getTime() - Date.now();
    
    if (timeUntilNotification > 0) {
      const timeoutId = setTimeout(() => {
        if ('Notification' in window && Notification.permission === 'granted') {
          const notif = new Notification(message, {
            body: type === 'sleep' ? 'Zeit, sich auf den Schlaf vorzubereiten!' : 'Zeit aufzuwachen!',
            icon: '/icon-192.png',
            tag: `${type}-alarm-${Date.now()}`,
            requireInteraction: true,
            actions: type === 'wake' ? [
              { action: 'snooze', title: 'Snooze (1.5h)' },
              { action: 'dismiss', title: 'Ausschalten' }
            ] : []
          });

          // Handle notification click
          notif.onclick = () => {
            window.focus();
            notif.close();
          };

          // Vibrate if supported
          if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200, 100, 200]);
          }
        }
        
        // Remove from scheduled notifications
        setScheduledNotifications(prev => 
          prev.filter(n => n.id !== notification.id)
        );
      }, timeUntilNotification);

      // Add to scheduled notifications
      const scheduledNotif = {
        id: Date.now(),
        ...notification,
        scheduledFor: targetDate.toISOString(),
        timeoutId
      };
      
      setScheduledNotifications(prev => [...prev, scheduledNotif]);
      
      return scheduledNotif.id;
    }
    
    return null;
  }, [permission, requestPermission]);

  const cancelNotification = useCallback((notificationId) => {
    setScheduledNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      if (notification && notification.timeoutId) {
        clearTimeout(notification.timeoutId);
      }
      return prev.filter(n => n.id !== notificationId);
    });
  }, []);

  const cancelAllNotifications = useCallback(() => {
    scheduledNotifications.forEach(notification => {
      if (notification.timeoutId) {
        clearTimeout(notification.timeoutId);
      }
    });
    setScheduledNotifications([]);
  }, [scheduledNotifications]);

  const scheduleRepeatingAlarm = useCallback((alarmConfig) => {
    const { time, days, type, message } = alarmConfig;
    const scheduledIds = [];

    days.forEach(dayOffset => {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + dayOffset);
      
      const id = scheduleNotification({
        type,
        time,
        message,
        date: targetDate.toISOString().split('T')[0]
      });
      
      if (id) scheduledIds.push(id);
    });

    return scheduledIds;
  }, [scheduleNotification]);

  // Handle service worker messages for notification actions
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'NOTIFICATION_ACTION') {
          const { action, notificationTag } = event.data;
          
          if (action === 'snooze') {
            // Schedule snooze notification (1.5 hours later)
            const snoozeTime = new Date(Date.now() + 90 * 60 * 1000);
            scheduleNotification({
              type: 'wake',
              time: snoozeTime.toLocaleTimeString('de-DE', { 
                hour: '2-digit', 
                minute: '2-digit' 
              }),
              message: 'Snooze beendet - Zeit aufzuwachen! ☀️'
            });
          }
        }
      });
    }
  }, [scheduleNotification]);

  return {
    permission,
    requestPermission,
    scheduleNotification,
    cancelNotification,
    cancelAllNotifications,
    scheduleRepeatingAlarm,
    scheduledNotifications
  };
};
