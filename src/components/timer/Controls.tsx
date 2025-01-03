'use client';

import { Button } from '@/components/ui/button';
import { SkipBack, Play, Pause, SkipForward } from 'lucide-react';

interface ControlsProps {
    readonly onPrevious?: () => void;
    readonly onPlayPause?: () => void;
    readonly onNext?: (auto?: boolean) => void;
    readonly isPlaying?: boolean;
}

export function Controls({
    onPrevious,
    onPlayPause,
    onNext,
    isPlaying = false,
}: ControlsProps) {
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
                onClick={onPlayPause}
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
                onClick={() => onNext?.(false)}
            >
                <SkipForward className='h-5 w-5' fill='currentColor' />
            </Button>
        </div>
    );
}
