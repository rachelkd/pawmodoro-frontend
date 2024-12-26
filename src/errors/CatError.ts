export class CatError extends Error {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options);
        this.name = 'CatError';
    }

    static authError(message = 'Authentication required'): CatError {
        return new CatError(message);
    }

    static networkError(cause?: Error): CatError {
        return new CatError('Network error occurred', { cause });
    }

    static invalidTokenError(cause?: Error): CatError {
        return new CatError('Invalid or expired token', { cause });
    }
} 