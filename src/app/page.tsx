'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/timer/Header';
import { Timer } from '@/components/timer/Timer';
import { SessionIndicator } from '@/components/timer/SessionIndicator';
import { Controls } from '@/components/timer/Controls';
import { Footer } from '@/components/timer/Footer';
import { CatAdoptionDialog } from '@/components/ui/custom/popover/CatAdoptionDialog';
import { CatContainer } from '@/components/cats/CatContainer';
import { useCatContext } from '@/contexts/CatContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { useRouter } from 'next/navigation';
import { useTimerContext } from '@/contexts/TimerContext';

export default function Home() {
    const [mounted, setMounted] = useState(false);
    const [isAdoptionOpen, setIsAdoptionOpen] = useState(false);
    const [isPostSession, setIsPostSession] = useState(false);
    const [hasShownInitialDialog, setHasShownInitialDialog] = useState(false);

    const { cats } = useCatContext();
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const { isPlaying, timerType, handleNext, currentSession } =
        useTimerContext();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Show initial adoption dialog for new users (logged in with no cats).
    // This only shows once per user login session.
    useEffect(() => {
        if (
            user &&
            cats.length === 0 &&
            !isPostSession &&
            !hasShownInitialDialog
        ) {
            setIsAdoptionOpen(true);
            setHasShownInitialDialog(true);
        }
    }, [user, cats, isPostSession, hasShownInitialDialog]);

    // Reset hasShownInitialDialog when user changes (login/logout)
    useEffect(() => {
        setHasShownInitialDialog(false);
    }, [user]);

    /**
     * Handles the completion of a timer session.
     * For focus sessions:
     * - If user has cats: Shows a toast with option to adopt more cats and advances
     * - If user has no cats: Shows adoption dialog (advances after dialog closes)
     * - If not logged in: Shows signup toast and advances
     * For break sessions:
     * - Advances to next session immediately
     */
    const handleTimerComplete = async () => {
        if (timerType === 'focus') {
            if (user && cats.length === 0) {
                // For new users: show dialog and advance after it closes
                setIsPostSession(true);
                setIsAdoptionOpen(true);
            } else if (!user) {
                // For non-logged in users: show signup toast
                toast({
                    title: 'Great work!',
                    description:
                        'Sign up to adopt virtual cats and track your progress!',
                    action: (
                        <ToastAction
                            altText='Sign up'
                            onClick={() => router.push('/signup')}
                        >
                            Sign up
                        </ToastAction>
                    ),
                });
            }
        }
    };

    /**
     * Handles the closing of the adoption dialog.
     * Only advances to next session if:
     * 1. Dialog is being closed (open === false)
     * 2. We're in a focus session (timerType === 'focus')
     * 3. This dialog was shown after completing a session (isPostSession === true)
     *    Note: This only applies to users with no cats, as users with cats
     *    advance immediately after session completion.
     */
    const handleAdoptionDialogClose = (open: boolean) => {
        setIsAdoptionOpen(open);
        // TODO: Check if timer waits for dialog to close before advancing
        if (!open && timerType === 'focus' && isPostSession) {
            handleNext(true);
            setIsPostSession(false);
        }
    };

    if (!mounted) return null;

    return (
        <div className='min-h-screen flex flex-col'>
            <Header isPlaying={isPlaying} />
            <main className='flex-1 flex flex-col items-center justify-start gap-8 py-12'>
                <div className='flex-1 flex items-center justify-center w-full'>
                    <div className='flex flex-col items-center justify-center gap-6'>
                        <Timer
                            onComplete={handleTimerComplete}
                            onAdoptClick={() => setIsAdoptionOpen(true)}
                        />
                        <SessionIndicator currentSession={currentSession} />
                        <Controls />
                    </div>
                </div>
                <div className='w-full flex flex-col items-center'>
                    <div className='w-full max-w-5xl px-4'>
                        <CatContainer />
                    </div>
                </div>
                <CatAdoptionDialog
                    open={isAdoptionOpen}
                    onOpenChange={handleAdoptionDialogClose}
                />
            </main>
            <Footer />
        </div>
    );
}
