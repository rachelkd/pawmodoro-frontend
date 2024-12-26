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
import { useCatContext } from '@/contexts/CatContext';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { CatError } from '@/errors/CatError';

interface CatStatsModalProps {
    cat: Cat;
    isOpen: boolean;
    onClose: () => void;
}

export const CatStatsModal = ({ cat, isOpen, onClose }: CatStatsModalProps) => {
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const { deleteCatByName } = useCatContext();
    const { toast } = useToast();
    const router = useRouter();
    const { logout } = useAuth();

    const handleDelete = async () => {
        try {
            await deleteCatByName(cat.name);
            toast({
                title: 'Cat Deleted',
                description: `${cat.name} has been deleted.`,
            });
            setShowDeleteAlert(false);
            onClose();
        } catch (err) {
            if (err instanceof CatError) {
                if (err.message.includes('Authentication required')) {
                    toast({
                        title: 'Must be logged in',
                        description:
                            'Create an account to keep your cats, save your settings, and see your study habits.',
                        action: (
                            <ToastAction
                                altText='Sign up'
                                onClick={() => router.push('/signup')}
                            >
                                Sign up
                            </ToastAction>
                        ),
                    });
                } else if (err.message.includes('Invalid or expired token')) {
                    toast({
                        variant: 'destructive',
                        title: 'Authentication Error',
                        description: 'Please sign in again.',
                        action: (
                            <ToastAction altText='Sign out' onClick={logout}>
                                Logout
                            </ToastAction>
                        ),
                    });
                } else if (err.message.includes('Network error')) {
                    toast({
                        variant: 'destructive',
                        title: 'Network Error',
                        description:
                            'Please check your internet connection and try again.',
                    });
                } else {
                    toast({
                        variant: 'destructive',
                        title: 'Error',
                        description: err.message,
                    });
                }
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'An unexpected error occurred.',
                });
            }
            console.error(err);
        }
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
