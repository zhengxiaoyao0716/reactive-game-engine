import { ReactNode, useState, Dispatch, useRef, Ref, useEffect, useDebugValue } from 'react';
import { useTicker } from '..';
import { ticker } from 'pixi.js';

type Ticker = ticker.Ticker;

export type PointsFn<P> = (ticker: Ticker, points: Array<P>) => Array<P>;
export type GradientFn<P, S> = (ticker: Ticker, points: Array<P>, state: S) => S;

export function useGradient<P, S>(pointsFn: PointsFn<P>, gradientFn: GradientFn<P, S>) {
    const ticker = useTicker();

    const points: Ref<Array<P>> = useRef([]);
    useEffect(() => {
        points.current = pointsFn(ticker, points.current);
    }, [pointsFn]);

    const [state, setState]: [S, Dispatch<S>] = useState(null);
    useEffect(() => {
        let state = null;
        const gradient = () => {
            state = gradientFn(ticker, points.current, state);
            setState(state);
        };
        ticker.add(gradient);
        return () => ticker.remove(gradient);
    }, [gradientFn]);

    useDebugValue(state, JSON.stringify);
    return state;
};

interface Props<P, S> {
    pointsFn: PointsFn<P>,
    gradientFn: GradientFn<P, S>,
    children?: (state: S) => ReactNode,
}

export function Gradient<P, S>({ children, pointsFn, gradientFn }: Props<P, S>) {
    const state = useGradient(pointsFn, gradientFn);
    if (state == null) return null;
    return children && children(state);
};

Gradient.Simple = require('./Simple').default;
Gradient.Velocity = require('./Velocity').default;
