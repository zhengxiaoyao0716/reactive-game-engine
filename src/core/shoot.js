import { Member, divideGroup } from './member';
import { Subject, from, interval } from 'rxjs';
import { shuffle } from '../core/collection';
import { zip, delay, scan } from 'rxjs/operators';

export const boats: { position: [number, number] }[] = new Array(8).fill().map((_, index) => ({
    position: [30, 27.5 + index * 130],
}));

const seats: { position: [number, number] }[] = new Array(20).fill().map((_, index) => ({
    position: [150 + 140 * (index % 10), (index / 10 | 0) === 0 ? 10 : 60],
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
    vertex: [[number, number], number, number], // [[x, y], angle, progress]
    velocity: [number, number, number],         // [线速度, 角速度, 匀速度]
} & Member; // { position: [x, y, scale] }

/**
 * 从分组集合中随机发射队员.
 * @param {ReturnType<typeof divideGroup>} groups 队员分组.
 * @param {number} freq 发射频率，多少秒发射一个.
 * @param {number} turn 转向次数，队员路径顶点数.
 * @param {number} bend 偏转角度
 */
export const shootMember = (groups: ReturnType<typeof divideGroup>, freq = 1.5, turn = 3, bend = 1 / 3) => {
    const seated: Subject<SeatedMember> = new Subject()
        .pipe(delay(turn * freq * 1000));
    const moving: Subject<MovingMember[]> = new Subject()
        .pipe(scan(shootPathFit(freq, turn, bend), []));

    const subscription = from([
        ...shuffle(groups
            .map((group, boat) => group.map(({ type: _, ...member }, seat): SeatedMember => ({ ...member, position: calcPosition(boat, seat) })))
            .reduce((members, group) => [...members, ...group], [])
        ),
        ...new Array(1 + turn).fill(null), // 最后来几个空数据占位
    ])
        .pipe(zip(interval(freq * 1000), member => member))
        .subscribe(member => {
            seated.next(member);
            moving.next(member);
        });

    return { seated, moving, subscription };
};

const shootPathFit = (freq: number, turn: number, bend: number) => {
    const frames = 60 * freq;
    const framesTotal = frames * turn;
    return (history: MovingMember[], member: SeatedMember) => (
        [member, ...history.slice(0, turn)].map(
            (member, index): MovingMember => {
                if (member == null) return null;
                const { name, position } = member;      // 目标坐标
                const origin = shootOrigin(position);   // 起点坐标
                const even = index % 2 === 0;           // 奇偶次数
                const points = [[position[0], origin[0]], [position[1], origin[1]]];
                const vector = points.map(([pos, org]) => pos - org);   // 方向
                const offset = (even ? 1 : -1) * Math.PI * bend;        // 偏转
                const offsetHalf = offset / 2;                          // 半偏转

                // 计算折点
                const progress = index / turn;                          // 当前进度
                const angle = vectorAngle(vector) - offsetHalf;         // 角度
                const point = points.map(([pos, org]) => org + progress * (pos - org));

                // 计算速度
                const ω = offset / frames;                                                                      // 角速度
                const Δ = Math.sqrt(vector.map(vec => Math.pow(vec, 2)).reduce((xp, yp) => xp + yp)) / turn;    // 路程
                const ν = Δ / Math.sin(offsetHalf) / 2;                                                         // 线速度 // 准确的说是线速度与角速度之比

                return {
                    name: index < turn ? name : null,
                    position,
                    vertex: [point, angle, progress],
                    velocity: [ν, ω, 1 / framesTotal],
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

const vectorAngle = (vector: [number, number]) => {
    const angle = Math.atan(vector[1] / vector[0]);
    return (angle < 0 ? Math.PI + angle : angle) + (vector[1] < 0 ? Math.PI : 0);
};
