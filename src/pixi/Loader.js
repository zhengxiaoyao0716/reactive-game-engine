import React, { createContext, Context, useContext, useMemo, useDebugValue } from 'react';
import { loaders } from 'pixi.js';
import { useCloseableImmedite, useUpdate } from './hook';

interface Props {
    children?: ReactNode;
    baseUrl?: string;
    concurrency?: number;
}

export const LoaderContext: Context<loaders.Loader> = createContext(null);
LoaderContext.displayName = 'Loader';

export const Loader = ({ children, baseUrl, concurrency }: Props) => {
    const loader = useCloseableImmedite(() => new loaders.Loader(baseUrl, concurrency));

    useUpdate(() => {
        if (baseUrl !== loader.baseUrl) loader.baseUrl = baseUrl;
        if (concurrency !== loader.concurrency) loader.concurrency = concurrency;
    }, []);

    return <LoaderContext.Provider value={loader}>{children}</LoaderContext.Provider>;
};

export const useLoader = () => {
    const loader = useContext(LoaderContext) || loaders.shared; // use the `shared` loader if no custom `Loader` component found.
    useDebugValue(loader.progress, progress => `progress: ${progress}`);
    return loader;
};

export const LoaderCreator = (baseUrl?: string, concurrency?: number) => useMemo(() => ({ create: () => new loaders.Loader(baseUrl, concurrency) }), []);
