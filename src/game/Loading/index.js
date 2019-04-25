import React from 'react';
import { Gradient, THColor } from '../../pixi';
import { IndicatorProps } from '../../pixi/Progress';
import { UI } from '../../pixi/UI';

const Loading = ({ progress, resource }: IndicatorProps) => (
    <UI>
        <Gradient {...Gradient.Simple(progress)}>{state =>
            <div style={{ position: 'absolute', width: `${state}%`, height: 6, left: 0, bottom: 0, background: THColor.Reimu.hex }} />
        }</Gradient>
        <small style={{ position: 'absolute', right: 0, bottom: 0 }}>{progress.toFixed(2)}% | {resource && resource.name} {resource && resource.error && 'failed'}</small>
    </UI>
);

export default Loading;
