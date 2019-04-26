import React, { ReactNode, createContext, Context, useContext, useRef, useMemo } from 'react';
import { RendererOptions, CanvasRenderer, WebGLRenderer, autoDetectRenderer } from 'pixi.js';
import { useCloseable } from './useCloseable';
import { $Props } from '../core/@types';

interface Props {
    id?: string, className?: string;
    children?: ReactNode;
    create?: $Props.frozen<(view: HTMLCanvasElement) => WebGLRenderer | CanvasRenderer>;
}

export const RendererContext: Context<WebGLRenderer | CanvasRenderer> = createContext(null);
RendererContext.displayName = 'Renderer';

export const Renderer = ({ id, className, children, create }: Props) => {
    const canvasRef = useRef(null);
    const renderer = useCloseable(() => create ? create(canvasRef.current) : autoDetectRenderer({ view: canvasRef.current }));
    return (
        <>
            <canvas id={id} className={className} ref={canvasRef} />
            {renderer && (
                <RendererContext.Provider value={renderer}>
                    {children}
                </RendererContext.Provider>
            )}
        </>
    );
};
Renderer.Creator = (options?: RendererOptions) => useMemo(() => ({ create: (view: HTMLCanvasElement) => autoDetectRenderer({ view, ...options }) }), []);

export const useRenderer = () => useContext(RendererContext);

export const useScreen = () => {
    const renderer = useContext(RendererContext);
    return renderer && renderer.screen;
};

export const useView = () => {
    const renderer = useContext(RendererContext);
    return renderer && renderer.view;
};
