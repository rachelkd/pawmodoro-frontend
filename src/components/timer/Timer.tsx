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
    isPlaying = false,
    timerType,
    onComplete,
}: Readonly<TimerProps>) {
    const { settings } = useSettingsContext();
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

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

    // Reset timer when timer type or settings change
    useEffect(() => {
        if (!isPlaying) {
            setTimeLeft(getInitialTime());
        }
    }, [getInitialTime, settings, timerType, isPlaying]);

    // Handle auto-start functionality
    useEffect(() => {
        if (timeLeft === 0) {
            const shouldAutoStart =
                timerType === 'focus'
                    ? settings.autoStartFocus
                    : settings.autoStartBreaks;

            if (shouldAutoStart) {
                setTimeLeft(getInitialTime());
            }
        }
    }, [timeLeft, timerType, settings, getInitialTime]);

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

    // Handle timer completion
    useEffect(() => {
        if (timeLeft === 0) {
            onComplete?.();
        }
    }, [timeLeft, onComplete]);

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
