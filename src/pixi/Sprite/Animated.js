import React, { ReactNode, useEffect } from 'react';
import { Texture, AnimatedSpriteTextureTimeObject, extras } from 'pixi.js';
import { useCloseable } from '../useCloseable';
import { useContainer } from '..';
import { $Props } from '../../core/@types';
import { SpriteContext } from '.';

export interface AnimatedSpriteProps {
    children?: ReactNode;
    textures: Texture[] | AnimatedSpriteTextureTimeObject[],
    autoUpdate?: $Props.frozen<boolean>,
    position?: { x: number, y: number },
    playing?: boolean,
    loop?: boolean,
    animationSpeed?: number,
    scale?: { x: number, y: number },
}

export const AnimatedSprite = ({ children, textures, autoUpdate, position, scale, playing = true, loop = true, animationSpeed = 1 }: AnimatedSpriteProps) => {
    const container = useContainer();
    const sprite = useCloseable(() => {
        const sprite = new extras.AnimatedSprite(textures, autoUpdate);
        container.addChild(sprite);
        return sprite;
    }, sprite => {
        container.removeChild(sprite);
        sprite.destroy();
    });

    useEffect(() => {
        if (sprite == null) return;
        if (textures !== sprite.textures) sprite.textures = textures;
        if (position && position !== sprite.position) sprite.position.set(position.x, position.y);
        if (playing !== sprite.playing) playing ? sprite.play() : sprite.stop();
        if (scale) {
            if (scale.x !== sprite.scale.x) sprite.scale.x = scale.x;
            if (scale.y !== sprite.scale.y) sprite.scale.y = scale.y;
        }
        if (loop !== sprite.loop) sprite.loop = loop;
        if (animationSpeed !== sprite.animationSpeed) sprite.animationSpeed = animationSpeed;
    }, [sprite, textures, position, playing, loop, animationSpeed]);

    return sprite && <SpriteContext.Provider value={sprite}>{children}</SpriteContext.Provider>;
};
