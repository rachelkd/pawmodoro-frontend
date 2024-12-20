'use client';

import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { CustomPopover } from '@/components/ui/custom/popover/CustomPopover';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface SettingsPopoverProps {
    readonly trigger: ReactNode;
    readonly focusDuration: number;
    readonly shortBreakDuration: number;
    readonly longBreakDuration: number;
    readonly autoStartBreaks: boolean;
    readonly autoStartFocus: boolean;
    readonly onSaveSettings: (settings: {
        focusDuration: number;
        shortBreakDuration: number;
        longBreakDuration: number;
        autoStartBreaks: boolean;
        autoStartFocus: boolean;
    }) => Promise<void>;
}

export function SettingsPopover({
    trigger,
    focusDuration: initialFocusDuration,
    shortBreakDuration: initialShortBreakDuration,
    longBreakDuration: initialLongBreakDuration,
    autoStartBreaks: initialAutoStartBreaks,
    autoStartFocus: initialAutoStartFocus,
    onSaveSettings,
}: SettingsPopoverProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);

    // Local state for form values
    const [localSettings, setLocalSettings] = useState({
        focusDuration: initialFocusDuration,
        shortBreakDuration: initialShortBreakDuration,
        longBreakDuration: initialLongBreakDuration,
        autoStartBreaks: initialAutoStartBreaks,
        autoStartFocus: initialAutoStartFocus,
    });

    // Add new state to track if popover is open
    const [isOpen, setIsOpen] = useState(false);

    // Reset local settings when popover closes
    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            // Reset to initial values when popover closes
            setLocalSettings({
                focusDuration: initialFocusDuration,
                shortBreakDuration: initialShortBreakDuration,
                longBreakDuration: initialLongBreakDuration,
                autoStartBreaks: initialAutoStartBreaks,
                autoStartFocus: initialAutoStartFocus,
            });
        }
    };

    // Update local settings when parent settings change
    useEffect(() => {
        setLocalSettings({
            focusDuration: initialFocusDuration,
            shortBreakDuration: initialShortBreakDuration,
            longBreakDuration: initialLongBreakDuration,
            autoStartBreaks: initialAutoStartBreaks,
            autoStartFocus: initialAutoStartFocus,
        });
    }, [
        initialFocusDuration,
        initialShortBreakDuration,
        initialLongBreakDuration,
        initialAutoStartBreaks,
        initialAutoStartFocus,
    ]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSaveSettings(localSettings);

            toast({
                title: user?.username
                    ? 'Settings saved'
                    : 'Settings saved locally',
                description: user?.username
                    ? 'Your settings have been updated successfully'
                    : 'Log in to sync settings across devices',
            });

            // Close the popover after successful save
            setIsOpen(false);
        } catch (error) {
            // Revert local settings on error
            setLocalSettings({
                focusDuration: initialFocusDuration,
                shortBreakDuration: initialShortBreakDuration,
                longBreakDuration: initialLongBreakDuration,
                autoStartBreaks: initialAutoStartBreaks,
                autoStartFocus: initialAutoStartFocus,
            });

            toast({
                title: 'Error',
                description:
                    error instanceof Error
                        ? error.message
                        : 'Failed to save settings',
                variant: 'destructive',
            });
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
                                onValueChange={([value]) =>
                                    setLocalSettings((prev) => ({
                                        ...prev,
                                        focusDuration: value,
                                    }))
                                }
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
