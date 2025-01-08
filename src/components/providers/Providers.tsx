'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { CatProvider } from '@/contexts/CatContext';
import { SessionProvider } from '@/contexts/SessionContext';
import { TimerProvider } from '@/contexts/TimerContext';

interface ProvidersProps {
    readonly children: ReactNode;
}

export function Providers({ children }: Readonly<ProvidersProps>) {
    return (
        <AuthProvider>
            <SettingsProvider>
                <CatProvider>
                    <SessionProvider>
                        <TimerProvider>{children}</TimerProvider>
                    </SessionProvider>
                </CatProvider>
            </SettingsProvider>
        </AuthProvider>
    );
}
