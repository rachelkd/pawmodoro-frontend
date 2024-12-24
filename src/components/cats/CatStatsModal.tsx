import { Cat } from '@/interfaces/Cat';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useCats } from '@/contexts/CatContext';
import { useState } from 'react';

interface CatStatsModalProps {
    cat: Cat;
    isOpen: boolean;
    onClose: () => void;
}

export const CatStatsModal = ({ cat, isOpen, onClose }: CatStatsModalProps) => {
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const { deleteCatByName: deleteCatById } = useCats();

    const handleDelete = async () => {
        await deleteCatById(cat.name);
        setShowDeleteAlert(false);
        onClose();
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{cat.name}</DialogTitle>
                    </DialogHeader>

                    <div className='space-y-4'>
                        <div className='flex justify-between items-center'>
                            <span className='font-medium'>
                                Happiness Level:
                            </span>
                            <div className='flex items-center'>
                                <div className='w-48 h-4 bg-accent rounded-full overflow-hidden'>
                                    <div
                                        className='h-full bg-powderBlue'
                                        style={{
                                            width: `${cat.happinessLevel}%`,
                                        }}
                                    />
                                </div>
                                <span className='ml-2'>
                                    {cat.happinessLevel}%
                                </span>
                            </div>
                        </div>

                        <div className='flex justify-between items-center'>
                            <span className='font-medium'>Hunger Level:</span>
                            <div className='flex items-center'>
                                <div className='w-48 h-4 bg-accent rounded-full overflow-hidden'>
                                    <div
                                        className='h-full bg-frenchGray'
                                        style={{ width: `${cat.hungerLevel}%` }}
                                    />
                                </div>
                                <span className='ml-2'>{cat.hungerLevel}%</span>
                            </div>
                        </div>

                        <div className='pt-4'>
                            <Button
                                variant='destructive'
                                onClick={() => setShowDeleteAlert(true)}
                                className='w-full'
                            >
                                Delete Cat
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <AlertDialog
                open={showDeleteAlert}
                onOpenChange={setShowDeleteAlert}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete {cat.name}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};
