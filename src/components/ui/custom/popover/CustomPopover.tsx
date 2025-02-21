import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface CustomPopoverProps {
    readonly trigger: ReactNode;
    readonly children: ReactNode;
    readonly side?: 'top' | 'right' | 'bottom' | 'left';
    readonly align?: 'start' | 'center' | 'end';
    readonly contentClassName?: string;
    readonly open?: boolean;
    readonly onOpenChange?: (open: boolean) => void;
}

export function CustomPopover({
    trigger,
    children,
    side = 'bottom',
    align = 'center',
    contentClassName,
    open,
    onOpenChange,
}: CustomPopoverProps) {
    return (
        <Popover open={open} onOpenChange={onOpenChange}>
            <PopoverTrigger asChild>{trigger}</PopoverTrigger>
            <PopoverContent
                side={side}
                align={align}
                className={cn(
                    'w-80 bg-popover/10 backdrop-blur-md p-4 border-white/10',
                    contentClassName
                )}
            >
                {children}
            </PopoverContent>
        </Popover>
    );
}
