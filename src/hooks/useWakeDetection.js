import React, { useEffect, useCallback } from 'react';

const calculateBedtimes = (wakeTimeStr) => {
    const sleepCycles = [
        { cycles: 4, duration: '6h' },
        { cycles: 5, duration: '7.5h' },
        { cycles: 6, duration: '9h' }
    ];
    const [hours, minutes] = wakeTimeStr.split(':').map(Number);
    const wakeDateTime = new Date();
    wakeDateTime.setHours(hours, minutes, 0, 0);

    return sleepCycles.map(cycle => {
        const bedTime = new Date(wakeDateTime);
        bedTime.setHours(bedTime.getHours() - (cycle.cycles * 1.5));
        if (bedTime > wakeDateTime) {
            bedTime.setDate(bedTime.getDate() - 1);
        }
        return {
            ...cycle,
            time: bedTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
        };
    });
};


export const useWakeDetection = ({ onWakeUp, onBedtimeSelect }) => {

    const showBedtimeNotification = useCallback((wakeTime) => {
        if ('Notification' in window && Notification.permission === 'granted') {
            const bedtimes = calculateBedtimes(wakeTime);
            
            new Notification(`Guten Morgen! ☀️ Deine Weckzeit war ${wakeTime}.`, {
                body: 'Wähle deine Bettzeit für heute Abend:',
                icon: '/icon-192.png',
                tag: 'bedtime-selection',
                renotify: true,
                requireInteraction: true,
                actions: bedtimes.map(bt => ({
                    action: `set-bedtime-${bt.time}`,
                    title: `${bt.time} (${bt.duration})`
                }))
            });
        }
    }, []);

    useEffect(() => {
        let lastActivity = Date.now();
        let sleepStartTime = localStorage.getItem('sleepStartTime');
        
        const handleActivity = () => {
            const now = Date.now();
            const lastSeen = localStorage.getItem('lastActivity');
            const inactiveDuration = lastSeen ? (now - parseInt(lastSeen, 10)) / (1000 * 60 * 60) : 0;
            
            sleepStartTime = localStorage.getItem('sleepStartTime');

            if (sleepStartTime && inactiveDuration >= 4) { // At least 4 hours of inactivity
                const wakeTime = new Date(now);
                const wakeTimeStr = wakeTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
                
                onWakeUp(parseInt(sleepStartTime, 10), now);
                showBedtimeNotification(wakeTimeStr);

                localStorage.removeItem('sleepStartTime');
            }
            
            localStorage.setItem('lastActivity', now.toString());
            lastActivity = now;
        };

        const inactivityCheck = setInterval(() => {
            const now = Date.now();
            const inactiveDuration = (now - lastActivity) / (1000 * 60); // in minutes
            const hour = new Date().getHours();
            const isNight = hour >= 20 || hour <= 4;
            
            if (!localStorage.getItem('sleepStartTime') && inactiveDuration > 30 && isNight) {
                localStorage.setItem('sleepStartTime', lastActivity.toString());
            }

        }, 5 * 60 * 1000); // Check every 5 minutes

        const events = ['visibilitychange', 'focus', 'click', 'scroll', 'touchstart'];
        events.forEach(event => window.addEventListener(event, handleActivity));

        // Handle notification clicks
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            const channel = new MessageChannel();
            navigator.serviceWorker.controller.postMessage({ type: 'INIT_PORT' }, [channel.port2]);

            channel.port1.onmessage = (event) => {
                if (event.data.type === 'BEDTIME_SELECTED') {
                    onBedtimeSelect(event.data.bedtime);
                }
            };
        }


        return () => {
            clearInterval(inactivityCheck);
            events.forEach(event => window.removeEventListener(event, handleActivity));
        };

    }, [onWakeUp, showBedtimeNotification, onBedtimeSelect]);

    return null;
};