'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSettingsContext } from '@/contexts/SettingsContext';

export type TimerType = 'focus' | 'shortBreak' | 'longBreak';

interface TimerProps {
    readonly isPlaying: boolean;
    readonly timerType: TimerType;
    readonly onComplete?: () => void;
}

/**
 * Timer component that displays and manages a countdown timer for focus and break sessions.
 * Supports auto-start functionality based on user settings.
 */
export function Timer({
    isPlaying,
    timerType,
    onComplete,
}: Readonly<TimerProps>) {
    const { settings } = useSettingsContext();
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [isCompleting, setIsCompleting] = useState(false);

    const getInitialTime = useCallback(() => {
        switch (timerType) {
            case 'focus':
                return settings.focusDuration * 60;
            case 'shortBreak':
                return settings.shortBreakDuration * 60;
            case 'longBreak':
                return settings.longBreakDuration * 60;
            default:
                return settings.focusDuration * 60;
        }
    }, [timerType, settings]);

    // Only reset timer when timer type changes
    useEffect(() => {
        setTimeLeft(getInitialTime());
        setIsCompleting(false);
    }, [getInitialTime, timerType]);

    // Handle countdown timer
    useEffect(() => {
        if (!timeLeft) return;

        let intervalId: NodeJS.Timeout;

        if (isPlaying && timeLeft > 0) {
            intervalId = setInterval(() => {
                setTimeLeft((prev) => (prev && prev > 0 ? prev - 1 : 0));
            }, 1000);
        }

        return () => clearInterval(intervalId);
    }, [isPlaying, timeLeft]);

    // Handle both completion and auto-start
    useEffect(() => {
        if (timeLeft === 0 && !isCompleting) {
            setIsCompleting(true);
            onComplete?.();
        }
    }, [timeLeft, onComplete, isCompleting]);

    if (timeLeft === null) {
        return <TimerDisplay minutes='--' seconds='--' />;
    }

    return (
        <TimerDisplay
            minutes={String(Math.floor(timeLeft / 60)).padStart(2, '0')}
            seconds={String(timeLeft % 60).padStart(2, '0')}
        />
    );
}

interface TimerDisplayProps {
    readonly minutes: string;
    readonly seconds: string;
}

function TimerDisplay({ minutes, seconds }: Readonly<TimerDisplayProps>) {
    return (
        <div className='flex items-center justify-center text-white text-8xl md:text-9xl font-medium tracking-tight select-none'>
            <div className='w-[160px] text-right'>{minutes}</div>
            <div className='w-[60px] text-center'>:</div>
            <div className='w-[160px] text-left'>{seconds}</div>
        </div>
    );
}
