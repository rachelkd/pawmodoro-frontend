import { STORAGE_KEYS } from '@/constants/storage';
import { useState, useCallback } from 'react';
import { User } from '@/interfaces/User';

interface Settings {
    focusDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    autoStartBreaks: boolean;
    autoStartFocus: boolean;
}

interface UseSettingsReturn {
    settings: Settings;
    isLoading: boolean;
    error: string | null;
    saveSettings: (newSettings: Settings) => Promise<void>;
    loadSettings: () => Promise<void>;
}

const DEFAULT_SETTINGS: Settings = {
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    autoStartBreaks: false,
    autoStartFocus: false,
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper function to get settings from localStorage
const getStoredSettings = (): Settings => {
    try {
        const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        return storedSettings ? JSON.parse(storedSettings) : DEFAULT_SETTINGS;
    } catch (err) {
        console.error('Failed to load settings from localStorage:', err);
        return DEFAULT_SETTINGS;
    }
};

// Update the getUserData helper function
const getUserData = (): User | null => {
    try {
        const userData = localStorage.getItem(STORAGE_KEYS.USER);
        if (!userData) return null;
        return JSON.parse(userData);
    } catch (err) {
        console.error('Failed to parse user data:', err);
        return null;
    }
};

export function useSettings(username?: string): UseSettingsReturn {
    const [settings, setSettings] = useState<Settings>(getStoredSettings);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadSettings = useCallback(async () => {
        if (!username) {
            setSettings(getStoredSettings());
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const userData = getUserData();
            if (!userData?.accessToken) throw new Error('No authentication token found');

            const response = await fetch(`${API_URL}/api/settings/${username}`, {
                headers: { Authorization: `Bearer ${userData.accessToken}` },
            });

            if (!response.ok) {
                throw new Error(
                    response.status === 401
                        ? 'Authentication failed - please sign out and log in again'
                        : 'Failed to fetch settings'
                );
            }

            const data = await response.json();
            setSettings(data);
        } catch (err) {
            console.error('Failed to fetch settings:', err);
            setError(err instanceof Error ? err.message : 'An error occurred');
            setSettings(getStoredSettings());
        } finally {
            setIsLoading(false);
        }
    }, [username]);

    const saveSettings = useCallback(async (newSettings: Settings): Promise<void> => {
        setError(null);
        const previousSettings = settings;

        try {
            setSettings(newSettings);

            if (!username) {
                localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
                return;
            }

            const userData = getUserData();
            if (!userData?.accessToken) throw new Error('No authentication token found');

            const response = await fetch(`${API_URL}/api/settings/${username}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userData.accessToken}`,
                },
                body: JSON.stringify(newSettings),
            });

            if (!response.ok) {
                throw new Error(
                    response.status === 401
                        ? 'Authentication failed - please sign out and log in again'
                        : 'Failed to update settings'
                );
            }
        } catch (err) {
            setSettings(previousSettings);
            setError(err instanceof Error ? err.message : 'An error occurred');
            throw err;
        }
    }, [username, settings]);

    return { settings, isLoading, error, saveSettings, loadSettings };
} 