import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface CustomPopoverProps {
    readonly children: React.ReactNode;
    readonly trigger: React.ReactNode;
    readonly className?: string;
    readonly contentClassName?: string;
    readonly align?: 'start' | 'center' | 'end';
    readonly side?: 'top' | 'right' | 'bottom' | 'left';
}

export function CustomPopover({
    children,
    trigger,
    className,
    contentClassName,
    align = 'center',
    side = 'top',
}: CustomPopoverProps) {
    return (
        <Popover>
            <PopoverTrigger asChild className={className}>
                {trigger}
            </PopoverTrigger>
            <PopoverContent
                className={cn('w-80 p-4', contentClassName)}
                align={align}
                side={side}
            >
                {children}
            </PopoverContent>
        </Popover>
    );
}
