/**
 * Authentication Context for managing user authentication state.
 * This context provides access to user authentication data and related functions
 * throughout the application.
 */

'use client';

import {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
    useMemo,
    useCallback,
} from 'react';
import { STORAGE_KEYS } from '@/constants/storage';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
// Refresh 5 minutes before expiry
const TOKEN_REFRESH_THRESHOLD = 5 * 60;

/**
 * Represents the authenticated user's data
 */
interface User {
    username: string;
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
}

/**
 * Type definition for the Authentication Context
 */
interface AuthContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    logout: () => Promise<void>;
    isLoading: boolean;
    refreshTokens: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Makes a request to the backend to logout the user
 * @param accessToken The user's access token
 */
async function logoutFromBackend(accessToken: string): Promise<void> {
    try {
        const response = await fetch(`${API_URL}/api/users/logout`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Logout failed');
        }
    } catch (error) {
        console.error('Error during logout:', error);
        throw error;
    }
}

/**
 * Makes a request to refresh the access and refresh tokens
 * @param refreshToken The current refresh token
 * @returns New access and refresh tokens with expiration info
 */
async function refreshTokensFromBackend(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    expiresAt: number;
}> {
    try {
        const response = await fetch(`${API_URL}/api/users/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Token refresh failed');
        }

        return await response.json();
    } catch (error) {
        console.error('Error during token refresh:', error);
        throw error;
    }
}

/**
 * AuthProvider component that wraps the application and provides authentication context
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components to be wrapped
 */
export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Function to refresh tokens
    const refreshTokens = useCallback(async () => {
        if (!user?.refreshToken) return;

        try {
            const newTokens = await refreshTokensFromBackend(user.refreshToken);
            setUser((currentUser) =>
                currentUser
                    ? {
                          ...currentUser,
                          accessToken: newTokens.accessToken,
                          refreshToken: newTokens.refreshToken,
                          expiresAt: newTokens.expiresAt,
                      }
                    : null
            );
        } catch (error) {
            console.error('Failed to refresh tokens:', error);
            // If refresh fails, log out the user
            await logout();
        }
    }, [user?.refreshToken]);

    // Set up automatic token refresh
    useEffect(() => {
        if (!user?.expiresAt) return;

        const now = Date.now() / 1000; // Convert to seconds
        const timeUntilExpiry = user.expiresAt - now;
        const refreshIn = (timeUntilExpiry - TOKEN_REFRESH_THRESHOLD) * 1000; // Convert to milliseconds

        if (refreshIn <= 0) {
            // Token is already expired or about to expire, refresh immediately
            refreshTokens();
            return;
        }

        // Schedule token refresh
        const refreshTimeout = setTimeout(() => {
            refreshTokens();
        }, refreshIn);

        return () => clearTimeout(refreshTimeout);
    }, [user?.expiresAt, refreshTokens]);

    useEffect(() => {
        // Load user data from localStorage on component mount
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    // Update localStorage whenever user state changes
    useEffect(() => {
        if (user) {
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
            localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, user.accessToken);
            localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, user.refreshToken);
        }
    }, [user]);

    const logout = useCallback(async () => {
        try {
            if (user?.accessToken) {
                await logoutFromBackend(user.accessToken);
            }
        } catch (error) {
            console.error('Error during logout:', error);
        } finally {
            // Clear local state even if backend logout fails
            setUser(null);
            localStorage.removeItem(STORAGE_KEYS.USER);
            localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        }
    }, [user]);

    const value = useMemo(
        () => ({ user, setUser, logout, isLoading, refreshTokens }),
        [user, isLoading, logout, refreshTokens]
    );

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

/**
 * Custom hook to use the authentication context
 * @throws {Error} If used outside of AuthProvider
 * @returns {AuthContextType} The authentication context value
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
