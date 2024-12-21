import { STORAGE_KEYS } from '@/constants/storage';
import { useState, useCallback } from 'react';

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
        if (storedSettings) {
            return JSON.parse(storedSettings);
        }
    } catch (err) {
        console.error('Failed to load settings from localStorage:', err);
    }
    return DEFAULT_SETTINGS;
};

export function useSettings(username?: string): UseSettingsReturn {
    // Initialize with stored settings or defaults
    const [settings, setSettings] = useState<Settings>(() => getStoredSettings());
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Get the user data from localStorage
    const getUserData = () => {
        const userData = localStorage.getItem(STORAGE_KEYS.USER);
        if (!userData) return null;
        return JSON.parse(userData);
    };

    const loadSettings = useCallback(async () => {
        setError(null);

        // For non-logged-in users, load from localStorage
        if (!username) {
            try {
                const storedSettings = getStoredSettings();
                setSettings(storedSettings);
            } catch (err) {
                console.error('Failed to load settings from localStorage:', err);
                setSettings(DEFAULT_SETTINGS);
            }
            return;
        }

        // For logged-in users, remove local settings and load from backend
        try {
            localStorage.removeItem(STORAGE_KEYS.SETTINGS);
            setIsLoading(true);

            const userData = getUserData();
            if (!userData?.accessToken) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${API_URL}/api/settings/${username}`, {
                headers: {
                    Authorization: `Bearer ${userData.accessToken}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch settings');
            }

            const data = await response.json();
            setSettings(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            setSettings(DEFAULT_SETTINGS);
        } finally {
            setIsLoading(false);
        }
    }, [username]);

    const saveSettings = async (newSettings: Settings): Promise<void> => {
        setError(null);
        
        // For non-logged-in users, save to localStorage
        if (!username) {
            try {
                localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
                setSettings(newSettings);
            } catch (err) {
                console.error('Failed to save settings to localStorage:', err);
                throw new Error('Failed to save settings');
            }
            return;
        }

        // For logged-in users, remove local settings and save to backend
        try {
            localStorage.removeItem(STORAGE_KEYS.SETTINGS);
            const userData = getUserData();
            if (!userData?.accessToken) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${API_URL}/api/settings/${username}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userData.accessToken}`,
                },
                body: JSON.stringify(newSettings),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update settings');
            }

            const responseData = await response.json();
            setSettings(responseData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            throw err;
        }
    };

    return {
        settings,
        isLoading,
        error,
        saveSettings,
        loadSettings,
    };
} 