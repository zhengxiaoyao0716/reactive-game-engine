import React, { ReactNode, createContext, Context, useEffect } from 'react';
import { Sprite as PIXISprite, Texture } from 'pixi.js';
import { useCloseable } from '../useCloseable';
import { useContainer } from '..';

export interface SpriteProps {
    children?: ReactNode;
    texture?: Texture;
    position?: { x: number, y: number };
    scale?: { x: number, y: number },
}

export const SpriteContext: Context<PIXISprite> = createContext(null);
SpriteContext.displayName = 'Sprite';

export const Sprite = ({ children, texture, position, scale }: SpriteProps) => {
    const container = useContainer();
    const sprite = useCloseable(() => {
        const sprite = new PIXISprite(texture);
        container.addChild(sprite);
        return sprite;
    }, sprite => {
        container.removeChild(sprite);
        sprite.destroy();
    });

    useEffect(() => {
        if (sprite == null) return;
        if (texture !== sprite.texture) sprite.texture = texture;
        if (position && position !== sprite.position) sprite.position.set(position.x, position.y);
        if (scale) {
            if (scale.x !== sprite.scale.x) sprite.scale.x = scale.x;
            if (scale.y !== sprite.scale.y) sprite.scale.y = scale.y;
        }
    }, [sprite, texture, position]);

    return sprite && <SpriteContext.Provider value={sprite}>{children}</SpriteContext.Provider>;
};

export * from './Animated';
export * from './Movable';
