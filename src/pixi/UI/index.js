import React, { ReactNode, useMemo } from 'react';
import './index.css';
import { useRenderer } from '../Renderer';
import { useObservable } from '../../util/rxjs';
import { fromEvent } from 'rxjs';
import { map, debounceTime } from 'rxjs/operators';

interface Props {
    id?: string, className?: string;
    children?: ReactNode;
}

const styleOf = ({ clientWidth: width, clientHeight: height, offsetLeft: left, offsetTop: top }: HTMLCanvasElement) => ({ width, height, left, top });

export const UI = ({ id, className = '', children }: Props) => {
    const renderer = useRenderer();
    const styleEvent = useMemo(() =>
        fromEvent(window, 'resize')
            .pipe(map(_event => styleOf(renderer.view)))
            .pipe(debounceTime(100))
        , []);
    const style = useObservable(styleEvent, styleOf(renderer.view));
    return (
        <div id={id} className={`${className && `${className} `}PIXI UI`} style={style}>{children}</div>
    );
};
