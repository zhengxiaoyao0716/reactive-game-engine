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
    index: number,
    position: [number, number],
} & Member;

export type MovingMember = {
    vertex: [[number, number], number, number], // [[x, y], angle, progress]
    velocity: [number, number, number],         // [线速度, 角速度, 匀速度]
} & SeatedMember; // { position: [x, y, scale] }

/**
 * 从分组集合中随机发射队员.
 * @param {ReturnType<typeof divideGroup>} groups 队员分组.
 * @param {number} freq 发射频率，多少秒发射一个.
 * @param {number} turn 转向次数，队员路径顶点数.
 */
export const shootMember = (groups: ReturnType<typeof divideGroup>, freq = 1.2, turn = 3) => {
    const seated: Subject<SeatedMember> = new Subject()
        .pipe(delay(turn * freq * 1000));
    const moving: Subject<MovingMember[]> = new Subject()
        .pipe(scan(shootPathFit(freq, turn), []));

    const subscription = from([
        ...shuffle(groups
            .map((group, boat) => group.map(({ type: _, ...member }, seat) => ({ ...member, position: calcPosition(boat, seat) })))
            .reduce((members, group) => [...members, ...group], [])
        ).map((member, index): SeatedMember => ({ ...member, index })), // .slice(7, 8),
        ...new Array(1 + turn).fill().map((): SeatedMember => null), // 最后来几个空数据占位
    ])
        .pipe(zip(interval(freq * 1000), member => member))
        .subscribe(member => {
            seated.next(member);
            moving.next(member);
        });

    return { seated, moving, subscription };
};

const shootPathFit = (freq: number, turn: number) => {
    const frames = 60 * freq;
    return (history: MovingMember[], member: SeatedMember) => (
        [member, ...history.slice(0, turn)].map(
            (member, index): MovingMember => {
                if (member == null) return null;

                const { name, index: id, position: target } = member;
                const [originZero, fitFunction] = id % 8 === 3 ? [5, fitTwine] : id % 8 === 7 ? [3, fitSpiral] : [0, fitCircle];
                const origin = shootOrigin(target, originZero);

                const vector = [target[0] - origin[0], target[1] - origin[1]];                                  // 位移矢量
                const distance = Math.sqrt(vector.map(vec => Math.pow(vec, 2)).reduce((xp, yp) => xp + yp));    // 位移标量
                const angle = vectorAngle(vector);  // 方向角度
                const progress = index / turn;      // 当前进度

                const { vertex, velocity } = fitFunction({
                    freq, turn, index, frames,
                    target, origin, vector,
                    distance, angle, progress,
                });

                return {
                    ...member,
                    name: index < turn ? name : null,
                    vertex: [...vertex, progress],
                    velocity: [...velocity, 1 / frames / turn],
                };
            }
        )
    );
};

/**
 * 0-------1------2>
 * | \     |    / '
 * |   \ 5 | 6 /  '
 * |   4 \ | / 7  '
 * 7--------------3
 * |   3 / | \ 0  '
 * |   / 2 | 1 \  '
 * | /     |     \'
 * 6       5      4
 * v
 */
const shootOrigin = ([x, y]: [number, number], zero = 0, width = 1920, height = 1080) => {

    const a = y - height / 2 > 0;           // [3, 4, 6, 7]:    y > 0
    const b = y / height - x / width > 0;   // [4, 6, 0]:       y - x > 0
    const c = x - width / 2 < 0;            // [5, 6, 0, 1]:    x < 0
    const d = y / height + x / width < 1;   // [6, 0, 2]:       y + x < 1

    const index = (
        a && !b ? (0)
            : b && !c ? (1)
                : c && !d ? (2)
                    : d && a ? (3)
                        : !a && b ? (4)
                            : !b && c ? (5)
                                : !c && d ? (6)
                                    : !d && !a ? (7) : 'never'
    );

    return [
        [0, 0],
        [width / 2, 0],
        [width, 0],
        [width, height / 2],
        [width, height],
        [width / 2, height],
        [0, height],
        [0, height / 2],
    ][(index + zero) % 8];
};

const vectorAngle = (vector: [number, number]) => {
    const angle = Math.atan(vector[1] / vector[0]);
    return (angle < 0 ? Math.PI + angle : angle) + (vector[1] < 0 ? Math.PI : 0);
};

