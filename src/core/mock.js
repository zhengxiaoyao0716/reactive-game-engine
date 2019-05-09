import { $Types } from './@types';
import { subject } from '.';
import { members, Member, divideGroup } from './member';
import shoot, { SeatedMember, MovingMember, Boat } from './shoot';
import { compareExtract } from './collection';

export type Data = {
    scene0: {
        members: {
            seated: SeatedMember,
            moving: MovingMember[],
        },
        boat: Boat,
    },
    setting: {
        members: Member[],
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
    setting() {
        state.scene = 'setting';
        state.running = false;

        members
            .then(members => members.reduce((list, members) => [...list, ...members], []))
            .then(members => members.sort(compareExtract(({ name }) => name, (name1: string, name2: string) => name1.localeCompare(name2, 'zh'))))
            .then(members => {
                this.updateMember = (index: number, state: Partial<Member>) => {
                    members[index] = { ...members[index], ...state };
                    subject.next({ setting: { members: [...members] } });
                };
                return subject.next({ setting: { members } });
            });
    },
    updateMember(index: number, state: Partial<Member>) { }, // eslint-disable-line no-unused-vars
    pause() { },
};
