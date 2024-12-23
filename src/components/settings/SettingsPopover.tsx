'use client';

import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { CustomPopover } from '@/components/ui/custom/popover/CustomPopover';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useSettingsContext } from '@/contexts/SettingsContext';

interface SettingsPopoverProps {
    readonly trigger: ReactNode;
}

export function SettingsPopover({ trigger }: SettingsPopoverProps) {
    const { user, logout } = useAuth();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);

    // Use the settings hook directly
    const { settings, saveSettings } = useSettingsContext();

    // Local state for form values - initialize from settings
    const [localSettings, setLocalSettings] = useState({
        focusDuration: settings.focusDuration,
        shortBreakDuration: settings.shortBreakDuration,
        longBreakDuration: settings.longBreakDuration,
        autoStartBreaks: settings.autoStartBreaks,
        autoStartFocus: settings.autoStartFocus,
    });

    // Add new state to track if popover is open
    const [isOpen, setIsOpen] = useState(false);

    // Reset local settings when popover closes
    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            // Reset to initial values when popover closes
            setLocalSettings({
                focusDuration: settings.focusDuration,
                shortBreakDuration: settings.shortBreakDuration,
                longBreakDuration: settings.longBreakDuration,
                autoStartBreaks: settings.autoStartBreaks,
                autoStartFocus: settings.autoStartFocus,
            });
        }
    };

    // Update local settings when settings change
    useEffect(() => {
        setLocalSettings({
            focusDuration: settings.focusDuration,
            shortBreakDuration: settings.shortBreakDuration,
            longBreakDuration: settings.longBreakDuration,
            autoStartBreaks: settings.autoStartBreaks,
            autoStartFocus: settings.autoStartFocus,
        });
    }, [settings]);

    const handleSave = async () => {
        console.log('handleSave called'); // Log when save is clicked
        setIsSaving(true);
        try {
            console.log('About to save settings:', localSettings);
            await saveSettings(localSettings);
            console.log('Settings saved successfully');

            toast({
                title: user?.username
                    ? 'Settings saved'
                    : 'Settings saved locally',
                description: user?.username
                    ? 'Your settings have been updated successfully'
                    : 'Log in to sync settings across devices',
                variant: 'default',
            });

            setIsOpen(false);
        } catch (error) {
            console.error('Error saving settings:', error); // Log errors
            // Revert local settings on error
            setLocalSettings({
                focusDuration: settings.focusDuration,
                shortBreakDuration: settings.shortBreakDuration,
                longBreakDuration: settings.longBreakDuration,
                autoStartBreaks: settings.autoStartBreaks,
                autoStartFocus: settings.autoStartFocus,
            });

            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Failed to save settings';

            // Show error toast with sign out action if it's an auth error
            if (errorMessage.includes('Authentication failed')) {
                toast({
                    title: 'Authentication Error',
                    description:
                        'Your session has expired. Please sign out and log in again.',
                    variant: 'destructive',
                    action: (
                        <ToastAction
                            altText='Sign out'
                            onClick={() => logout?.()}
                        >
                            Sign out
                        </ToastAction>
                    ),
                });
            } else {
                toast({
                    title: 'Error',
                    description: errorMessage,
                    variant: 'destructive',
                });
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <CustomPopover
            trigger={trigger}
            side='top'
            align='start'
            open={isOpen}
            onOpenChange={handleOpenChange}
        >
            <div className='space-y-6'>
                <div className='space-y-4'>
                    <h4 className='font-medium leading-none text-white'>
                        Timer Settings
                    </h4>
                    <div className='space-y-4'>
                        <div className='space-y-2'>
                            <Label htmlFor='focus' className='text-white'>
                                Focus Duration:{' '}
                                <span className='text-accent-foreground'>
                                    {localSettings.focusDuration} minutes
                                </span>
                            </Label>
                            <Slider
                                id='focus'
                                min={5}
                                max={90}
                                step={5}
                                value={[localSettings.focusDuration]}
                                onValueChange={([value]) => {
                                    console.log(
                                        'Slider value changed to:',
                                        value
                                    ); // Log value changes
                                    setLocalSettings((prev) => ({
                                        ...prev,
                                        focusDuration: value,
                                    }));
                                }}
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='shortBreak' className='text-white'>
                                Short Break Duration:{' '}
                                <span className='text-accent-foreground'>
                                    {localSettings.shortBreakDuration} minutes
                                </span>
                            </Label>
                            <Slider
                                id='shortBreak'
                                min={1}
                                max={15}
                                step={1}
                                value={[localSettings.shortBreakDuration]}
                                onValueChange={([value]) =>
                                    setLocalSettings((prev) => ({
                                        ...prev,
                                        shortBreakDuration: value,
                                    }))
                                }
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='longBreak' className='text-white'>
                                Long Break Duration:{' '}
                                <span className='text-accent-foreground'>
                                    {localSettings.longBreakDuration} minutes
                                </span>
                            </Label>
                            <Slider
                                id='longBreak'
                                min={5}
                                max={40}
                                step={5}
                                value={[localSettings.longBreakDuration]}
                                onValueChange={([value]) =>
                                    setLocalSettings((prev) => ({
                                        ...prev,
                                        longBreakDuration: value,
                                    }))
                                }
                            />
                        </div>
                    </div>
                </div>
                <div className='space-y-4'>
                    <h4 className='font-medium leading-none text-white'>
                        Automation
                    </h4>
                    <div className='space-y-4'>
                        <div className='flex items-center justify-between'>
                            <Label
                                htmlFor='autoStartBreaks'
                                className='text-white'
                            >
                                Auto-start Breaks
                            </Label>
                            <Switch
                                id='autoStartBreaks'
                                checked={localSettings.autoStartBreaks}
                                onCheckedChange={(value) =>
                                    setLocalSettings((prev) => ({
                                        ...prev,
                                        autoStartBreaks: value,
                                    }))
                                }
                            />
                        </div>
                        <div className='flex items-center justify-between'>
                            <Label
                                htmlFor='autoStartFocus'
                                className='text-white'
                            >
                                Auto-start Focus
                            </Label>
                            <Switch
                                id='autoStartFocus'
                                checked={localSettings.autoStartFocus}
                                onCheckedChange={(value) =>
                                    setLocalSettings((prev) => ({
                                        ...prev,
                                        autoStartFocus: value,
                                    }))
                                }
                            />
                        </div>
                    </div>
                </div>
                <div className='pt-2'>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className='w-full bg-gunmetal text-white'
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                Saving...
                            </>
                        ) : (
                            'Save Settings'
                        )}
                    </Button>
                </div>
            </div>
        </CustomPopover>
    );
}
