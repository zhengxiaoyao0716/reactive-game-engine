import React, { useMemo, useEffect } from 'react';
import { useResource, Gradient, MovableSprite } from '../../pixi';
import { Progress } from '../../pixi/Progress';
import Loading from '../Loading';
import { useObservable, pick } from '../../util/rxjs';
import useCore from '../../util/useCore';
import assets, { playerTextures } from './assets';

const Scene0 = () => {
    const core = useCore();
    useEffect(() => {
        core.start('scene0');
        return core.pause;
    }, []);

    const resource = useResource(assets);
    const textures = useMemo(() => playerTextures(resource), [resource]);

    const state = useObservable(useMemo(() => core.pipe(pick('scene0')).pipe(pick('player')), []));

    return (
        <Progress completed={resource} indicator={Loading}>
            <Gradient {...Gradient.Velocity(state)}>{({ position: [x, y], velocity: [vx, vy] }) =>
                <MovableSprite {...MovableSprite.UDLR} textures={textures} position={{ x, y }} velocity={{ vx, vy }} animationSpeed={0.1} />
            }</Gradient>
        </Progress>
    );
};
export default Scene0;
