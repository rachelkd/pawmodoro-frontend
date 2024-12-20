'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/timer/Header';
import { Timer } from '@/components/timer/Timer';
import { SessionIndicator } from '@/components/timer/SessionIndicator';
import { Controls } from '@/components/timer/Controls';
import { Footer } from '@/components/timer/Footer';
import { CatContainer } from '@/components/cats/CatContainer';
import { Cat } from '@/interfaces/Cat';
import { fetchUserCats } from '@/services/catService';
import { useAuth } from '@/contexts/AuthContext';

const FOCUS_TIME = 25 * 60; // 25 minutes in seconds
const SHORT_BREAK = 5 * 60; // 5 minutes in seconds
const LONG_BREAK = 15 * 60; // 15 minutes in seconds

const DEFAULT_CAT: Cat = {
    name: 'Pawmo',
    ownerUsername: '',
    happinessLevel: 100,
    hungerLevel: 100,
    imageFileName: 'cat-1.png',
};

export default function Home() {
    const [mounted, setMounted] = useState(false);
    const [currentSession, setCurrentSession] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [cats, setCats] = useState<Cat[]>([DEFAULT_CAT]);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const loadCats = async () => {
            if (!user?.username) {
                setCats([DEFAULT_CAT]);
                return;
            }

            try {
                const response = await fetchUserCats(user.username);
                setCats(response.cats);
            } catch (err) {
                setError('Failed to load cats');
                console.error(err);
                setCats([DEFAULT_CAT]);
            }
        };

        loadCats();
    }, [user]);

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

            <main className='flex-1 flex flex-col items-center justify-start gap-8 py-12'>
                <div className='flex-1 flex items-center justify-center w-full'>
                    <div className='flex flex-col items-center justify-center gap-6'>
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
                    </div>
                </div>

                <div className='w-full flex flex-col items-center'>
                    {error && <div className='text-red-500 mb-8'>{error}</div>}
                    <div className='w-full max-w-5xl px-4'>
                        <CatContainer cats={cats} />
                    </div>
                </div>
            </main>

            <Footer username={user?.username} />
        </div>
    );
}
