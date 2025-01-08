import {
    createContext,
    useContext,
    ReactNode,
    useCallback,
    useEffect,
    useMemo,
} from 'react';
import { Session } from '@/interfaces/Session';
import { useSession } from '@/hooks/use-session';
import { TimerType } from '@/components/timer/Timer';

interface SessionContextType {
    currentSession: Session | null;
    isLoading: boolean;
    startNewSession: (
        timerType: TimerType,
        durationMinutes: number
    ) => Promise<void>;
    completeCurrentSession: () => Promise<void>;
    cancelCurrentSession: () => Promise<void>;
    updateSessionInterruption: (isAutoChange?: boolean) => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
    const {
        currentSession,
        isLoading,
        startSession,
        completeSession,
        cancelSession,
        cancelSessionSync,
        updateInterruption,
    } = useSession();

    // Convert TimerType to Session type
    const convertTimerTypeToSessionType = (
        type: TimerType
    ): Session['sessionType'] => {
        switch (type) {
            case 'focus':
                return 'FOCUS';
            case 'shortBreak':
                return 'SHORT_BREAK';
            case 'longBreak':
                return 'LONG_BREAK';
        }
    };

    const startNewSession = useCallback(
        async (timerType: TimerType, durationMinutes: number) => {
            try {
                await startSession(
                    convertTimerTypeToSessionType(timerType),
                    durationMinutes
                );
            } catch (err) {
                console.error('Failed to start new session:', err);
            }
        },
        [startSession]
    );

    const completeCurrentSession = useCallback(async () => {
        try {
            await completeSession();
        } catch (err) {
            console.error('Failed to complete session:', err);
        }
    }, [completeSession]);

    const cancelCurrentSession = useCallback(async () => {
        try {
            await cancelSession();
        } catch (err) {
            console.error('Failed to cancel session:', err);
        }
    }, [cancelSession]);

    const updateSessionInterruption = useCallback(async () => {
        try {
            await updateInterruption();
        } catch (err) {
            console.error('Failed to update session interruption:', err);
        }
    }, [updateInterruption]);

    // Clean up only on page unload
    useEffect(() => {
        const handleUnload = () => {
            if (currentSession?.id) {
                cancelSessionSync();
            }
        };

        window.addEventListener('beforeunload', handleUnload);
        return () => {
            window.removeEventListener('beforeunload', handleUnload);
        };
    }, [currentSession?.id, cancelSessionSync]);

    const value = useMemo(
        () => ({
            currentSession,
            isLoading,
            startNewSession,
            completeCurrentSession,
            cancelCurrentSession,
            updateSessionInterruption,
        }),
        [
            currentSession,
            isLoading,
            startNewSession,
            completeCurrentSession,
            cancelCurrentSession,
            updateSessionInterruption,
        ]
    );

    return (
        <SessionContext.Provider value={value}>
            {children}
        </SessionContext.Provider>
    );
}

export function useSessionContext() {
    const context = useContext(SessionContext);
    if (context === undefined) {
        throw new Error(
            'useSessionContext must be used within a SessionProvider'
        );
    }
    return context;
}
