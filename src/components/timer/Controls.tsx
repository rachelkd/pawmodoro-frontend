'use client';

import { Button } from '@/components/ui/button';
import { SkipBack, Play, Pause, SkipForward } from 'lucide-react';
import { useSessionContext } from '@/contexts/SessionContext';
import { useTimerContext } from '@/contexts/TimerContext';

export function Controls() {
    const {
        updateSessionInterruption,
        cancelCurrentSession,
        startNewSession,
        currentSession: backendSession,
    } = useSessionContext();

    const {
        isPlaying,
        timerType,
        timeLeft,
        handlePlayPause,
        handleNext,
        handlePrevious,
    } = useTimerContext();

    const handlePlayPauseClick = async () => {
        if (isPlaying && timeLeft && timeLeft > 0) {
            // Only update interruption if we're pausing and timer is still running
            await updateSessionInterruption().catch(console.error);
        } else if (!isPlaying && !backendSession && timeLeft) {
            // If we're starting and there's no current session, create one
            await startNewSession(timerType, Math.ceil(timeLeft / 60)).catch(
                console.error
            );
        }
        handlePlayPause();
    };

    const handleNextClick = async () => {
        // If skipping manually, cancel the current session
        if (backendSession) {
            await cancelCurrentSession().catch(console.error);
        }
        handleNext(false);
    };

    return (
        <div className='flex gap-4'>
            <Button
                variant='ghost'
                size='icon'
                className='bg-white/20 text-white rounded-full w-12 h-12'
                onClick={handlePrevious}
            >
                <SkipBack className='h-5 w-5' fill='currentColor' />
            </Button>
            <Button
                variant='ghost'
                size='icon'
                className='bg-white/20 text-white rounded-full w-12 h-12'
                onClick={handlePlayPauseClick}
            >
                {isPlaying ? (
                    <Pause className='h-5 w-5' fill='currentColor' />
                ) : (
                    <Play className='h-5 w-5' fill='currentColor' />
                )}
            </Button>
            <Button
                variant='ghost'
                size='icon'
                className='bg-white/20 text-white rounded-full w-12 h-12'
                onClick={handleNextClick}
            >
                <SkipForward className='h-5 w-5' fill='currentColor' />
            </Button>
        </div>
    );
}
