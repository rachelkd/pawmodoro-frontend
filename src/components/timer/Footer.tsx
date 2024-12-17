'use client';

import { Button } from '@/components/ui/button';
import { FaSpotify } from 'react-icons/fa';
import { Package, LineChart, Settings } from 'lucide-react';

interface FooterProps {
    readonly onSettingsClick?: () => void;
    readonly onSpotifyClick?: () => void;
    readonly onStatsClick?: () => void;
    readonly onInventoryClick?: () => void;
}

export function Footer({
    onSettingsClick,
    onSpotifyClick,
    onStatsClick,
    onInventoryClick,
}: FooterProps) {
    return (
        <footer className='p-6 flex justify-between'>
            <div className='flex gap-6'>
                <Button
                    variant='ghost'
                    size='icon'
                    className='text-white hover:text-white hover:bg-white/30 h-12 w-12 [&_svg]:!size-6'
                    onClick={onSettingsClick}
                >
                    <Settings size={24} />
                </Button>
                <Button
                    variant='ghost'
                    size='icon'
                    className='text-white hover:text-white hover:bg-white/30 h-12 w-12 [&_svg]:!size-6'
                    onClick={onSpotifyClick}
                >
                    <FaSpotify size={24} />
                </Button>
                <Button
                    variant='ghost'
                    size='icon'
                    className='text-white hover:text-white hover:bg-white/30 h-12 w-12 [&_svg]:!size-6'
                    onClick={onStatsClick}
                >
                    <LineChart size={24} />
                </Button>
            </div>
            <Button
                variant='ghost'
                size='icon'
                className='text-white hover:text-white hover:bg-white/30 h-12 w-12 [&_svg]:!size-6'
                onClick={onInventoryClick}
            >
                <Package size={24} />
            </Button>
        </footer>
    );
}
