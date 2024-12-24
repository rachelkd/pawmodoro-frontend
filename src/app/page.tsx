'use client';

import { useEffect, useState, useCallback } from 'react';
import { Header } from '@/components/timer/Header';
import { Timer } from '@/components/timer/Timer';
import { SessionIndicator } from '@/components/timer/SessionIndicator';
import { Controls } from '@/components/timer/Controls';
import { Footer } from '@/components/timer/Footer';
import { CatContainer } from '@/components/cats/CatContainer';
import { useTimer } from '@/hooks/useTimer';
import { useSettingsContext } from '@/contexts/SettingsContext';

export default function Home() {
    const [mounted, setMounted] = useState(false);
    const {
        isPlaying,
        timerType,
        currentSession,
        handlePlayPause,
        handleNext,
        handlePrevious,
        setIsPlaying,
        isAutoChange,
    } = useTimer();
    const { settings } = useSettingsContext();

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleTimerComplete = useCallback(() => {
        handleNext(true);
    }, [handleNext]);

    useEffect(() => {
        if (!mounted || !isAutoChange) return;

        const shouldAutoStart =
            timerType === 'focus'
                ? settings.autoStartFocus
                : settings.autoStartBreaks;

        // Delay the auto-start for 1.5 seconds
        if (shouldAutoStart) {
            setTimeout(() => {
                setIsPlaying(true);
            }, 1500);
        }
    }, [
        mounted,
        timerType,
        settings.autoStartFocus,
        settings.autoStartBreaks,
        setIsPlaying,
        isAutoChange,
    ]);

    if (!mounted) return null;

    return (
        <div className='min-h-screen flex flex-col'>
            <Header isPlaying={isPlaying} />
            <main className='flex-1 flex flex-col items-center justify-start gap-8 py-12'>
                <div className='flex-1 flex items-center justify-center w-full'>
                    <div className='flex flex-col items-center justify-center gap-6'>
                        <Timer
                            isPlaying={isPlaying}
                            timerType={timerType}
                            onComplete={handleTimerComplete}
                        />
                        <SessionIndicator currentSession={currentSession} />
                        <Controls
                            isPlaying={isPlaying}
                            onPlayPause={handlePlayPause}
                            onNext={handleNext}
                            onPrevious={handlePrevious}
                        />
                    </div>
                </div>
                <div className='w-full flex flex-col items-center'>
                    <div className='w-full max-w-5xl px-4'>
                        <CatContainer />
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
