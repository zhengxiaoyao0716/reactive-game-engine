import { useCallback } from 'react';
import { PointsFn, GradientFn } from '.';

const simplePointsFn = (state: number): PointsFn<{ state: number, time: number }> => (
    (ticker, points) => [{ state, time: ticker.lastTime }, ...points.slice(0, 1)]
);

const simpleGradientFn = (): GradientFn<{ state: number, time: number }, number> => (
    (ticker, [point0, point1], state) => {
        if (point1 == null) return 0;
        if (state === point0.state) return point0.state;

        const remain = (point0.time - point1.time) - (ticker.lastTime - point0.time);
        const interp = state + (point0.state - state) / remain * ticker.elapsedMS;

        return Math.max(state, Math.min(interp, point0.state));
    }
);

export default (state: number) => {
    const pointsFn = useCallback(simplePointsFn(state), [state]);
    const gradientFn = useCallback(simpleGradientFn(), []);
    return { pointsFn, gradientFn };
};
