import { useState, useCallback } from 'react';
import { TimerType } from '@/components/timer/Timer';
import { TIMER_CONSTANTS } from '@/constants/storage';
import { useCats } from '@/hooks/use-cats';
import { useCatContext } from '@/contexts/CatContext';

export function useTimer() {
    const [currentSession, setCurrentSession] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isAutoChange, setIsAutoChange] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [initialTime, setInitialTime] = useState<number | null>(null);
    const { decreaseCatStatsOnSkip } = useCats();
    const { refreshCats } = useCatContext();

    const getTimerType = useCallback((): TimerType => {
        if (currentSession === 3) return 'longBreak';
        return currentSession % 2 === 0 ? 'focus' : 'shortBreak';
    }, [currentSession]);

    const handlePlayPause = useCallback(() => {
        setIsPlaying(prev => !prev);
    }, []);

    const handleNext = useCallback(async (auto = false) => {
        const timerType = getTimerType();
        
        setIsPlaying(false);
        setIsAutoChange(auto);
        setTimeout(() => {
            setCurrentSession(prev => (prev + 1) % 4);
        }, 0);
        
        // Only check for skip penalty during focus sessions
        if (timerType === 'focus' && timeLeft !== null && initialTime !== null && !auto) {
            const timeElapsed = initialTime - timeLeft;
            
            // Check if we should penalize the skip
            if (timeElapsed > TIMER_CONSTANTS.MIN_ELAPSED_TIME_FOR_SKIP_PENALTY && 
                timeLeft > TIMER_CONSTANTS.MIN_TIME_LEFT_FOR_SKIP_PENALTY) {
                try {
                    console.log("Penalizing skip");
                    const result = await decreaseCatStatsOnSkip();
                    if (result?.updatedCats) {
                        // Make sure to refresh the cats in the context
                        await refreshCats();
                        console.log("Updated cats after skip penalty:", result.updatedCats);
                    }
                } catch (error) {
                    console.error('Failed to decrease cat stats on skip:', error);
                }
            }
        }
    }, [timeLeft, initialTime, getTimerType, decreaseCatStatsOnSkip, refreshCats]);

    const handlePrevious = useCallback(() => {
        setIsPlaying(false);
        setIsAutoChange(false);
        setTimeout(() => {
            setCurrentSession(prev => (prev - 1 + 4) % 4);
        }, 0);
    }, []);

    return {
        currentSession,
        isPlaying,
        timerType: getTimerType(),
        handlePlayPause,
        handleNext,
        handlePrevious,
        setIsPlaying,
        isAutoChange,
        timeLeft,
        setTimeLeft,
        initialTime,
        setInitialTime,
    };
} 