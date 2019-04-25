import { useCallback } from 'react';
import { PointsFn, GradientFn } from '.';

type State = {
    position: number[],
    velocity?: number[],
    gravity?: number[],
};

const velocityGradientFn = (): GradientFn<State, State> => (
    (ticker, [point], state) => {
        if (state == null) return point;
        const { deltaTime } = ticker;

        const position = [...state.position];
        const velocity = state.velocity ? [...state.velocity] : null;
        const gravity = state.gravity || null;

        gravity && gravity.forEach((value, index) => velocity[index] += value * deltaTime);
        velocity && velocity.forEach((value, index) => position[index] += value * deltaTime);
        return { position, velocity, gravity };
    }
);

export default (state: State) => {
    const pointsFn: PointsFn<State> = useCallback(() => [state], [state]);
    const gradientFn = useCallback(velocityGradientFn(), [state]);
    return { pointsFn, gradientFn };
};
