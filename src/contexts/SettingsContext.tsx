import { createContext, useContext, ReactNode } from 'react';
import { useSettings } from '@/hooks/useSettings';

interface Settings {
    readonly focusDuration: number;
    readonly shortBreakDuration: number;
    readonly longBreakDuration: number;
    readonly autoStartBreaks: boolean;
    readonly autoStartFocus: boolean;
}

interface SettingsContextType {
    readonly settings: Settings;
    readonly isLoading: boolean;
    readonly error: string | null;
    readonly saveSettings: (newSettings: Settings) => Promise<void>;
    readonly loadSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

interface SettingsProviderProps {
    readonly children: ReactNode;
    readonly username?: string;
}

export function SettingsProvider({
    children,
    username,
}: Readonly<SettingsProviderProps>) {
    const settingsData = useSettings(username);

    return (
        <SettingsContext.Provider value={settingsData}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettingsContext() {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error(
            'useSettingsContext must be used within a SettingsProvider'
        );
    }
    return context;
}