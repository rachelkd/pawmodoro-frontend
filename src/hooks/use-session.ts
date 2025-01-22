import { useState, useCallback } from 'react';
import { Session } from '@/interfaces/Session';
import SessionService from '@/services/SessionService';
import { useAuth } from '@/contexts/AuthContext';

export const useSession = () => {
    const [currentSession, setCurrentSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const sessionService = SessionService.getInstance();
    const { user } = useAuth();

    const startSession = useCallback(
        async (sessionType: Session['sessionType'], durationMinutes: number) => {
            if (!user) {
                return;
            }
            
            if (!user.accessToken) {
                throw new Error('No access token available');
            }

            setIsLoading(true);
            try {
                const session = await sessionService.createSession(
                    { sessionType, durationMinutes },
                    user.accessToken
                );
                setCurrentSession(session);
                return session;
            } catch (err) {
                console.error('Failed to start session:', err);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        [sessionService, user]
    );

    const completeSession = useCallback(async () => {
        if (!currentSession?.id || !user?.accessToken) return;

        setIsLoading(true);
        try {
            const completedSession = await sessionService.completeSession(
                currentSession.id,
                user.accessToken
            );
            setCurrentSession(null);
            return completedSession;
        } catch (err) {
            console.error('Failed to complete session:', err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [currentSession?.id, sessionService, user?.accessToken]);

    const cancelSession = useCallback(async () => {
        if (!currentSession?.id || !user?.accessToken) return;

        setIsLoading(true);
        try {
            const cancelledSession = await sessionService.cancelSession(
                currentSession.id,
                user.accessToken
            );
            setCurrentSession(null);
            return cancelledSession;
        } catch (err) {
            console.error('Failed to cancel session:', err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [currentSession?.id, sessionService, user?.accessToken]);

    const cancelSessionSync = useCallback(() => {
        if (!currentSession?.id || !user?.accessToken) return;
        try {
            sessionService.cancelSessionSync(currentSession.id, user.accessToken);
        } catch (err: unknown) {
            console.error('Failed to cancel session on unload:', err);
        }
    }, [currentSession?.id, sessionService, user?.accessToken]);

    const updateInterruption = useCallback(async () => {
        if (!currentSession?.id || !user?.accessToken) return;

        setIsLoading(true);
        try {
            const updatedSession = await sessionService.updateInterruption(
                currentSession.id,
                user.accessToken
            );
            setCurrentSession(updatedSession);
            return updatedSession;
        } catch (err) {
            console.error('Failed to update interruption:', err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [currentSession?.id, sessionService, user?.accessToken]);

    return {
        currentSession,
        isLoading,
        startSession,
        completeSession,
        cancelSession,
        cancelSessionSync,
        updateInterruption,
    };
};
