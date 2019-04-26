import { Member, divideGroup } from './member';
import { Subject, from, interval } from 'rxjs';
import { shuffle } from '../util/collection';
import { zip, delay, scan } from 'rxjs/operators';

export const boats: { position: [number, number] }[] = new Array(8).fill().map((_, index) => ({
    position: [30, 27.5 + index * 130],
}));

const seats: { position: [number, number] }[] = new Array(20).fill().map((_, index) => ({
    position: [150 + 140 * (index % 10), (index / 10 | 0) === 0 ? 0 : 60],
}));

export const calcPosition = (boat: number, seat: number) => {
    const { position } = boats[boat];
    const { position: offset } = seats[seat];
    return [position[0] + offset[0], position[1] + offset[1]];
};

export type SeatedMember = {
    position: [number, number],
} & Member;

export type MovingMember = {
    position: [number, number, number, number], // [x, y, 1, angle]
    vertex: [number, number, number, number],   // [x, y, progress, rotate]
    bezier: [number, number, number, number],   // [vx, vy, vp, vr]
    gravity: [number, number],
} & Member; // { position: [x, y, scale] }

/**
 * 从分组集合中随机发射队员.
 * @param {ReturnType<typeof divideGroup>} groups 队员分组.
 * @param {number} freq 发射频率，多少秒发射一个.
 * @param {number} turn 转向次数，队员路径顶点数.
 * @param {number} swing 摇摆力度
 */
export const shootMember = (groups: ReturnType<typeof divideGroup>, freq = 1, turn = 3, swing = 1) => {
    const seated: Subject<SeatedMember> = new Subject()
        .pipe(delay(turn * freq * 1000));
    const moving: Subject<MovingMember[]> = new Subject()
        .pipe(scan(shootPathFit(freq, turn, swing), []));

    const subscription = from([
        ...shuffle(groups
            .map((group, boat) => group.map(({ type: _, ...member }, seat): SeatedMember => ({ ...member, position: calcPosition(boat, seat) })))
            .reduce((members, group) => [...members, ...group], [])
        ),
        null, null, null, // 最后来几个空数据占位
    ])
        .pipe(zip(interval(freq * 1000), member => member))
        .subscribe(member => {
            seated.next(member);
            moving.next(member);
        });

    return { seated, moving, subscription };
};

const shootPathFit = (freq: number, turn: number, swing: number) => {
    const frames = 60 * freq;
    const framesTotal = frames * turn;
    return (history: MovingMember[], member: SeatedMember) => (
        [member, ...history.slice(0, turn)].map(
            (member, index): MovingMember => {
                if (member == null) return null;
                const { name, position } = member;            // 目标坐标
                const progress = index / turn;          // 当前进度
                const origin = shootOrigin(position);   // 起点坐标
                const even = index % 2 === 0;           // 奇偶次数
                const vector = [[position[0], origin[0]], [position[1], origin[1]]];
                // 计算折点
                const vertex = vector.map(([pos, org]) => org + progress * (pos - org));
                // 计算速度
                const velocity = vector.map(([pos, vel]) => (pos - vel) / framesTotal);
                // 计算引力
                const gravity = [-velocity[1], velocity[0]].map(g => even ? g : -g).map(g => swing / 60 * (turn - index) * g);
                // 贝塞尔轴
                const bezier = gravity.map(g => -0.5 * g * frames).map((normal, index) => normal + velocity[index]);

                return {
                    name: index < turn ? name : null,
                    position: [...position.slice(0, 2), 1, velocityAngle(velocity)],
                    vertex: [...vertex, progress, (even ? 1 : -1) ? 0 : 1],
                    bezier: [...bezier, 1 / framesTotal, (even ? 1 : -1) / frames],
                    gravity,
                };
            }
        )
    );
};

const shootOrigin = (destination: [number, number], width = 1920, height = 1080) => {
    const x = destination[0] - width / 2;
    const y = height / 2 - destination[1];
    return (y > 0
        ? (x > 0
            ? [0, height]       // 0
            : [width, height]   // 1
        )
        : (x < 0
            ? [width, 0]        // 2
            : [0, 0]            // 3
        )
    );
};

const velocityAngle = (velocity: [number, number]) => {
    const angle = Math.atan(velocity[1] / velocity[0]) / (2 * Math.PI);
    return (angle < 0 ? 0.25 - angle : angle) + (velocity[1] < 0 ? 0.5 : 0);
};
