/**
 * Represents the authenticated user's data
 */
export interface User {
    username: string;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    expiresAt: number;
} 