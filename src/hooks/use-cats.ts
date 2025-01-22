import { useState, useCallback, useEffect, useMemo } from 'react';
import { Cat } from '@/interfaces/Cat';
import * as CatService from '@/services/CatService';
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
    updateAllCatsHappinessAfterStudy: () => Promise<{ updatedCats: Array<Cat>; failures: Array<string> } | undefined>;
    decreaseCatStatsOnSkip: () => Promise<{ updatedCat: Cat | null; isDeleted: boolean; message: string } | undefined>;
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

            const response = await CatService.fetchUserCats(user.username);
            setCats(response.cats);
        } catch (err) {
            if (err instanceof Error) {
                if (err.message.includes('NetworkError')) {
                    throw CatError.networkError(err);
                }
                if (err.message.includes('Invalid token')) {
                    try {
                        await refreshTokens();
                        const response = await CatService.fetchUserCats(user.username);
                        setCats(response.cats);
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
                throw CatError.authError();
            }

            setIsLoading(true);
            try {
                if (needsTokenRefresh()) {
                    await refreshTokens();
                }

                await CatService.deleteCat(user.username, catName);
            } catch (err) {
                throw new CatError('Failed to delete cat', { cause: err as Error });
            } finally {
                setIsLoading(false);
            }
        },
        [user, refreshTokens, needsTokenRefresh]
    );

    const updateAllCatsHappinessAfterStudy = useCallback(async () => {
        if (!user) {
            return
        }
        if (!user?.accessToken) {
            throw CatError.authError();
        }

        setIsLoading(true);
        try {
            if (needsTokenRefresh()) {
                await refreshTokens();
            }

            const result = await CatService.updateAllCatsHappinessAfterStudy();
            return result;
        } catch (err) {
            throw new CatError('Failed to update cats after study', { cause: err as Error });
        } finally {
            setIsLoading(false);
        }
    }, [user, needsTokenRefresh, refreshTokens]);

    const decreaseCatStatsOnSkip = useCallback(async () => {
        if (!user?.accessToken) {
            return;
        }

        setIsLoading(true);
        try {
            if (needsTokenRefresh()) {
                await refreshTokens();
            }

            const result = await CatService.decreaseCatStatsOnSkip();
            return result;
        } catch (err) {
            throw new CatError('Failed to decrease cat stats', { cause: err as Error });
        } finally {
            setIsLoading(false);
        }
    }, [user?.accessToken, needsTokenRefresh, refreshTokens]);

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
            updateAllCatsHappinessAfterStudy,
            decreaseCatStatsOnSkip,
        }),
        [cats, isLoading, deleteCatByName, loadCats, updateAllCatsHappinessAfterStudy, decreaseCatStatsOnSkip]
    );
} 