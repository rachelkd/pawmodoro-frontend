import { createContext, useContext, ReactNode, useMemo } from 'react';
import { Cat } from '@/interfaces/Cat';
import { useCats } from '@/hooks/use-cats';

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

export function CatProvider({ children }: Readonly<CatProviderProps>) {
    const { cats, isLoading, deleteCatByName, refreshCats } = useCats();

    const value = useMemo(
        () => ({
            cats,
            isLoading,
            deleteCatByName,
            refreshCats,
        }),
        [cats, isLoading, deleteCatByName, refreshCats]
    );

    return <CatContext.Provider value={value}>{children}</CatContext.Provider>;
}

export function useCatContext() {
    const context = useContext(CatContext);
    if (!context) {
        throw new Error('useCatContext must be used within a CatProvider');
    }
    return context;
}
