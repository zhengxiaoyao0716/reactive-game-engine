import { $Types } from '../../core/@types';
import { OperatorFunction, Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';

export function pick<T, K>(key: K): OperatorFunction<T, $Types.index<T, K>> {
    const predicate: $Types.isIndexAt<T, K> = (data: T) => data[key] !== undefined;
    const mapper = (data: T) => data[key];
    return (source: Observable<T>) => source.pipe(filter(predicate)).pipe(map(mapper));
};
