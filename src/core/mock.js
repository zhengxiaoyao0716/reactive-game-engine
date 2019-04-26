import { $Types } from './@types';
import { interval } from 'rxjs';
import { map, takeWhile } from 'rxjs/operators';
import { subject } from '.';

const playerPath = [
    { position: [0/*  */, 0/*  */], velocity: [0, 0] },
    // test velocity: d = vt = 10 * 60
    { position: [0/*  */, 0/*  */], velocity: [10, 0] },
    { position: [600/**/, 0/*  */], velocity: [0, 10] },
    { position: [600/**/, 600/**/], velocity: [-10, 0] },
    { position: [0/*  */, 600/**/], velocity: [0, -10] },
    // test gravity: d = 0.5gt^2 = 0.25 * 60^2
    { position: [0/*  */, 0/*  */], velocity: [0, 0], gravity: [0.5, 0] },
    { position: [900/**/, 0/*  */], velocity: [0, 0], gravity: [0, 0.5] },
    { position: [900/**/, 900/**/], velocity: [0, 0], gravity: [-0.5, 0] },
    { position: [0/*  */, 900/**/], velocity: [0, 0], gravity: [0, -0.5] },
];

export type Data = {
    scene0: {
        player: $Types.element<typeof playerPath>,
    },
    scene1: {
        unused: true,
    },
};
type Scenes = $Types.key<Data>;

const state: {
    scene: Scenes,
    running: boolean,
} = {};
export const mock = {
    start(scene: Scenes) {
        state.scene = scene;
        state.running = true;
        interval(1000)
            .pipe(map((_, index) => playerPath[index % playerPath.length]))
            .pipe(takeWhile(() => state.scene === 'scene0' && state.running))
            .subscribe(player => subject.next({ scene0: { player } }));
    },
    pause() {
        state.running = false;
    },
};
