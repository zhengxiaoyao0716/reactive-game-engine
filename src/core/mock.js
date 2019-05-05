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

        members
            .then(divideGroup)
            .then(shoot)
            .then(({ seated, moving, boats, ...shooter }) => [
                shooter.subscription,
                seated.subscribe(seated => subject.next({ scene0: { members: { seated } } })),
                moving.subscribe(moving => subject.next({ scene0: { members: { moving } } })),
                boats.subscribe(boat => subject.next({ scene0: { boat } })),
            ])
            .then(subscriptions => this.pause = () => {
                this.pause = () => { };
                state.running = false;
                subscriptions.forEach(sub => sub.unsubscribe());
            });
    },
    pause() { },
};
