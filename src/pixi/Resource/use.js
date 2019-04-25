import { useCallback, useDebugValue } from 'react';
import { useLoader } from '..';
import { loaders, utils } from 'pixi.js';
import { makeResource } from './make';
import { UseResourceOptions } from './use';
import { useCloseable } from '../useCloseable';

export function useResource<T>(
    options: T & UseResourceOptions,
    complete?: (of: (name: string) => loaders.Resource) => Promise<void>,
    unmount?: () => void,
): (name: string) => loaders.Resource {
    const of = useCallback(name => loader.resources[name], []);
    const loader = useLoader();

    const completed = useCloseable(
        (): Promise<boolean> => {
            const adding = Object.entries(options).map(([name, option]) => (
                option instanceof Function
                    ? (
                        Promise.resolve(option(makeResource)).then(
                            add => add(name, loader)
                        ).then(
                            () => loader.emit('load', loader, loader.resources[name])
                        ).catch(
                            (error: Error) => {
                                console.error(error);
                                if (loader.resources[name] == null) {
                                    const resource = new loaders.Resource(name, `#${name}`);
                                    resource.error = error;
                                    loader.resources[name] = resource;
                                }
                                loader.emit('error', error, loader, loader.resources[name]);
                            }
                        ).finally(
                            () => loader.emit('progress', loader, loader.resources[name])
                        )
                    )
                    : (
                        Promise.resolve(option).then(
                            ({ url, options, callback }) => loader.add(name, url, options, callback)
                        )
                    )
            ));
            const onLoad = (resolve: (value: true) => void) => (
                () => Promise.resolve((complete && complete(of), true)).then(resolve)
            );
            return Promise.all(adding).then(
                () => new Promise(resolve => loader.load(onLoad(resolve)))
            );
        },
        completed => {
            unmount && unmount();
            loader.reset();
            utils.clearTextureCache();
        },
    );
    useDebugValue(completed, completed => completed ? 'loaded' : 'loading');
    return completed ? of : null;
};
