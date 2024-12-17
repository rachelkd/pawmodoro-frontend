'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/timer/Header';
import { Timer } from '@/components/timer/Timer';
import { SessionIndicator } from '@/components/timer/SessionIndicator';
import { Controls } from '@/components/timer/Controls';
import { Footer } from '@/components/timer/Footer';

const FOCUS_TIME = 25 * 60; // 25 minutes in seconds
const SHORT_BREAK = 5 * 60; // 5 minutes in seconds
const LONG_BREAK = 15 * 60; // 15 minutes in seconds

export default function Home() {
    const [mounted, setMounted] = useState(false);
    const [currentSession, setCurrentSession] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const getCurrentSessionTime = () => {
        if (currentSession === 3) {
            return LONG_BREAK;
        }
        return currentSession % 2 === 0 ? FOCUS_TIME : SHORT_BREAK;
    };

    const handlePlayPause = () => {
        setIsPlaying(!isPlaying);
    };

    const handleNext = () => {
        setIsPlaying(false);
        setCurrentSession((prev) => (prev + 1) % 4);
    };

    const handlePrevious = () => {
        setIsPlaying(false);
        setCurrentSession((prev) => (prev - 1 + 4) % 4);
    };

    if (!mounted) {
        return null;
    }

    return (
        <div className='min-h-screen bg-sage flex flex-col'>
            <Header isPlaying={isPlaying} />

            <main className='flex-1 flex flex-col items-center justify-center gap-8'>
                <Timer
                    isPlaying={isPlaying}
                    initialTime={getCurrentSessionTime()}
                    onComplete={handleNext}
                />
                <SessionIndicator currentSession={currentSession} />
                <Controls
                    isPlaying={isPlaying}
                    onPlayPause={handlePlayPause}
                    onNext={handleNext}
                    onPrevious={handlePrevious}
                />
            </main>

            <Footer />
        </div>
    );
}
