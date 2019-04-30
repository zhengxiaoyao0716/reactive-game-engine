import React, { ReactNode, useEffect, useCallback } from 'react';
import { Container as PIXIContainer } from 'pixi.js';
import { useRenderer, useTicker } from '.';
import { ContainerContext, useContainer } from './Container';
import { useCloseableImmedite } from './hook';

interface Props {
    children?: ReactNode;
}

export const StageContext = ContainerContext;

export const Stage = ({ children }: Props) => {
    const container = useCloseableImmedite(() => new PIXIContainer());
    return <StageContext.Provider value={container}>{children}</StageContext.Provider>;
};

export const useStage = useContainer;

/** `LazyRefresh` would refresh the `stage` only if the node was re-rendered. */
Stage.LazyRefresh = () => {
    const stage = useStage();
    const renderer = useRenderer();
    const ticker = useTicker(); 
    const refresh = useCallback(() => renderer.render(stage), []);
    ticker ? ticker.addOnce(refresh) : refresh();
    return null;
};
Stage.LazyRefresh.displayName = 'Stage.LazyRefresh';

/** `TickRefresh` would re-render each time the ticker frame updated. */
Stage.TickRefresh = () => {
    const stage = useStage();
    const renderer = useRenderer();
    const ticker = useTicker();
    useEffect(() => {
        const refresh = () => renderer.render(stage);
        ticker.add(refresh);
        return () => ticker.remove(refresh);
    }, []);
    return null;
};
Stage.TickRefresh.displayName = 'Stage.TickRefresh';
