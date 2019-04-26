import { Comparator, compareNature } from './util';

export class TreeSet<E> {
    elements: Readonly<E>[] = [];
    constructor(comparator: Comparator<E> = compareNature, elements?: Readonly<E>[]) {
        this.comparator = comparator;
        elements && this.pushAll(elements);
    }

    get size() { return this.elements.length; }
    get isEmpty() { return this.elements.length === 0; }
    get head() { return this.elements[0]; }
    get last() { return this.elements[this.size - 1]; }

    /**
     * get and remove the head element
     */
    top() {
        if (this.isEmpty) return undefined;
        return this.elements.splice(0, 1)[0];
    }

    /**
     * get and remove the last element
     */
    pop() {
        if (this.isEmpty) return undefined;
        return this.elements.splice(this.size - 1, 1)[0];
    }

    push(element: Readonly<E>) {
        const index = binarySearch(this.comparator, this.elements, element);
        this.elements.splice(index, 0, element);
    }
    pushAll(elements: Readonly<E>[]) {
        elements.forEach(element => this.push(element));
    }
};

export function binarySearch<E>(comparator: Comparator<E>, elements: E[], target: E) {
    let left = 0;
    let right = elements.length - 1;

    while (left <= right) {
        const middle = (left + right) >> 1;
        const cmp = comparator(elements[middle], target);
        if (cmp < 0) {
            left = middle + 1;
        } else if (cmp > 0) {
            right = middle - 1;
        } else {
            return middle;
        }
    }

    return left;
}
