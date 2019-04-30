import React, { useMemo, useEffect } from 'react';
import { Gradient } from '../../pixi';
import { useObservable, pick } from '../../util/rxjs';
import useCore from '../../util/useCore';
import { images } from './asset';
import { scan, map } from 'rxjs/operators';
import { UI } from '../../pixi/UI';
import './index.css';

const Scene0 = () => {
    const core = useCore();

    const seated = useObservable(useMemo(() =>
        /* subject source */core
            .pipe(pick('scene0'), pick('members'), pick('seated'))
            .pipe(map(member => [member]), scan((history, members) => [...history, ...members])), // if I use initial value instead of pre-map to array, then the return type would wrong.
        /* initial value */[]
    ), []);
    const moving = useObservable(useMemo(() => core.pipe(pick('scene0'), pick('members'), pick('moving')), []), []);
    const boats = useObservable(useMemo(() =>
        /* subject source */core
            .pipe(pick('scene0'), pick('boat'))
            .pipe(map(({ name, ...boat }) => ({ [name]: boat })), scan((history, boats) => ({ ...history, ...boats }))),
            /* initial value */{}
    ), []);

    // useMemo(() => console.log('boats', boats), [boats]);

    useEffect(() => {
        core.start('scene0');
        return core.pause;
    }, []);

    return (
        <UI className="Scene0" scaleMode={true}>
            <img src={images.bg} alt="background" />
            <div className="boats">
                {Object.entries(boats).map(([name, { position, velocity }]) => (
                    <MovingBoat key={name} name={name} position={position} velocity={velocity} />
                ))}
            </div>
            <div className="members">
                {seated.filter(member => member != null).map(({ name, position: [left, top] }) => (
                    <span className="member" key={name} style={{ left, top }}>{name}</span>
                ))}
            </div>
            <div className="members">
                {moving.filter(member => member != null).map(({ name, vertex, velocity }) => (
                    <MovingMember key={name} name={name} vertex={vertex} velocity={velocity} />
                ))}
            </div>
        </UI>
    );
};
export default Scene0;

interface MovingBoatProps {
    name: string,
    position: [number, number],
    velocity: [number],
}

const MovingBoat = ({ name, position: [x, y], velocity: [v] }: MovingBoatProps) => {
    return (
        <Gradient {...Gradient.Velocity([[x, y], [v]])} >{([[left, top]]) => (
            <div style={{ left, top }}>
                <img src={images.boat} alt={name} />
                <span>{name}</span>
            </div>
        )}</Gradient>
    );
};

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
            <div style={{ left, top, transform: `scale(${1 + (1 - progress) * 2})` }}>
                <img src={images.plane} alt={name} style={{ transform: `rotate(${angle + offset}rad)` }} />
                {name && <span>{name}</span>}
            </div>
        );
    }}</Gradient>
);
