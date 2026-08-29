'use client';

import { useState, useEffect } from 'react';
import { MS_PER_DAY, DEADLINE_CRITICAL_DAYS, DEADLINE_UPCOMING_DAYS } from '@/lib/utils/time';

interface CountdownTimerProps {
  deadline: string; // ISO date string "YYYY-MM-DD"
  label?: string;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

function calcTimeLeft(deadline: string): TimeLeft {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  return {
    days: Math.floor(diff / MS_PER_DAY),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: false,
  };
}

export default function CountdownTimer({ deadline, label, className = '' }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calcTimeLeft(deadline));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calcTimeLeft(deadline));
    }, 1000);
    return () => clearInterval(timer);
  }, [deadline]);

  if (timeLeft.expired) {
    return (
      <div className={`text-center text-sm text-danger ${className}`}>
        {label && <span className="block text-xs text-text-muted">{label}</span>}
        Frist abgelaufen
      </div>
    );
  }

  const urgentClass =
    timeLeft.days < DEADLINE_CRITICAL_DAYS
      ? 'text-danger'
      : timeLeft.days < DEADLINE_UPCOMING_DAYS
        ? 'text-warning'
        : 'text-text-primary';

  return (
    <div className={`text-center ${className}`}>
      {label && <span className="mb-1 block text-sm text-text-muted">{label}</span>}
      <div
        className={`flex items-center justify-center gap-2 font-mono text-lg font-bold ${urgentClass}`}
      >
        <div className="flex flex-col items-center">
          <span>{timeLeft.days}</span>
          <span className="text-xs font-normal text-text-muted">Tage</span>
        </div>
        <span>:</span>
        <div className="flex flex-col items-center">
          <span>{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="text-xs font-normal text-text-muted">Std</span>
        </div>
        <span>:</span>
        <div className="flex flex-col items-center">
          <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="text-xs font-normal text-text-muted">Min</span>
        </div>
        <span>:</span>
        <div className="flex flex-col items-center">
          <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
          <span className="text-xs font-normal text-text-muted">Sek</span>
        </div>
      </div>
    </div>
  );
}
