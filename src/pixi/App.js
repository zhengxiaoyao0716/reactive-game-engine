import React, { ReactNode, useRef, useMemo } from 'react';
import { Application, ApplicationOptions } from 'pixi.js';
import { LoaderContext, RendererContext, StageContext, TickerContext } from '.';
import { $Props } from '../core/@types';
import { useCloseable } from './hook';

interface Props {
    id?: string, className?: string;
    children?: ReactNode;
    create?: $Props.frozen<(view: HTMLCanvasElement) => Application>;
}

export const App = ({ id, className, children, create }: Props) => {
    const canvasRef = useRef(null);
    const app = useCloseable(() => create ? create(canvasRef.current) : new Application({ view: canvasRef.current }));
    return (
        <>
            <canvas id={id} className={className} ref={canvasRef} />
            {app && (
                <LoaderContext.Provider value={app.loader}>
                    <RendererContext.Provider value={app.renderer}>
                        <StageContext.Provider value={app.stage}>
                            <TickerContext.Provider value={app.ticker}>
                                {children}
                            </TickerContext.Provider>
                        </StageContext.Provider>
                    </RendererContext.Provider>
                </LoaderContext.Provider>
            )}
        </>
    );
};
App.Creator = (options?: ApplicationOptions) => useMemo(() => ({ create: (view: HTMLCanvasElement) => new Application({ view, ...options }) }), []);
