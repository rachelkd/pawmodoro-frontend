'use client';

import { useEffect, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCatContext } from '@/contexts/CatContext';
import { useCats } from '@/hooks/use-cats';
import { ToastAction } from '@/components/ui/toast';
import { useSessionContext } from '@/contexts/SessionContext';
import { useTimerContext } from '@/contexts/TimerContext';

export type TimerType = 'focus' | 'shortBreak' | 'longBreak';

interface TimerProps {
    readonly onComplete?: () => void;
    readonly onAdoptClick?: () => void;
}

/**
 * Timer component that displays and manages a countdown timer for focus and break sessions.
 * Supports auto-start functionality based on user settings.
 */
export function Timer({ onComplete, onAdoptClick }: Readonly<TimerProps>) {
    const { toast } = useToast();
    const { refreshCats } = useCatContext();
    const { updateAllCatsHappinessAfterStudy } = useCats();
    const [isCompleting, setIsCompleting] = useState(false);
    const { completeCurrentSession, currentSession } = useSessionContext();
    const {
        isPlaying,
        timerType,
        timeLeft,
        setTimeLeft,
        handleNext,
        setIsPlaying,
    } = useTimerContext();
    const previousTimerType = useRef(timerType);

    // Reset isCompleting when timer type changes
    useEffect(() => {
        console.log('Timer type changed, resetting isCompleting');
        setIsCompleting(false);
    }, [timerType]);

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
    }, [isPlaying, timeLeft, setTimeLeft]);

    // Handle both completion and auto-start
    useEffect(() => {
        console.log('Timer effect running:', {
            timeLeft,
            isCompleting,
            timerType,
        });

        let isSubscribed = true;

        const handleCompletion = async () => {
            try {
                console.log('Starting completion flow');
                setIsCompleting(true);

                // Only try to complete session in backend for focus sessions or if there's an active session
                if (timerType === 'focus' || currentSession) {
                    console.log('Attempting to complete session in backend');
                    await completeCurrentSession();
                    console.log('Session completed in backend');
                } else {
                    console.log(
                        'Skipping backend completion for break without active session'
                    );
                }

                if (timerType === 'focus') {
                    console.log('Updating cat happiness for focus session');
                    try {
                        const result = await updateAllCatsHappinessAfterStudy();

                        refreshCats();

                        // Show success message with count of updated cats
                        const updatedCount = result?.updatedCats.length ?? 0;
                        const failureCount = result?.failures.length ?? 0;

                        let description = '';
                        if (updatedCount > 0) {
                            description = `${updatedCount} ${
                                updatedCount === 1 ? 'cat is' : 'cats are'
                            } happier!`;
                        }
                        if (failureCount > 0) {
                            description += `${
                                description ? ' ' : ''
                            }(${failureCount} ${
                                failureCount === 1 ? 'update' : 'updates'
                            } failed)`;
                        }
                        description += `${
                            description ? '\n' : ''
                        }Want to adopt another cat to join your family?`;

                        toast({
                            title: 'Great work!',
                            description,
                            action: (
                                <ToastAction
                                    altText='Adopt a cat'
                                    onClick={() => onAdoptClick?.()}
                                >
                                    Adopt a cat
                                </ToastAction>
                            ),
                        });
                    } catch (error) {
                        console.error(
                            'Failed to update cats happiness:',
                            error
                        );
                        toast({
                            title: 'Error',
                            description:
                                error instanceof Error
                                    ? error.message
                                    : 'Failed to update cats happiness.',
                        });
                    }
                }

                onComplete?.();

                setIsPlaying(false);
                handleNext(true);
            } catch (error) {
                console.error('Error in completion flow:', error);
                // Even if completion fails, we should still advance
                console.log('Advancing session despite error');
                setIsPlaying(false);
                handleNext(true);
            } finally {
                if (isSubscribed) {
                    console.log('Resetting isCompleting');
                    setIsCompleting(false);
                }
            }
        };

        if (timeLeft === 0 && !isCompleting) {
            handleCompletion();
        }

        return () => {
            console.log('Cleanup: unsubscribing timer effect');
            isSubscribed = false;
        };
    }, [
        timeLeft,
        onComplete,
        isCompleting,
        timerType,
        refreshCats,
        toast,
        updateAllCatsHappinessAfterStudy,
        onAdoptClick,
        completeCurrentSession,
        handleNext,
        setIsPlaying,
        currentSession,
    ]);

    // Show session change toast
    useEffect(() => {
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
    }, [timerType, toast]);

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
