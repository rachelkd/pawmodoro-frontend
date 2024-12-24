'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { createCat } from '@/services/catService';
import { useCats } from '@/contexts/CatContext';
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
    const { refreshCats } = useCats();
    const [catName, setCatName] = useState('');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [direction, setDirection] = useState<'left' | 'right'>('right');

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
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Failed to adopt cat'
            );
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
                        Choose your new feline friend and give them a name.
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
                        <p className='text-sm text-destructive text-center'>
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
