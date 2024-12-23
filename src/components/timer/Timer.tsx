'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSettings } from '@/hooks/useSettings';

export type TimerType = 'focus' | 'shortBreak' | 'longBreak';

interface TimerProps {
    readonly isPlaying: boolean;
    readonly timerType: TimerType;
    readonly username?: string;
    readonly onComplete?: () => void;
}

export function Timer({
    isPlaying = false,
    timerType,
    username,
    onComplete,
}: Readonly<TimerProps>) {
    const { settings, loadSettings } = useSettings(username);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    // Load settings on mount
    useEffect(() => {
        loadSettings();
    }, [settings, loadSettings]);

    // Get initial time based on timer type and settings
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

    // Reset timer when timer type changes
    useEffect(() => {
        setTimeLeft(getInitialTime());
    }, [getInitialTime]);

    // Auto-start timer based on settings
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

    useEffect(() => {
        if (!timeLeft) return;

        let intervalId: NodeJS.Timeout;

        if (isPlaying && timeLeft > 0) {
            intervalId = setInterval(() => {
                setTimeLeft((prev) => {
                    const newTime = prev && prev > 0 ? prev - 1 : 0;
                    return newTime;
                });
            }, 1000);
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [isPlaying, timeLeft]);

    useEffect(() => {
        if (timeLeft === 0) {
            onComplete?.();
        }
    }, [timeLeft, onComplete]);

    if (timeLeft === null) {
        return (
            <div className='flex items-center justify-center text-white text-8xl md:text-9xl font-medium tracking-tight select-none'>
                <div className='w-[160px] text-right'>--</div>
                <div className='w-[60px] text-center'>:</div>
                <div className='w-[160px] text-left'>--</div>
            </div>
        );
    }

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div className='flex items-center justify-center text-white text-8xl md:text-9xl font-medium tracking-tight select-none'>
            <div className='w-[160px] text-right'>
                {String(minutes).padStart(2, '0')}
            </div>
            <div className='w-[60px] text-center'>:</div>
            <div className='w-[160px] text-left'>
                {String(seconds).padStart(2, '0')}
            </div>
        </div>
    );
}
