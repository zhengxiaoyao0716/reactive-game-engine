/* eslint-disable no-console */

import { TreeSet, compareExtract, shuffle } from '../util/collection';

export type Member = { name: string, gender: 'male' | 'female', type: any };
export const members: Readonly<Member[][]> = [
    [
        ...new Array(60).fill().map((_, index) => ({ name: `其它${`0${index}`.slice(-2)}`, gender: 'male' })),
        ...new Array(30).fill().map((_, index) => ({ name: `其它${60 + index}`, gender: 'female' })),
    ].map(member => ({ ...member, type: '其它' })),
    [
        ...new Array(30).fill().map((_, index) => ({ name: `美术${`0${index}`.slice(-2)}`, gender: 'male' })),
        ...new Array(30).fill().map((_, index) => ({ name: `美术${30 + index}`, gender: 'female' })),
    ].map(member => ({ ...member, type: '美术' })),
    [
        ...new Array(8).fill().map((_, index) => ({ name: `特殊0${index}`, gender: 'male' })),
        ...new Array(2).fill().map((_, index) => ({ name: `特殊${`0${8 + index}`.slice(-2)}`, gender: 'female' })),
    ].map(member => ({ ...member, type: '特殊' })),
];

const femaleNum = (group: Member[]) => group.reduce((num, { gender }) => gender === 'female' ? num + 1 : num, 0);

export const divideGroup = (members: Readonly<Member[][]>, size: number = 8) => {
    const groups = members.map(members => shuffle(members))
        .reduce((result, members) => [...result, ...members], [])
        .reduce(
            (groups, member, index) => {
                const groupIndex = index % size;
                groups[groupIndex] = [...groups[groupIndex], member];
                return groups;
            },
            new Array(size).fill().map((): Member[] => []),
        );

    const scores = new TreeSet(compareExtract(({ score }) => score), groups.map((group, index) => ({ index, score: femaleNum(group) })));
    while (true) {
        if (scores.last.score - scores.head.score < 2) break;
        const min = scores.top();
        const max = scores.pop();

        // exchange
        const minGroup = groups[min.index];
        const maxGroup = groups[max.index];
        const maleIndex = minGroup.findIndex(({ gender }) => gender === 'male');
        const femaleIndex = maxGroup.findIndex(({ gender }) => gender === 'female');
        const male = minGroup[maleIndex];
        const female = maxGroup[femaleIndex];
        maxGroup[femaleIndex] = male;
        minGroup[maleIndex] = female;

        scores.push({ ...min, score: min.score + 1 });
        scores.push({ ...max, score: max.score - 1 });
    }

    const divided = groups.map(group => shuffle(group));
    console.info('分组完毕：', {
        '': '点击展开详情',
        get 点击查看统计信息() { // eslint-disable-line getter-return
            console.group('各组妹子的数量：');
            divided.forEach((group, index) => console.info(`${1 + index}组:`, `${femaleNum(group)}人`));
            console.groupEnd();

            console.group('各组各类人的数量：');
            const analyzeType = (group: Member[]) => {
                const types = group.reduce((sum, { type }) => ({ ...sum, [type]: 1 + (sum[type] || 0) }), {});
                return Object.entries(types).sort(compareExtract(([type]) => type))
                    .map(([type, num]) => `${type}${num}人`).join(', \t');
            };
            divided.forEach((group, index) => console.info(`${1 + index}组:`, analyzeType(group)));
            console.groupEnd();

            console.group('各组成员详情：');
            divided.map((group, index) => console.info(`${1 + index}组:`, group.map(({ name, gender }) => `${name} ${gender === 'female' ? '♀' : '♂'}`)));
            console.groupEnd();

            return '统计信息已输出到控制台';
        },
    });
    return divided;
};
