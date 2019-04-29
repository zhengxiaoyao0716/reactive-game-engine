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
                {moving.filter(member => member != null).map(({ name, vertex, velocity }) => (
                    <MovingMember key={name} name={name} vertex={vertex} velocity={velocity} />
                ))}
            </UI>
        </Progress>
    );
};
export default Scene0;

interface MovingMemberProps {
    name: string,
    vertex: [[number, number], number, number], // [[x, y], angle, progress]
    velocity: [number, number, number],         // [线速度, 角速度, 匀速度]
}

const MovingMember = ({ name, vertex: [[x, y], angle, progress], velocity: [ν, ω, v] }: MovingMemberProps) => (
    <Gradient {...Gradient.Velocity([[0, progress], [ω, v]])}>{([[offset, progress]]) => {
        const left = x + ν * (Math.cos(angle) * Math.sin(offset) + Math.sin(angle) * Math.cos(offset) - Math.sin(angle));
        const top = y + ν * (Math.sin(angle) * Math.sin(offset) - Math.cos(angle) * Math.cos(offset) + Math.cos(angle));
        return (
            <div className="member" style={{ left, top, transform: `scale(${1 + (1 - progress) * 2})` }}>
                <img src={images.plane} alt={name} style={{ transform: `rotate(${angle + offset}rad)` }} />
                {name && <span>{name}</span>}
            </div>
        );
    }}</Gradient>
);
