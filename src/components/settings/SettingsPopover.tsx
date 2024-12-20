import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { CustomPopover } from '@/components/ui/custom/popover/CustomPopover';

interface SettingsPopoverProps {
    readonly trigger: React.ReactNode;
    readonly focusDuration: number;
    readonly shortBreakDuration: number;
    readonly longBreakDuration: number;
    readonly autoStartBreaks: boolean;
    readonly autoStartFocus: boolean;
    readonly onFocusDurationChange: (value: number) => void;
    readonly onShortBreakDurationChange: (value: number) => void;
    readonly onLongBreakDurationChange: (value: number) => void;
    readonly onAutoStartBreaksChange: (value: boolean) => void;
    readonly onAutoStartFocusChange: (value: boolean) => void;
}

export function SettingsPopover({
    trigger,
    focusDuration,
    shortBreakDuration,
    longBreakDuration,
    autoStartBreaks,
    autoStartFocus,
    onFocusDurationChange,
    onShortBreakDurationChange,
    onLongBreakDurationChange,
    onAutoStartBreaksChange,
    onAutoStartFocusChange,
}: SettingsPopoverProps) {
    return (
        <CustomPopover
            trigger={trigger}
            side='top'
            align='start'
            contentClassName='bg-white/10 backdrop-blur-md border-white/20'
        >
            <div className='space-y-6'>
                <div className='space-y-4'>
                    <h4 className='font-medium leading-none text-white'>
                        Timer Settings
                    </h4>
                    <div className='space-y-4'>
                        <div className='space-y-2'>
                            <Label htmlFor='focus' className='text-white'>
                                Focus Duration: {focusDuration} minutes
                            </Label>
                            <Slider
                                id='focus'
                                min={1}
                                max={60}
                                step={1}
                                value={[focusDuration]}
                                onValueChange={([value]) =>
                                    onFocusDurationChange(value)
                                }
                                className='[&_[role=slider]]:bg-white'
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='shortBreak' className='text-white'>
                                Short Break Duration: {shortBreakDuration}{' '}
                                minutes
                            </Label>
                            <Slider
                                id='shortBreak'
                                min={1}
                                max={15}
                                step={1}
                                value={[shortBreakDuration]}
                                onValueChange={([value]) =>
                                    onShortBreakDurationChange(value)
                                }
                                className='[&_[role=slider]]:bg-white'
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='longBreak' className='text-white'>
                                Long Break Duration: {longBreakDuration} minutes
                            </Label>
                            <Slider
                                id='longBreak'
                                min={1}
                                max={30}
                                step={1}
                                value={[longBreakDuration]}
                                onValueChange={([value]) =>
                                    onLongBreakDurationChange(value)
                                }
                                className='[&_[role=slider]]:bg-white'
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
                                checked={autoStartBreaks}
                                onCheckedChange={onAutoStartBreaksChange}
                                className='data-[state=checked]:bg-white data-[state=checked]:text-black'
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
                                checked={autoStartFocus}
                                onCheckedChange={onAutoStartFocusChange}
                                className='data-[state=checked]:bg-white data-[state=checked]:text-black'
                            />
                        </div>
                    </div>
                </div>
            </div>
        </CustomPopover>
    );
}
