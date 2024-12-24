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
import { useRouter } from 'next/navigation';
import { User } from '@/interfaces/User';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Type definition for the Authentication Context
 */
interface AuthContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    login: (username: string, password: string) => Promise<void>;
    signup: (
        username: string,
        email: string,
        password: string,
        confirmPassword: string
    ) => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
    refreshTokens: () => Promise<void>;
    needsTokenRefresh: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Makes a request to login the user
 * @param username The username
 * @param password The password
 * @returns The login response data
 * @throws Error if login fails
 */
async function loginToBackend(
    username: string,
    password: string
): Promise<{
    username: string;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    expiresAt: number;
}> {
    const response = await fetch(`${API_URL}/api/users/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
        if (response.status === 400) {
            const firstErrorMessage = Object.values(data)[0];
            if (typeof firstErrorMessage === 'string') {
                throw new Error(firstErrorMessage);
            }
            throw new Error('Validation failed');
        }
        throw new Error(data.message || 'Login failed');
    }

    if (!data.accessToken || !data.refreshToken) {
        throw new Error('Invalid response from server');
    }

    return data;
}

/**
 * Makes a request to signup a new user
 * @param username The desired username
 * @param email The user's email
 * @param password The desired password
 * @param confirmPassword Password confirmation
 * @returns The signup response data
 * @throws Error if signup fails
 */
async function signupToBackend(
    username: string,
    email: string,
    password: string,
    confirmPassword: string
): Promise<{
    username: string;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    expiresAt: number;
}> {
    const response = await fetch(`${API_URL}/api/users/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password, confirmPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
        if (response.status === 400) {
            const firstErrorMessage = Object.values(data)[0];
            if (typeof firstErrorMessage === 'string') {
                throw new Error(firstErrorMessage);
            }
            throw new Error('Validation failed');
        }
        throw new Error(data.message || 'Signup failed');
    }

    if (!data.accessToken || !data.refreshToken) {
        throw new Error('Invalid response from server');
    }

    return data;
}

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
    const router = useRouter();

    const needsTokenRefresh = useCallback(() => {
        if (!user?.expiresAt || !user?.expiresIn) return false;

        const now = Date.now() / 1000;
        return user.expiresAt - now < user.expiresIn * 0.2;
    }, [user?.expiresAt, user?.expiresIn]);

    const login = useCallback(
        async (username: string, password: string) => {
            const data = await loginToBackend(username, password);
            setUser(data);
            router.push('/');
        },
        [router]
    );

    const signup = useCallback(
        async (
            username: string,
            email: string,
            password: string,
            confirmPassword: string
        ) => {
            const data = await signupToBackend(
                username,
                email,
                password,
                confirmPassword
            );
            setUser(data);
            router.push('/');
        },
        [router]
    );

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
            // Redirect to login page
            router.push('/login');
        }
    }, [user, router]);

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
                          expiresIn: newTokens.expiresIn,
                      }
                    : null
            );
        } catch (error) {
            console.error('Failed to refresh tokens:', error);
            await logout();
        }
    }, [user?.refreshToken, logout]);

    // Set up automatic token refresh
    useEffect(() => {
        if (!user?.expiresAt) return;

        const now = Date.now() / 1000; // Convert to seconds
        const timeUntilExpiry = user.expiresAt - now;
        // Refresh when 20% of the token's lifetime remains
        const refreshThreshold = user.expiresIn * 0.2;
        const refreshIn = (timeUntilExpiry - refreshThreshold) * 1000; // Convert to milliseconds

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
    }, [user?.expiresAt, user?.expiresIn, refreshTokens]);

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

    const value = useMemo(
        () => ({
            user,
            setUser,
            login,
            signup,
            logout,
            isLoading,
            refreshTokens,
            needsTokenRefresh,
        }),
        [
            user,
            login,
            signup,
            logout,
            isLoading,
            refreshTokens,
            needsTokenRefresh,
        ]
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
