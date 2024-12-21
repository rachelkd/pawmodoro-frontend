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

const STORAGE_KEY = 'pawmodoro_settings';
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper function to get settings from localStorage
const getStoredSettings = (): Settings => {
    try {
        const storedSettings = localStorage.getItem(STORAGE_KEY);
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
        const userData = localStorage.getItem('user');
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

        // For logged-in users, load from backend
        try {
            setIsLoading(true);

            const userData = getUserData();
            if (!userData?.token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${API_URL}/api/settings/${username}`, {
                headers: {
                    Authorization: `Bearer ${userData.token}`,
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
                localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
                setSettings(newSettings);
            } catch (err) {
                console.error('Failed to save settings to localStorage:', err);
                throw new Error('Failed to save settings');
            }
            return;
        }

        // For logged-in users, save to backend
        try {
            const userData = getUserData();
            if (!userData?.token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${API_URL}/api/settings/${username}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userData.token}`,
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