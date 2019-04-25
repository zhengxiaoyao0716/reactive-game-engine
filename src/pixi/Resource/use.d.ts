import { loaders } from 'pixi.js';
import { makeResource } from './make';

export type UseResourceLoader = {
    url: string,
    options?: loaders.LoaderOptions,
    callback?: Function,
};
export type UseResourceLoaderAsync = Promise<UseResourceLoader>;

export type UseResourceMaker = (
    (make: typeof makeResource) =>
        (id?: string, loader?: loaders.Loader) => void
);
export type UseResourceMakerAsync = (
    (make: typeof makeResource) =>
        Promise<(id?: string, loader?: loaders.Loader) => void>
);

export interface UseResourceOptions {
    [name: string]: UseResourceLoader | UseResourceLoaderAsync | UseResourceMaker | UseResourceMakerAsync,
}

export function useResource<T extends UseResourceOptions>(
    options: T,
    complete?: (of: (name: keyof T) => loaders.Resource) => void | Promise<void>,
    unmount?: () => void,
): (name: keyof T) => loaders.Resource;
