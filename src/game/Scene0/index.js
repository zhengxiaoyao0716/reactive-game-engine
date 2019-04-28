import React, { useMemo, useEffect, useCallback } from 'react';
import { useResource, Sprite, Gradient } from '../../pixi';
import { Progress } from '../../pixi/Progress';
import Loading from '../Loading';
import { $Types } from '../../core/@types';
import { useObservable, pick } from '../../util/rxjs';
import useCore from '../../util/useCore';
import asset, { images } from './asset';
import { scan, map } from 'rxjs/operators';
import { UI } from '../../pixi/UI';
import './index.css';

const Scene0 = () => {
    const core = useCore();

    const resource = useResource(asset);
    const texture: $Types.applyThenIndex<typeof resource, 'texture'> = useCallback(name => resource && resource(name).texture, [resource]);

    const seated = useObservable(useMemo(() =>
        /* subject source */core
            .pipe(pick('scene0'), pick('members'), pick('seated'))
            .pipe(map(member => [member]), scan((history, members) => [...history, ...members])), // if I use initial value instead of pre-map to array, then the return type would wrong.
        /* initial value */[]
    ), []);
    const moving = useObservable(useMemo(() => core.pipe(pick('scene0'), pick('members'), pick('moving')), []), []);
    const boats = useObservable(useMemo(() => core.pipe(pick('scene0'), pick('boats')), []), []);

    // useMemo(() => console.log('moving', moving), [moving]);

    useEffect(() => {
        core.start('scene0');
        return core.pause;
    }, []);

    return (
        <Progress completed={resource} indicator={Loading}>
            <UI className="Scene0" scaleMode={true}>
                <Sprite texture={texture('bg')} />
                <>
                    {boats.map(({ position: [x, y] }, index) => (
                        <Sprite key={index} texture={texture(index % 2 ? 'boat' : 'boat')} position={{ x, y }}>
                            <span className="boatName" style={{ top: y }}>{`${1 + index}队`}</span>
                        </Sprite>
                    ))}
                </>
                {seated.filter(member => member != null).map(({ name, position: [left, top] }) => (
                    <span className="member" key={name} style={{ left, top }}>{name}</span>
                ))}
                {moving.filter(member => member != null).map(({ name, position, vertex, bezier, gravity }) => (
                    <MovingMember key={name} name={name} angle={position[3]} position={vertex} velocity={bezier} gravity={gravity} />
                ))}
            </UI>
        </Progress>
    );
};
export default Scene0;

interface MovingMemberProps {
    name: string,
    angle: number,
    position: [number, number, number, number],
    velocity: [number, number, number, number],
    gravity: [number, number],
}

const MovingMember = ({ name, angle, position, velocity, gravity }: MovingMemberProps) => (
    <Gradient {...Gradient.Velocity({ position, velocity, gravity })}>{({ position: [left, top, progress, rotate] }) => (
        <div className="member" style={{ left, top, transform: `scale(${1 + (1 - progress) * 2})` }}>
            <img src={images.plane} alt={name} style={{ transform: `rotate(${angle + rotate / 20}turn)` }} />
            {name && <span>{name}</span>}
        </div>
    )}</Gradient>
);
