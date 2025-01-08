'use client';

import { Button } from '@/components/ui/button';
import { SkipBack, Play, Pause, SkipForward } from 'lucide-react';
import { useSessionContext } from '@/contexts/SessionContext';
import { TimerType } from './Timer';

interface ControlsProps {
    readonly onPrevious?: () => void;
    readonly onPlayPause?: () => void;
    readonly onNext?: (auto?: boolean) => void;
    readonly isPlaying?: boolean;
    readonly timerType: TimerType;
    readonly timeLeft: number | null;
}

export function Controls({
    onPrevious,
    onPlayPause,
    onNext,
    isPlaying = false,
    timerType,
    timeLeft,
}: ControlsProps) {
    const {
        updateSessionInterruption,
        cancelCurrentSession,
        startNewSession,
        currentSession,
    } = useSessionContext();

    const handlePlayPause = async () => {
        if (isPlaying) {
            // If we're pausing, update the interruption count
            await updateSessionInterruption().catch(console.error);
        } else if (!currentSession && timeLeft) {
            // If we're starting and there's no current session, create one
            await startNewSession(timerType, Math.ceil(timeLeft / 60)).catch(
                console.error
            );
        }
        onPlayPause?.();
    };

    const handleNext = async () => {
        // If skipping manually, cancel the current session
        await cancelCurrentSession().catch(console.error);
        onNext?.(false);
    };

    return (
        <div className='flex gap-4'>
            <Button
                variant='ghost'
                size='icon'
                className='bg-white/20 text-white rounded-full w-12 h-12'
                onClick={onPrevious}
            >
                <SkipBack className='h-5 w-5' fill='currentColor' />
            </Button>
            <Button
                variant='ghost'
                size='icon'
                className='bg-white/20 text-white rounded-full w-12 h-12'
                onClick={handlePlayPause}
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
                onClick={handleNext}
            >
                <SkipForward className='h-5 w-5' fill='currentColor' />
            </Button>
        </div>
    );
}
