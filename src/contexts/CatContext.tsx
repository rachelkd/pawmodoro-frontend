import {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
    useCallback,
    useMemo,
} from 'react';
import { Cat } from '@/interfaces/Cat';
import { fetchUserCats, deleteCat } from '@/services/catService';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';

const DEFAULT_CAT: Readonly<Cat> = {
    name: 'Pawmo',
    ownerUsername: '',
    happinessLevel: 100,
    hungerLevel: 100,
    imageFileName: 'cat-1.png',
} as const;

interface CatContextType {
    readonly cats: ReadonlyArray<Cat>;
    readonly isLoading: boolean;
    deleteCatByName: (catName: string) => Promise<void>;
    refreshCats: () => Promise<void>;
}

const CatContext = createContext<CatContextType | undefined>(undefined);

interface CatProviderProps {
    readonly children: ReactNode;
}

export function CatProvider({ children }: CatProviderProps) {
    const [cats, setCats] = useState<ReadonlyArray<Cat>>([DEFAULT_CAT]);
    const [isLoading, setIsLoading] = useState(false);
    const { user, refreshTokens, logout, needsTokenRefresh } = useAuth();
    const { toast } = useToast();

    const loadCats = useCallback(async () => {
        if (!user?.username || !user?.accessToken) {
            setCats([DEFAULT_CAT]);
            return;
        }

        setIsLoading(true);
        try {
            console.log('Loading cats for:', user.username);
            if (needsTokenRefresh()) {
                await refreshTokens();
            }

            const response = await fetchUserCats(user.username);
            setCats(response.cats);
        } catch (err: unknown) {
            if (err instanceof Error) {
                console.log(err.message);
                if (err.message.includes('NetworkError')) {
                    toast({
                        variant: 'destructive',
                        title: 'Network Error',
                        description:
                            'Failed to load cats. Please check your internet connection and try again.',
                    });
                } else if (err.message.includes('Invalid token')) {
                    try {
                        await refreshTokens();
                        const response = await fetchUserCats(user.username);
                        setCats(response.cats);
                        return;
                    } catch (refreshError) {
                        console.error('Token refresh failed:', refreshError);
                        toast({
                            variant: 'destructive',
                            title: 'Authentication Error',
                            description:
                                'Failed to load cats. Please sign in again.',
                            action: (
                                <ToastAction
                                    altText='Sign out'
                                    onClick={logout}
                                >
                                    Logout
                                </ToastAction>
                            ),
                        });
                    }
                } else {
                    toast({
                        variant: 'destructive',
                        title: 'Error',
                        description: 'Failed to load cats. Please try again.',
                    });
                }
            }
            console.error(err);
            setCats([DEFAULT_CAT]);
        } finally {
            setIsLoading(false);
        }
    }, [user, toast, refreshTokens, needsTokenRefresh, logout]);

    const deleteCatByName = useCallback(
        async (catName: string) => {
            if (!user?.username || !user?.accessToken) return;

            setIsLoading(true);
            try {
                if (needsTokenRefresh()) {
                    await refreshTokens();
                }

                await deleteCat(user.username, catName);
                // Refresh cats after deletion
                await loadCats();
                toast({
                    title: 'Cat Deleted',
                    description: `${catName} has been deleted.`,
                });
            } catch (err) {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Failed to delete cat. Please try again.',
                });
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        },
        [user, toast, loadCats, refreshTokens, needsTokenRefresh]
    );

    useEffect(() => {
        if (user?.username && user?.accessToken && needsTokenRefresh()) {
            refreshTokens().then(() => loadCats());
        } else {
            loadCats();
        }
    }, [
        loadCats,
        user?.username,
        user?.accessToken,
        needsTokenRefresh,
        refreshTokens,
    ]);

    const contextValue = useMemo(
        () => ({
            cats,
            isLoading,
            deleteCatByName,
            refreshCats: loadCats,
        }),
        [cats, isLoading, deleteCatByName, loadCats]
    );

    return (
        <CatContext.Provider value={contextValue}>
            {children}
        </CatContext.Provider>
    );
}

export function useCats() {
    const context = useContext(CatContext);
    if (context === undefined) {
        throw new Error('useCats must be used within a CatProvider');
    }
    return context;
}
