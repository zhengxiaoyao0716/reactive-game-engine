export function shuffle<E>(elements: E[]) {
    const wrapper = elements.map(element => ({ element, weight: Math.random() }));
    wrapper.sort(compareExtract(({ weight }) => weight));
    return wrapper.map(({ element }) => element);
};

export type Comparator<E> = (e1: E, e2: E) => -1 | 0 | 1;

export const compareNature = (l, r) => l < r ? -1 : l === r ? 0 : 1;

export function compareExtract<T, E>(mapper: (element: T) => E, compare: Comparator<E> = compareNature): Comparator<T> {
    return (target1, target2) => compare(mapper(target1), mapper(target2));
}
