import { useState, useCallback } from 'react';
import { TimerType } from '@/components/timer/Timer';

export function useTimer() {
    const [currentSession, setCurrentSession] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isAutoChange, setIsAutoChange] = useState(false);

    const getTimerType = useCallback((): TimerType => {
        if (currentSession === 3) return 'longBreak';
        return currentSession % 2 === 0 ? 'focus' : 'shortBreak';
    }, [currentSession]);

    const handlePlayPause = useCallback(() => {
        setIsPlaying(prev => !prev);
    }, []);

    const handleNext = useCallback((auto = false) => {
        setIsPlaying(false);
        setIsAutoChange(auto);
        setTimeout(() => {
            setCurrentSession(prev => (prev + 1) % 4);
        }, 0);
    }, []);

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
    };
} 