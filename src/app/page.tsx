'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/timer/Header';
import { Timer, TimerType } from '@/components/timer/Timer';
import { SessionIndicator } from '@/components/timer/SessionIndicator';
import { Controls } from '@/components/timer/Controls';
import { Footer } from '@/components/timer/Footer';
import { CatContainer } from '@/components/cats/CatContainer';
import { useAuth } from '@/contexts/AuthContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { CatProvider } from '@/contexts/CatContext';

export default function Home() {
    const [mounted, setMounted] = useState(false);
    const [currentSession, setCurrentSession] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        setMounted(true);
    }, []);

    const getTimerType = (): TimerType => {
        if (currentSession === 3) return 'longBreak';
        return currentSession % 2 === 0 ? 'focus' : 'shortBreak';
    };

    const handlePlayPause = () => setIsPlaying(!isPlaying);
    const handleNext = () => {
        setIsPlaying(false);
        setCurrentSession((prev) => (prev + 1) % 4);
    };
    const handlePrevious = () => {
        setIsPlaying(false);
        setCurrentSession((prev) => (prev - 1 + 4) % 4);
    };

    if (!mounted) return null;

    return (
        <div className='min-h-screen flex flex-col'>
            <SettingsProvider username={user?.username}>
                <CatProvider>
                    <Header isPlaying={isPlaying} />
                    <main className='flex-1 flex flex-col items-center justify-start gap-8 py-12'>
                        <div className='flex-1 flex items-center justify-center w-full'>
                            <div className='flex flex-col items-center justify-center gap-6'>
                                <Timer
                                    isPlaying={isPlaying}
                                    timerType={getTimerType()}
                                    onComplete={handleNext}
                                />
                                <SessionIndicator
                                    currentSession={currentSession}
                                />
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
                </CatProvider>
            </SettingsProvider>
        </div>
    );
}
