import { UseResourceOptions, THColor, MovableSprite } from '../../pixi';
import { loaders } from 'pixi.js';

const asset: UseResourceOptions = { // mock resource
    ...[
        '　█　\n███\n█　█', '　█　\n█　█\n█　█', // 00, 01: idle
        '　　　\n███\n█　█', '　█　\n█　█\n█　█', // 02, 03: up
        '█　█\n███\n　　　', '█　█\n█　█\n　█　', // 04, 05: down
        '　██\n　█　\n　██', '　██\n█　 \n　██', // 06, 07: left
        '██　\n　█　\n██　', '██　\n 　█\n██　', // 08, 09: right
        '　█　\n█　█\n　█　', '█　█\n　█　\n█　█', // 10, 11: boom
    ].map(
        value => async make => make.text(value, { fontFamily: ['monospace'], fontSize: 24 })
    ).reduce(
        (dict, item, index) => ({ ...dict, [`player${`0${index}`.slice(-2)}`]: item }), {}
    ),
    testLoading1: { url: 'https://raw.githubusercontent.com/zhengxiaoyao0716/rewrite-kagali/master/kagali.gif' },
    testLoading2: { url: 'https://raw.githubusercontent.com/zhengxiaoyao0716/rewrite-kagali/master/kagali.mp4' },
    ...Object.entries(THColor).map(([name, { data }]) => [name, data]).reduce((dict, [name, data]) => ({ ...dict, [name]: { url: data } }), {}),
};
export default asset;

export const playerTextures = (resource: (name: string) => loaders.Resource) => {
    if (!resource) return null;
    const textures = new Array(12).fill().map((_, index) => resource(`player${`0${index}`.slice(-2)}`).texture);
    return MovableSprite.toUDLR(textures);
};
