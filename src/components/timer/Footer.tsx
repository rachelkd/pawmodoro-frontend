'use client';

import { Button } from '@/components/ui/button';
import { FaSpotify } from 'react-icons/fa';
import { Package, LineChart, Settings } from 'lucide-react';
import { SettingsPopover } from '@/components/settings/SettingsPopover';
import { useSettings } from '@/hooks/useSettings';

interface FooterProps {
    readonly username?: string;
    readonly onSpotifyClick?: () => void;
    readonly onStatsClick?: () => void;
    readonly onInventoryClick?: () => void;
}

export function Footer({
    username,
    onSpotifyClick,
    onStatsClick,
    onInventoryClick,
}: FooterProps) {
    const { isLoading } = useSettings(username);

    return (
        <footer className='p-6 flex justify-between'>
            <div className='flex gap-6'>
                <SettingsPopover
                    trigger={
                        <Button
                            variant='ghost'
                            size='icon'
                            className='h-12 w-12 [&_svg]:size-6'
                            disabled={isLoading}
                        >
                            <Settings size={24} />
                        </Button>
                    }
                />
                <Button
                    variant='ghost'
                    size='icon'
                    className='h-12 w-12 [&_svg]:size-6'
                    onClick={onSpotifyClick}
                >
                    <FaSpotify size={24} />
                </Button>
                <Button
                    variant='ghost'
                    size='icon'
                    className='h-12 w-12 [&_svg]:size-6'
                    onClick={onStatsClick}
                >
                    <LineChart size={24} />
                </Button>
            </div>
            <Button
                variant='ghost'
                size='icon'
                className='h-12 w-12 [&_svg]:size-6'
                onClick={onInventoryClick}
            >
                <Package size={24} />
            </Button>
        </footer>
    );
}
