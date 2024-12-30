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

/**
 * Timer related constants
 */
export const TIMER_CONSTANTS = {
    /**
     * Minimum elapsed time (in seconds) before penalizing a skip
     */
    MIN_ELAPSED_TIME_FOR_SKIP_PENALTY: 60,
    /**
     * Minimum time left (in seconds) before penalizing a skip
     */
    MIN_TIME_LEFT_FOR_SKIP_PENALTY: 60,
} as const; 