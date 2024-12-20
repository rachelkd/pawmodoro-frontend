'use client';

import { Button } from '@/components/ui/button';
import { FaSpotify } from 'react-icons/fa';
import { Package, LineChart, Settings } from 'lucide-react';
import { SettingsPopover } from '@/components/settings/SettingsPopover';
import { useSettings } from '@/hooks/useSettings';
import { useToast } from '@/components/ui';

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
    const { settings, isLoading, error, updateSettings } =
        useSettings(username);
    const { toast } = useToast();

    const handleSettingChange = async <K extends keyof typeof settings>(
        key: K,
        value: (typeof settings)[K]
    ) => {
        try {
            await updateSettings(key, value);
        } catch {
            toast({
                title: 'Error',
                description: error || 'Failed to update settings',
                variant: 'destructive',
            });
        }
    };

    return (
        <footer className='p-6 flex justify-between'>
            <div className='flex gap-6'>
                <SettingsPopover
                    trigger={
                        <Button
                            variant='ghost'
                            size='icon'
                            className='text-white hover:text-white hover:bg-white/30 h-12 w-12 [&_svg]:!size-6'
                            disabled={isLoading}
                        >
                            <Settings size={24} />
                        </Button>
                    }
                    {...settings}
                    onFocusDurationChange={(value) =>
                        handleSettingChange('focusDuration', value)
                    }
                    onShortBreakDurationChange={(value) =>
                        handleSettingChange('shortBreakDuration', value)
                    }
                    onLongBreakDurationChange={(value) =>
                        handleSettingChange('longBreakDuration', value)
                    }
                    onAutoStartBreaksChange={(value) =>
                        handleSettingChange('autoStartBreaks', value)
                    }
                    onAutoStartFocusChange={(value) =>
                        handleSettingChange('autoStartFocus', value)
                    }
                />
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