// 路径拟合参数
interface PathFitParam {
    freq: number, turn: number, index: number, frames: number, // 基础参数
    target: [number, number],   // 终点坐标
    origin: [number, number],   // 起点坐标
    vector: [number, number],   // 位移矢量
    distance: number,           // 位移标量
    angle: number,              // 方向角度
    progress: number,           // 当前进度
}

// 相接等圆拟合
const fitCircle = ({ turn, index, frames, origin, vector, distance, angle, progress }: PathFitParam, bend = 1 / 3) => {
    const offset = (index % 2 === 0 ? 1 : -1) * Math.PI * bend; // 偏转
    const offsetHalf = offset / 2;                              // 半偏转
    const move = distance / turn;                               // 位移

    // 当前位置
    const point = [origin[0] + vector[0] * progress, origin[1] + vector[1] * progress];
    // 旋转角度
    const rotate = angle - offsetHalf;

    // 计算速度
    const ω = offset / frames;                  // 角速度
    const ν = move / Math.sin(offsetHalf) / 2;  // 线速度 // 准确的说是线速度与角速度之比

    return {
        vertex: [point, rotate],
        velocity: [ν, ω],
    };
};

// 螺旋线形拟合
const fitSpiral = ({ turn, index, frames, origin, vector, distance, angle }: PathFitParam) => {
    const offset = Math.PI;         // 偏转
    const offsetHalf = offset / 2;  // 半偏转

    // 计算某点的向量相对第一次的倍率，[ratio, diameter]
    const vectorRatio = (index: number): [number, number] => {
        if (index === 0) return [0, 0];
        if (index === 1) return [1, 1];
        const [ratio, previos] = vectorRatio(index - 1);
        // const diameter = previos * (turn - bend) / turn;
        const diameter = previos - 1 / (turn + 1);
        const odd = index % 2 === 1;
        return [ratio + (odd ? 1 : -1) * diameter, diameter];
    };
    const ratioTarget = vectorRatio(turn);                          // 目标点的倍率
    const vectorFirst = vector.map(vec => vec / ratioTarget[0]);    // 第一次的位移向量
    const ratioLast = vectorRatio(index);                           // 上一次的倍率
    const vectorLast = vectorFirst.map(vec => vec * ratioLast[0]);  // 上一次的位移向量
    const ratioNow = vectorRatio(index + 1);                        // 这一次的倍率
    const diameter = distance / ratioTarget[0] * ratioNow[1];       // 位移直径

    // 当前位置
    const point = [origin[0] + vectorLast[0], origin[1] + vectorLast[1]];
    // 旋转角度
    const rotate = angle - offsetHalf + (index % 2 === 0 ? 0 : Math.PI);

    // 计算速度
    const ω = offset / frames;  // 角速度
    const ν = diameter / 2;     // 线速度 // 准确的说是线速度与角速度之比

    return {
        vertex: [point, rotate],
        velocity: [ν, ω],
    };
};

// 圆环缠绕拟合
const fitTwine = ({ turn, index, frames, origin, vector, distance, angle }: PathFitParam, bend = 1 / 3) => {
    const even = index % 2 === 0;                       // 奇偶次序
    const offset = Math.PI * (even ? bend : 2 - bend);  // 偏转
    const offsetHalf = offset / 2;                      // 半偏转

    const knotsTotal = Math.ceil(turn / 2); // 总扭结数
    const knotsNow = Math.ceil(index / 2);  // 当前扭结数

    const ratioEven = (2 - bend) * 1 / (2 * knotsTotal * (1 - bend) + bend);            // 偶数弦长倍率
    const ratioOdd = bend / (2 * knotsTotal * (1 - bend) + bend);                       // 奇数弦长倍率
    const ratio = knotsNow * ratioEven - (even ? knotsNow : knotsNow - 1) * ratioOdd;   // 当前位置倍率
    const delta = (even ? ratioEven : ratioOdd) * distance;                             // 当前弦长位移

    // 当前位置
    const point = [origin[0] + vector[0] * ratio, origin[1] + vector[1] * ratio];
    // 旋转角度
    const rotate = angle - offsetHalf - (even ? 0 : Math.PI);

    // 计算速度
    const ω = offset / frames;                  // 角速度
    const ν = delta / Math.sin(offsetHalf) / 2; // 线速度 // 准确的说是线速度与角速度之比

    return {
        vertex: [point, rotate],
        velocity: [ν, ω],
    };
};
