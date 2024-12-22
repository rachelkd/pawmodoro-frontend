'use client';

import { Button } from '@/components/ui/button';
import { FaSpotify } from 'react-icons/fa';
import { Package, LineChart, Settings } from 'lucide-react';
import { SettingsPopover } from '@/components/settings/SettingsPopover';
import { useSettings } from '@/hooks/useSettings';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

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
    const { settings, isLoading, saveSettings, loadSettings } =
        useSettings(username);
    const { toast } = useToast();

    // Load settings on mount and when username changes
    useEffect(() => {
        const loadSettingsData = async () => {
            try {
                await loadSettings();
            } catch (err) {
                toast({
                    title: 'Error',
                    description: `Failed to load settings: ${
                        err instanceof Error ? err.message : 'Unknown error'
                    }`,
                    variant: 'destructive',
                });
            }
        };
        loadSettingsData();
    }, [loadSettings, toast, username]); // Only depend on loadSettings, toast, and username

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
                    {...settings}
                    onSaveSettings={saveSettings}
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
