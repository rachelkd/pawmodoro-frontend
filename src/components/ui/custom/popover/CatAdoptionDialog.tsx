'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { createCat } from '@/services/CatService';
import { useCatContext } from '@/contexts/CatContext';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { useRouter } from 'next/navigation';
import { CatError } from '@/errors/CatError';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
} from '@/components/ui/alert-dialog';

// Available cat images for adoption
const CAT_IMAGES = [
    'cat-1.png',
    'cat-2.png',
    'cat-3.png',
    'cat-4.png',
    'cat-5.png',
] as const;

interface CatAdoptionDialogProps {
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
    readonly onSuccess?: () => void;
}

export function CatAdoptionDialog({
    open,
    onOpenChange,
    onSuccess,
}: CatAdoptionDialogProps) {
    const { user } = useAuth();
    const { refreshCats, cats } = useCatContext();
    const [catName, setCatName] = useState('');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [direction, setDirection] = useState<'left' | 'right'>('right');
    const { toast } = useToast();
    const { logout } = useAuth();
    const router = useRouter();

    const handlePrevious = () => {
        setDirection('left');
        setCurrentImageIndex((prev) =>
            prev === 0 ? CAT_IMAGES.length - 1 : prev - 1
        );
    };

    const handleNext = () => {
        setDirection('right');
        setCurrentImageIndex((prev) =>
            prev === CAT_IMAGES.length - 1 ? 0 : prev + 1
        );
    };

    const handleSubmit = async () => {
        if (!user?.username) {
            setError('You must be logged in to adopt a cat');
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
            return;
        }

        if (!catName.trim()) {
            setError('Please enter a name for your cat');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await createCat(user.username, {
                name: catName.trim(),
                imageFileName: CAT_IMAGES[currentImageIndex],
            });
            await refreshCats();
            onOpenChange(false);
            setCatName('');
            setCurrentImageIndex(0);
            onSuccess?.();
            toast({
                title: 'Cat Adopted',
                description: `${catName} has joined your family!`,
            });
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
                    setError(err.message);
                }
            } else {
                const errorMessage =
                    err instanceof Error ? err.message : 'Failed to adopt cat';
                setError(errorMessage);
            }
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className='sm:max-w-md'>
                <AlertDialogHeader>
                    <AlertDialogTitle>Adopt a Cat</AlertDialogTitle>
                    <AlertDialogDescription>
                        {cats.length === 0
                            ? 'Welcome to Pawmodoro! Choose your new feline friend and give them a name.'
                            : 'Congrats on completing your focus session! Choose your new feline friend and give them a name.'}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className='flex flex-col gap-6 py-4'>
                    {/* Cat name input */}
                    <div className='space-y-2'>
                        <label
                            htmlFor='catName'
                            className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                        >
                            Cat Name
                        </label>
                        <Input
                            id='catName'
                            value={catName}
                            onChange={(e) => setCatName(e.target.value)}
                            placeholder='Enter a name for your cat'
                            className='w-full placeholder:text-muted'
                            maxLength={20}
                            pattern='^[a-zA-Z]+$'
                            title='Cat name must be 1-20 letters only'
                        />
                    </div>

                    {/* Cat image carousel */}
                    <div className='relative flex items-center justify-center'>
                        <Button
                            variant='ghost'
                            size='icon'
                            className='absolute left-0 z-10'
                            onClick={handlePrevious}
                        >
                            <ChevronLeft className='h-4 w-4' />
                        </Button>

                        <div className='relative w-48 h-48 overflow-hidden'>
                            <div
                                key={currentImageIndex}
                                className={`absolute inset-0 transition-transform duration-300 ease-in-out transform
                                    ${
                                        direction === 'right'
                                            ? 'animate-slide-left'
                                            : 'animate-slide-right'
                                    }`}
                            >
                                <Image
                                    src={`/cats/${CAT_IMAGES[currentImageIndex]}`}
                                    alt={`Cat ${currentImageIndex + 1}`}
                                    className='object-contain [image-rendering:pixelated]'
                                    fill
                                    sizes='(max-width: 768px) 100vw, 192px'
                                    priority
                                    unoptimized
                                    draggable={false}
                                />
                            </div>
                        </div>

                        <Button
                            variant='ghost'
                            size='icon'
                            className='absolute right-0 z-10'
                            onClick={handleNext}
                        >
                            <ChevronRight className='h-4 w-4' />
                        </Button>
                    </div>

                    {error && (
                        <p className='text-sm text-red-400 text-center'>
                            {error}
                        </p>
                    )}
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isSubmitting}>
                        No thanks...
                    </AlertDialogCancel>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className='ml-2'
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                Adopting...
                            </>
                        ) : (
                            'Adopt Cat'
                        )}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
