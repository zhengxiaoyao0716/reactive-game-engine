import { $Types } from './@types';
import { subject } from '.';
import { members, divideGroup } from './member';
import shoot, { SeatedMember, MovingMember, Boat } from './shoot';

export type Data = {
    scene0: {
        members: {
            seated: SeatedMember,
            moving: MovingMember[],
        },
        boat: Boat,
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

        // subject.next({ scene0: { boats } });
        const groups = divideGroup(members);
        const { seated, moving, boats, ...shooter } = shoot(groups);
        const subscriptions = [
            shooter.subscription,
            seated.subscribe(seated => subject.next({ scene0: { members: { seated } } })),
            moving.subscribe(moving => subject.next({ scene0: { members: { moving } } })),
            boats.subscribe(boat => subject.next({ scene0: { boat } })),
        ];
        this.pause = () => {
            this.pause = () => { };
            state.running = false;
            subscriptions.forEach(sub => sub.unsubscribe());
        };
    },
    pause() { },
};
