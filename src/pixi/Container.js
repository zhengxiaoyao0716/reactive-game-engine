import React, { createContext, Context, useContext } from 'react';
import { Container as PIXIContainer } from 'pixi.js';
import { useCloseableImmedite } from './hook';

interface Props {
    children?: ReactNode;
}

export const ContainerContext: Context<PIXIContainer> = createContext(null);
ContainerContext.displayName = 'Container';

export const Container = ({ children }: Props) => {
    const container = useCloseableImmedite(() => new PIXIContainer());
    return <ContainerContext.Provider value={container}>{children}</ContainerContext.Provider>;
};

export const useContainer = () => useContext(ContainerContext);
