/**
 * Constants for local storage keys used throughout the application
 */
export const STORAGE_KEYS = {
    USER: 'user',
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
    SETTINGS: 'user_settings'
} as const;

// Type for the storage keys to ensure type safety
export type StorageKey = keyof typeof STORAGE_KEYS; 