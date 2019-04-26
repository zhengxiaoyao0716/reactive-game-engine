import { $Types } from '../../../util/@types';
import { UseResourceLoader } from '../../../pixi';

export const images = {
    bg: require('./bg.jpg'),
    boatOdd: require('./boat.png'),
    boatEven: require('./boat.png'),
    plane: require('./plane.png'),
};

const asset: Record<$Types.key<typeof images>, UseResourceLoader> = Object.entries(images)
    .map(([name, url]) => [name, { url }])
    .reduce((dict, [name, option]) => ({ ...dict, [name]: option }), {});

export default asset;
