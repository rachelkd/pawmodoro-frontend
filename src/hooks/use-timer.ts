import { useState, useCallback } from 'react';
import { TimerType } from '@/components/timer/Timer';

export interface UseTimerResult {
    currentSession: number;
    isPlaying: boolean;
    isAutoChange: boolean;
    timerType: TimerType;
    timeLeft: number | null;
    initialTime: number | null;
    wasManuallyPaused: boolean;
    handlePlayPause: () => void;
    handleNext: (auto: boolean) => void;
    handlePrevious: () => void;
    setIsPlaying: (value: boolean) => void;
    setTimeLeft: (value: number | null | ((prev: number | null) => number | null)) => void;
    setInitialTime: (value: number | null) => void;
    setWasManuallyPaused: (value: boolean) => void;
}

export function useTimer(): UseTimerResult {
    const [currentSession, setCurrentSession] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isAutoChange, setIsAutoChange] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [initialTime, setInitialTime] = useState<number | null>(null);
    const [wasManuallyPaused, setWasManuallyPaused] = useState(false);

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
        setWasManuallyPaused(false);
        setCurrentSession(prev => (prev + 1) % 4);
    }, []);

    const handlePrevious = useCallback(() => {
        setIsPlaying(false);
        setIsAutoChange(false);
        setWasManuallyPaused(false);
        setCurrentSession(prev => (prev - 1 + 4) % 4);
    }, []);

    return {
        currentSession,
        isPlaying,
        isAutoChange,
        timerType: getTimerType(),
        timeLeft,
        initialTime,
        wasManuallyPaused,
        handlePlayPause,
        handleNext,
        handlePrevious,
        setIsPlaying,
        setTimeLeft,
        setInitialTime,
        setWasManuallyPaused,
    };
} 