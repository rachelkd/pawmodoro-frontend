'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { CatProvider } from '@/contexts/CatContext';

interface ProvidersProps {
    readonly children: ReactNode;
}

export function Providers({ children }: Readonly<ProvidersProps>) {
    return (
        <AuthProvider>
            <SettingsProvider>
                <CatProvider>{children}</CatProvider>
            </SettingsProvider>
        </AuthProvider>
    );
}
