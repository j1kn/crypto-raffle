'use client';

import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  endDate: Date | string;
  className?: string;
}

export default function CountdownTimer({ endDate, className = '' }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
      const now = new Date();
      const difference = end.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / (1000 * 60)) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [endDate]);

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <span className="text-primary-green font-bold">
        {String(timeLeft.days).padStart(3, '0')}
      </span>
      <span className="text-gray-400">:</span>
      <span className="text-primary-green font-bold">
        {String(timeLeft.hours).padStart(2, '0')}
      </span>
      <span className="text-gray-400">:</span>
      <span className="text-primary-green font-bold">
        {String(timeLeft.minutes).padStart(2, '0')}
      </span>
      <span className="text-gray-400">:</span>
      <span className="text-primary-green font-bold">
        {String(timeLeft.seconds).padStart(2, '0')}
      </span>
      <span className="text-gray-400 text-xs ml-2">DAY HOUR MIN SEC</span>
    </div>
  );
}

