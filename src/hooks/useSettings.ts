import { useState, useEffect } from 'react';

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
    updateSettings: (key: keyof Settings, value: Settings[keyof Settings]) => Promise<void>;
}

const DEFAULT_SETTINGS: Settings = {
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    autoStartBreaks: false,
    autoStartFocus: false,
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function useSettings(username?: string): UseSettingsReturn {
    const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
    const [isLoading, setIsLoading] = useState(false); // Start with false for anonymous users
    const [error, setError] = useState<string | null>(null);

    // Get the user data from localStorage
    const getUserData = () => {
        const userData = localStorage.getItem('user');
        if (!userData) return null;
        return JSON.parse(userData);
    };

    useEffect(() => {
        // Skip API calls if no username is provided (anonymous user)
        if (!username) {
            setIsLoading(false);
            setError(null);
            return;
        }

        async function fetchSettings() {
            try {
                setIsLoading(true);
                setError(null);

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
                // Keep using default settings on error
                setSettings(DEFAULT_SETTINGS);
            } finally {
                setIsLoading(false);
            }
        }

        fetchSettings();
    }, [username]);

    const updateSettings = async (
        key: keyof Settings,
        value: Settings[keyof Settings]
    ): Promise<void> => {
        try {
            setError(null);
            
            // For anonymous users or errors, just update local state
            if (!username) {
                setSettings((prev) => ({
                    ...prev,
                    [key]: value,
                }));
                return;
            }

            const userData = getUserData();
            if (!userData?.token) {
                throw new Error('No authentication token found');
            }

            // Optimistically update the UI
            setSettings((prev) => ({
                ...prev,
                [key]: value,
            }));

            const response = await fetch(`${API_URL}/api/settings/${username}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userData.token}`,
                },
                body: JSON.stringify({ [key]: value }),
            });

            if (!response.ok) {
                throw new Error('Failed to update settings');
            }

            const updatedSettings = await response.json();
            setSettings(updatedSettings);
        } catch (err) {
            // For anonymous users, keep the local state update
            if (!username) return;

            // For authenticated users, revert on error
            setSettings((prev) => ({
                ...prev,
                [key]: settings[key],
            }));
            setError(err instanceof Error ? err.message : 'An error occurred');
            throw err;
        }
    };

    return {
        settings,
        isLoading,
        error,
        updateSettings,
    };
} 