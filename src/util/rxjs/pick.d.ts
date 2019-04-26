import { $Types } from '../../core/@types';
import { OperatorFunction, Observable } from 'rxjs';

export function pick<T, K extends keyof T>(key: K): OperatorFunction<T, $Types.index<T, K>>;
