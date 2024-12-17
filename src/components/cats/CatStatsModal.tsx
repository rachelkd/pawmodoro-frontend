import { Cat } from '@/interfaces/Cat';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface CatStatsModalProps {
    cat: Cat;
    isOpen: boolean;
    onClose: () => void;
}

export const CatStatsModal = ({ cat, isOpen, onClose }: CatStatsModalProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{cat.name}</DialogTitle>
                </DialogHeader>

                <div className='space-y-4'>
                    <div className='flex justify-between items-center'>
                        <span className='font-medium'>Happiness Level:</span>
                        <div className='flex items-center'>
                            <div className='w-48 h-4 bg-gray-200 rounded-full overflow-hidden'>
                                <div
                                    className='h-full bg-powderBlue'
                                    style={{ width: `${cat.happinessLevel}%` }}
                                />
                            </div>
                            <span className='ml-2'>{cat.happinessLevel}%</span>
                        </div>
                    </div>

                    <div className='flex justify-between items-center'>
                        <span className='font-medium'>Hunger Level:</span>
                        <div className='flex items-center'>
                            <div className='w-48 h-4 bg-gray-200 rounded-full overflow-hidden'>
                                <div
                                    className='h-full bg-frenchGray'
                                    style={{ width: `${cat.hungerLevel}%` }}
                                />
                            </div>
                            <span className='ml-2'>{cat.hungerLevel}%</span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
