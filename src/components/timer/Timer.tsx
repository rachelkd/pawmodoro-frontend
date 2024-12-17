'use client';

import { useEffect, useState } from 'react';

interface TimerProps {
    isPlaying: boolean;
    initialTime: number;
    onComplete?: () => void;
}

export function Timer({
    isPlaying = false,
    initialTime = 1200,
    onComplete,
}: TimerProps) {
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    useEffect(() => {
        setTimeLeft(initialTime);
    }, [initialTime]);

    useEffect(() => {
        if (!timeLeft) return;

        let intervalId: NodeJS.Timeout;

        if (isPlaying && timeLeft > 0) {
            intervalId = setInterval(() => {
                setTimeLeft((prev) => {
                    const newTime = prev && prev > 0 ? prev - 1 : 0;
                    return newTime;
                });
            }, 1000);
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [isPlaying, timeLeft]);

    useEffect(() => {
        if (timeLeft === 0) {
            onComplete?.();
        }
    }, [timeLeft, onComplete]);

    if (timeLeft === null) {
        return (
            <div className='flex items-center justify-center text-white text-8xl md:text-9xl font-medium tracking-tight select-none'>
                <div className='w-[160px] text-right'>--</div>
                <div className='w-[60px] text-center'>:</div>
                <div className='w-[160px] text-left'>--</div>
            </div>
        );
    }

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div className='flex items-center justify-center text-white text-8xl md:text-9xl font-medium tracking-tight select-none'>
            <div className='w-[160px] text-right'>
                {String(minutes).padStart(2, '0')}
            </div>
            <div className='w-[60px] text-center'>:</div>
            <div className='w-[160px] text-left'>
                {String(seconds).padStart(2, '0')}
            </div>
        </div>
    );
}
