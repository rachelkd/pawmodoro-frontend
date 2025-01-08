import {
    createContext,
    useContext,
    ReactNode,
    useEffect,
    useMemo,
    useCallback,
    useState,
} from 'react';
import { useSettingsContext } from './SettingsContext';
import { useSessionContext } from './SessionContext';
import { TIMER_CONSTANTS } from '@/constants/storage';
import { useCats } from '@/hooks/use-cats';
import { useCatContext } from '@/contexts/CatContext';
import { useToast } from '@/hooks/use-toast';
import { useTimer, UseTimerResult } from '@/hooks/use-timer';

const TimerContext = createContext<UseTimerResult | undefined>(undefined);

export function TimerProvider({ children }: { children: ReactNode }) {
    const {
        currentSession,
        isPlaying,
        isAutoChange,
        timerType,
        timeLeft,
        initialTime,
        handlePlayPause: baseHandlePlayPause,
        handleNext: baseHandleNext,
        handlePrevious,
        setIsPlaying,
        setTimeLeft,
        setInitialTime,
    } = useTimer();

    const { settings } = useSettingsContext();
    const { decreaseCatStatsOnSkip } = useCats();
    const { refreshCats } = useCatContext();
    const { startNewSession } = useSessionContext();
    const { toast } = useToast();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Get initial time based on timer type
    const getInitialTime = useCallback(() => {
        switch (timerType) {
            case 'focus':
                return settings.focusDuration * 60;
            case 'shortBreak':
                return settings.shortBreakDuration * 60;
            case 'longBreak':
                return settings.longBreakDuration * 60;
        }
    }, [timerType, settings]);

    // Update time when timer type changes
    useEffect(() => {
        const newInitialTime = getInitialTime();
        setTimeLeft(newInitialTime);
        setInitialTime(newInitialTime);
    }, [timerType, settings, getInitialTime, setTimeLeft, setInitialTime]);

    // Handle auto-start functionality
    useEffect(() => {
        if (!mounted || !isAutoChange) return;

        const shouldAutoStart =
            timerType === 'focus'
                ? settings.autoStartFocus
                : settings.autoStartBreaks;

        console.log('Auto-start check:', { shouldAutoStart, timerType });

        if (shouldAutoStart && timeLeft) {
            // Delay the auto-start for 1.5 seconds
            const timer = setTimeout(async () => {
                console.log('Auto-starting timer:', { timerType });
                // Create new session before starting
                await startNewSession(
                    timerType,
                    Math.ceil(timeLeft / 60)
                ).catch(console.error);
                setIsPlaying(true);
            }, 1500);

            return () => clearTimeout(timer);
        }
    }, [
        mounted,
        isAutoChange,
        timerType,
        settings.autoStartFocus,
        settings.autoStartBreaks,
        timeLeft,
        startNewSession,
        setIsPlaying,
    ]);

    // Wrap handleNext to add cat-related functionality
    const handleNext = useCallback(
        async (auto = false) => {
            const currentType = timerType;

            // Only check for skip penalty during focus sessions and non-auto skips
            if (
                currentType === 'focus' &&
                timeLeft !== null &&
                initialTime !== null &&
                !auto
            ) {
                const timeElapsed = initialTime - timeLeft;

                if (
                    timeElapsed >=
                        TIMER_CONSTANTS.MIN_ELAPSED_TIME_FOR_SKIP_PENALTY &&
                    timeLeft >= TIMER_CONSTANTS.MIN_TIME_LEFT_FOR_SKIP_PENALTY
                ) {
                    try {
                        const result = await decreaseCatStatsOnSkip();
                        if (result) {
                            await refreshCats();
                            toast({
                                title: 'Focus session skipped',
                                description: result.message,
                                variant: 'destructive',
                            });
                        }
                    } catch (error) {
                        console.error(
                            'Failed to decrease cat stats on skip:',
                            error
                        );
                    }
                }
            }

            // Call the base handleNext from the hook
            baseHandleNext(auto);
        },
        [
            timerType,
            timeLeft,
            initialTime,
            decreaseCatStatsOnSkip,
            refreshCats,
            toast,
            baseHandleNext,
        ]
    );

    const value = useMemo(
        () => ({
            currentSession,
            isPlaying,
            isAutoChange,
            timerType,
            timeLeft,
            initialTime,
            handlePlayPause: baseHandlePlayPause,
            handleNext,
            handlePrevious,
            setIsPlaying,
            setTimeLeft,
            setInitialTime,
        }),
        [
            currentSession,
            isPlaying,
            isAutoChange,
            timerType,
            timeLeft,
            initialTime,
            baseHandlePlayPause,
            handleNext,
            handlePrevious,
            setIsPlaying,
            setTimeLeft,
            setInitialTime,
        ]
    );

    return (
        <TimerContext.Provider value={value}>{children}</TimerContext.Provider>
    );
}

export function useTimerContext() {
    const context = useContext(TimerContext);
    if (context === undefined) {
        throw new Error('useTimerContext must be used within a TimerProvider');
    }
    return context;
}
