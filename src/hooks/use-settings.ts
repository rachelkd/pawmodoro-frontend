import { STORAGE_KEYS } from '@/constants/storage';
import { useState, useCallback, useEffect } from 'react';
import { User } from '@/interfaces/User';
import { Settings, DEFAULT_SETTINGS } from '@/interfaces/Settings';
import { fetchUserSettings, updateUserSettings } from '@/services/SettingsService';

interface UseSettingsReturn {
    settings: Settings;
    isLoading: boolean;
    error: string | null;
    saveSettings: (newSettings: Settings) => Promise<void>;
    loadSettings: () => Promise<void>;
}

// Helper function to safely check if we're in a browser environment
const isBrowser = () => typeof window !== 'undefined';

// Helper function to get settings from localStorage
const getStoredSettings = (): Settings => {
    if (!isBrowser()) {
        return DEFAULT_SETTINGS;
    }

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
    if (!isBrowser()) {
        return null;
    }

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
            if (!userData?.accessToken) {
                // If no user data is available yet, just use stored settings
                setSettings(getStoredSettings());
                return;
            }

            const settingsData = await fetchUserSettings(username, userData.accessToken);
            setSettings(settingsData);
            // Also update localStorage for offline access
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settingsData));
        } catch (err) {
            console.error('Failed to fetch settings:', err);
            setError(err instanceof Error ? err.message : 'An error occurred. Please check your internet connection and try again.');
            setSettings(getStoredSettings());
        } finally {
            setIsLoading(false);
        }
    }, [username]);

    // Get user data for the effect dependency
    const userData = getUserData();
    const accessToken = userData?.accessToken;

    // Load settings when the component mounts or when username/token changes
    useEffect(() => {
        loadSettings();
    }, [username, accessToken, loadSettings]);

    const saveSettings = useCallback(async (newSettings: Settings): Promise<void> => {
        setError(null);
        const previousSettings = settings;

        try {
            setSettings(newSettings);

            // Always save to localStorage for offline access
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));

            // If no username, we're done (guest mode)
            if (!username) {
                return;
            }

            const userData = getUserData();
            if (!userData?.accessToken) throw new Error('Authentication failed. Please sign out and log in again.');

            await updateUserSettings(username, userData.accessToken, newSettings);
        } catch (err) {
            setSettings(previousSettings);
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(previousSettings));
            setError(err instanceof Error ? err.message : 'An error occurred. Please check your internet connection and try again.');
            throw err;
        }
    }, [username, settings]);

    return { settings, isLoading, error, saveSettings, loadSettings };
} 