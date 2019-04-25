import { useState, useEffect, useDebugValue } from 'react';
import { Observable } from 'rxjs';

export function useObservable<T>(observable: Observable<T>, init?: T, deps = []) {
    const [value, setValue] = useState(init);
    useEffect(() => {
        const subcription = observable.subscribe(value => setValue(value));
        return () => subcription.unsubscribe();
    }, deps);
    useDebugValue(value, JSON.stringify);
    return value;
};

export * from './pick';
