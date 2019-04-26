/** Logic */

import { $Types } from '../util/@types';
import { Subject } from 'rxjs';
import { Data, mock } from './mock';

export * from './mock';

export const subject: Subject<Data> = new Subject();

if (typeof window !== 'undefined' && window.core instanceof Function) window.core.subject = subject;
export const pipe: typeof subject.pipe = subject.pipe.bind(subject);

export type Core = typeof mock & { pipe: typeof pipe };
export type Event = $Types.key<Core>;
export type EventArgs = Parameters<$Types.value<Core>>;
export const events: Event[] = Object.keys(mock);
export default (event: Event, ...args: EventArgs) => Promise.resolve(mock[event](...args));
