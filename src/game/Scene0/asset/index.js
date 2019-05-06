import { $Types } from '../../../core/@types';
import { UseResourceLoader } from '../../../pixi';
import { images as sharedImages } from '../../asset';

export const images = {
    ...sharedImages,
    boat: require('./boat.png'),
    plane: require('./plane.png'),
};

const asset: Record<$Types.key<typeof images>, UseResourceLoader> = Object.entries(images)
    .map(([name, url]) => [name, { url }])
    .reduce((dict, [name, option]) => ({ ...dict, [name]: option }), {});

export default asset;
