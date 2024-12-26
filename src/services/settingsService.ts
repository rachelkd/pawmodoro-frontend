import { Settings } from '@/interfaces/Settings';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Fetches user settings from the API
 * @param username - The username to fetch settings for
 * @param accessToken - The user's access token
 * @returns Promise containing the user's settings
 * @throws Error if the fetch request fails
 */
export const fetchUserSettings = async (username: string, accessToken: string): Promise<Settings> => {
    const response = await fetch(`${API_URL}/api/settings/${username}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
        throw new Error(
            response.status === 401
                ? 'Authentication failed - please sign out and log in again'
                : 'Failed to fetch settings'
        );
    }

    const data = await response.json();
    return {
        focusDuration: data.focusDuration,
        shortBreakDuration: data.shortBreakDuration,
        longBreakDuration: data.longBreakDuration,
        autoStartBreaks: data.autoStartBreaks,
        autoStartFocus: data.autoStartFocus,
    };
};

/**
 * Updates user settings in the API
 * @param username - The username to update settings for
 * @param accessToken - The user's access token
 * @param settings - The new settings to save
 * @throws Error if the update request fails
 */
export const updateUserSettings = async (
    username: string,
    accessToken: string,
    settings: Settings
): Promise<void> => {
    const response = await fetch(`${API_URL}/api/settings/${username}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(settings),
    });

    if (!response.ok) {
        throw new Error(
            response.status === 401
                ? 'Authentication failed. Please sign out and log in again.'
                : 'Failed to update settings.'
        );
    }
}; 