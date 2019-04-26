/** server side only! */

import { $Types } from './@types';
import { mock, Core, EventArgs } from '.';

if (typeof window !== 'undefined') throw new Error('`core/main` should be used in server side only!');
export * from '.';

const core = {
    ...mock,
};

export default (event: $Types.key<Core>, ...args: EventArgs) => Promise.resolve(core[event](...args));
