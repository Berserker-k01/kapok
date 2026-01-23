import React, { useState, useEffect } from 'react';
import { differenceInDays, differenceInHours, differenceInMinutes, parseISO } from 'date-fns';
import { Clock } from 'lucide-react';

const SubscriptionTimer = ({ endDate }) => {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

    useEffect(() => {
        if (!endDate) return;

        const calculateTimeLeft = () => {
            const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
            const now = new Date();

            if (end <= now) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0 });
                return;
            }

            const days = differenceInDays(end, now);
            const hours = differenceInHours(end, now) % 24;
            const minutes = differenceInMinutes(end, now) % 60;

            setTimeLeft({ days, hours, minutes });
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 60000); // Update every minute

        return () => clearInterval(timer);
    }, [endDate]);

    if (!endDate) return null;

    return (
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-4 text-white shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                    <p className="text-xs font-medium text-primary-100 uppercase tracking-wider">Temps Restant</p>
                    <p className="font-bold text-lg leading-none">
                        {timeLeft.days}j {timeLeft.hours}h {timeLeft.minutes}m
                    </p>
                </div>
            </div>
            <div className="text-right">
                <span className="text-xs bg-white/20 px-2 py-1 rounded text-white font-medium">Actif</span>
            </div>
        </div>
    );
};

export default SubscriptionTimer;
