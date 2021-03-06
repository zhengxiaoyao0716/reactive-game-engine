import React, { ReactNode, useMemo, CSSProperties } from 'react';
import './index.css';
import { useRenderer } from '../Renderer';
import { useObservable } from '../../util/rxjs';
import { fromEvent } from 'rxjs';
import { map, debounceTime } from 'rxjs/operators';
import { CanvasRenderer, WebGLRenderer } from 'pixi.js';

interface Props {
    id?: string, className?: string;
    children?: ReactNode;
    /** adapt the canvas by scaling the size instead of cropping it. */
    scaleMode?: boolean,
}

const styleOf = (renderer: WebGLRenderer | CanvasRenderer, scaleMode: boolean): CSSProperties => {
    const { clientWidth, clientHeight, offsetLeft, offsetTop } = renderer.view;
    if (!scaleMode) return { width: clientWidth, height: clientHeight, left: offsetLeft, top: offsetTop };
    const { width, height } = renderer;
    return {
        width, height,
        transform: `scale(${clientWidth / width}, ${clientHeight / height})`,
        left: (clientWidth - width) / 2 + offsetLeft, top: (clientHeight - height) / 2 + offsetTop,
    };
};

export const UI = ({ id, className = '', children, scaleMode }: Props) => {
    const renderer = useRenderer();
    const styleEvent = useMemo(() =>
        fromEvent(window, 'resize')
            .pipe(map(_event => styleOf(renderer, scaleMode)))
            .pipe(debounceTime(100))
        , []);
    const style = useObservable(styleEvent, useMemo(() => styleOf(renderer, scaleMode), []));
    return (
        <div id={id} className={`${className && `${className} `}PIXI UI`} style={style}>{children}</div>
    );
};
