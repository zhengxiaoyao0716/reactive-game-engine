import { $Types } from './@types';
import { subject } from '.';
import { members, divideGroup } from './member';
import { SeatedMember, MovingMember, boats, shootMember } from './shoot';

export type Data = {
    scene0: {
        members: {
            seated: SeatedMember,
            moving: MovingMember[],
        },
        boats: typeof boats,
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
        subject.next({ scene0: { boats } });
        const groups = divideGroup(members);
        const { seated, moving, ...shoot } = shootMember(groups);
        const subscriptions = [
            shoot.subscription,
            seated.subscribe(seated => subject.next({ scene0: { members: { seated } } })),
            moving.subscribe(moving => subject.next({ scene0: { members: { moving } } })),
        ];
        this.pause = () => {
            this.pause = () => { };
            state.running = false;
            subscriptions.forEach(sub => sub.unsubscribe());
        };
    },
    pause() { },
};
