'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSettingsContext } from '@/contexts/SettingsContext';
import { useToast } from '@/hooks/use-toast';
import { useCatContext } from '@/contexts/CatContext';
import { useAuth } from '@/contexts/AuthContext';
import { updateAllCatsHappinessAfterStudy } from '@/services/CatService';

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
    const { toast } = useToast();
    const { cats, refreshCats } = useCatContext();
    const { user } = useAuth();
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [isCompleting, setIsCompleting] = useState(false);
    const previousTimerType = useRef(timerType);

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

        // Only show toast if timer type changed
        if (previousTimerType.current === timerType) {
            return;
        }

        // Update previous timer type before showing toast
        previousTimerType.current = timerType;

        const getSessionName = (type: TimerType): string => {
            switch (type) {
                case 'focus':
                    return 'Focus Session';
                case 'shortBreak':
                    return 'Short Break';
                case 'longBreak':
                    return 'Long Break';
            }
        };

        const getSessionDescription = (type: TimerType): string => {
            switch (type) {
                case 'focus':
                    return 'Time to focus.';
                case 'shortBreak':
                    return 'Time to take a break!';
                case 'longBreak':
                    return 'Congrats on completing your focus session! You deserve a long break.';
            }
        };

        toast({
            title: getSessionName(timerType),
            description: getSessionDescription(timerType),
            duration: 3000,
        });
    }, [getInitialTime, timerType, toast]);

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

            // Only update cats' happiness after focus sessions
            if (timerType === 'focus' && user?.username) {
                updateAllCatsHappinessAfterStudy(user.username, cats)
                    .then(() => {
                        refreshCats();
                        toast({
                            title: 'Cats are happier!',
                            description:
                                'Your cats are happy you completed your study session.',
                            duration: 3000,
                        });
                    })
                    .catch((error) => {
                        console.error(
                            'Failed to update cats happiness:',
                            error
                        );
                        toast({
                            title: 'Error',
                            description: 'Failed to update cats happiness.',
                            duration: 3000,
                        });
                    });
            }

            onComplete?.();
        }
    }, [
        timeLeft,
        onComplete,
        isCompleting,
        timerType,
        user?.username,
        cats,
        refreshCats,
        toast,
    ]);

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
