interface Alias { }

export namespace $Props {
    /** `frozen` prop should never be changed after mounted. */
    export type frozen<T> = T & Alias;
}

export namespace $Types {
    export type key<O> = keyof O;
    export type value<O> = O[keyof O];
    export type index<O, K extends keyof O> = O[K];
    export type element<A extends any[]> = A[number];
    export type isIndexAt<O, K extends keyof O> = (o: O) => o is $Types.index<O, K>;
}
