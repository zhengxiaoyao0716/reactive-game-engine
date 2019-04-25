import React, { ReactNode, ReactElement, useState, useEffect } from 'react';
import { loaders } from 'pixi.js';
import { useLoader } from '.';

export type IndicatorProps = {
    progress: number;
    resource?: loaders.Resource;
};

interface Props {
    completed?: boolean; // if `completed` is true, the `children` would be rendered, else the `indicator` would be rendered.
    indicator?: ReactElement<IndicatorProps>;
    children?: ReactNode;
};

export function Progress({ completed, children = null, indicator: Indicator = null }: Props) {
    const loader = useLoader();
    const [loaded, setLoaded] = useState(null);
    useEffect(() => {
        const progress = (loader, resource) => setLoaded(resource);
        loader.on('progress', progress);
        return () => loader.removeListener('progress', progress);
    }, []);

    if (completed) return children; // load finish, render children
    return Indicator && (<Indicator progress={loader.progress} resource={loaded} />);
};
