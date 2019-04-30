import React, { Context, createContext, useContext, useDebugValue } from 'react';
import { ticker } from 'pixi.js';
import { useCloseableImmedite, useUpdate } from './hook';

type PIXITicker = ticker.Ticker;
const PIXITicker = ticker.Ticker; // eslint-disable-line no-redeclare
const shared = ticker.shared;

interface Props {
    children?: ReactNode;
    running?: boolean,
    speed?: number,
    minFPS?: number,
}

export const TickerContext: Context<PIXITicker> = createContext(null);
TickerContext.displayName = 'Ticker';

export const Ticker = ({ children, running = true, speed = 1, minFPS = 10 }: Props) => {
    const ticker = useCloseableImmedite(() => new PIXITicker());

    useUpdate(() => {
        if (ticker == null) return;
        if (running !== ticker.started) running ? ticker.start() : ticker.stop();
        if (speed !== ticker.speed) ticker.speed = speed;
        if (minFPS !== ticker.minFPS) ticker.minFPS = minFPS;
    }, [running, speed, minFPS]);

    return <TickerContext.Provider value={ticker}>{children}</TickerContext.Provider>;
};

export const useTicker = () => {
    const ticker = useContext(TickerContext) || shared;
    useDebugValue(ticker, ticker => ticker.FPS.toFixed(2));
    return ticker;
}; // use the `shared` ticker if no custom `Ticker` component found.
