import { useState, useCallback, useEffect, useMemo } from 'react';
import { Cat } from '@/interfaces/Cat';
import { fetchUserCats, deleteCat } from '@/services/CatService';
import { useAuth } from '@/contexts/AuthContext';
import { CatError } from '@/errors/CatError';

const DEFAULT_CAT: Readonly<Cat> = {
    name: 'Pawmo',
    ownerUsername: '',
    happinessLevel: 100,
    hungerLevel: 100,
    imageFileName: 'cat-1.png',
} as const;

interface UseCatsReturn {
    readonly cats: ReadonlyArray<Cat>;
    readonly isLoading: boolean;
    deleteCatByName: (catName: string) => Promise<void>;
    refreshCats: () => Promise<void>;
}

export function useCats(): UseCatsReturn {
    const [cats, setCats] = useState<ReadonlyArray<Cat>>([DEFAULT_CAT]);
    const [isLoading, setIsLoading] = useState(false);
    const { user, refreshTokens, needsTokenRefresh } = useAuth();

    const loadCats = useCallback(async () => {
        if (!user?.username || !user?.accessToken) {
            setCats([DEFAULT_CAT]);
            return;
        }

        setIsLoading(true);
        try {
            if (needsTokenRefresh()) {
                await refreshTokens();
            }

            const response = await fetchUserCats(user.username);
            setCats(response.cats);
        } catch (err) {
            if (err instanceof Error) {
                if (err.message.includes('NetworkError')) {
                    throw CatError.networkError(err);
                }
                if (err.message.includes('Invalid token')) {
                    try {
                        await refreshTokens();
                        const response = await fetchUserCats(user.username);
                        setCats(response.cats);
                        return;
                    } catch (refreshError) {
                        throw CatError.invalidTokenError(refreshError as Error);
                    }
                }
            }
            throw new CatError('Failed to load cats', { cause: err as Error });
        } finally {
            setIsLoading(false);
        }
    }, [user, refreshTokens, needsTokenRefresh]);

    const deleteCatByName = useCallback(
        async (catName: string) => {
            if (!user?.username || !user?.accessToken) {
                throw CatError.authError('Must be logged in to delete a cat');
            }

            setIsLoading(true);
            try {
                if (needsTokenRefresh()) {
                    await refreshTokens();
                }

                await deleteCat(user.username, catName);
                await loadCats();
            } catch (err) {
                throw new CatError('Failed to delete cat', { cause: err as Error });
            } finally {
                setIsLoading(false);
            }
        },
        [user, loadCats, refreshTokens, needsTokenRefresh]
    );

    useEffect(() => {
        loadCats().catch(() => {
            // Errors are handled by the context
            setCats([DEFAULT_CAT]);
        });
    }, [
        loadCats,
        user?.username,
        user?.accessToken,
        needsTokenRefresh,
        refreshTokens,
    ]);

    return useMemo(
        () => ({
            cats,
            isLoading,
            deleteCatByName,
            refreshCats: loadCats,
        }),
        [cats, isLoading, deleteCatByName, loadCats]
    );
} 