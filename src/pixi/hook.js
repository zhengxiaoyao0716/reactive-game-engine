import { useState, useEffect, useMemo, DependencyList } from 'react';

interface Closeable {
    destroy?: () => void;
    remove?: () => void;
    close?: () => void;
}

const defaultClose = (value: Closeable) => (value.destroy || value.remove || value.close).call(value);

export function useCloseable<T>(
    supplier: () => T | Promise<T>,
    close?: (value: T) => void = defaultClose,
    deps?: DependencyList = [],
): T | null {
    const [state, setState] = useState(null);
    useEffect(() => {
        const promise = Promise.resolve(supplier());
        promise.then(setState);
        return () => promise.then(close);
    }, deps);
    return state;
};

export function useCloseableImmedite<T>(
    supplier: () => T,
    close?: (value: T) => void = defaultClose,
    deps?: DependencyList = [],
): T | null {
    const state = useMemo(supplier, []);
    useEffect(() => () => close(state), deps);
    return state;
};

export const useUpdate: typeof useEffect = (update, deps) => {
    useMemo(update, []);
    useEffect(update, deps);
};
