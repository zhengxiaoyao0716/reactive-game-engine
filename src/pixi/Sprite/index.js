import React, { ReactNode, createContext, Context } from 'react';
import { Sprite as PIXISprite, Texture } from 'pixi.js';
import { useCloseableImmedite, useUpdate } from '../hook';
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
    const sprite = useCloseableImmedite(() => {
        const sprite = new PIXISprite(texture);
        container.addChild(sprite);
        return sprite;
    }, sprite => {
        container.removeChild(sprite);
        sprite.destroy();
    });

    useUpdate(() => {
        if (sprite == null) return;
        if (texture !== sprite.texture) sprite.texture = texture;
        if (position && position !== sprite.position) sprite.position.set(position.x, position.y);
        if (scale) {
            if (scale.x !== sprite.scale.x) sprite.scale.x = scale.x;
            if (scale.y !== sprite.scale.y) sprite.scale.y = scale.y;
        }
    }, [texture, position]);

    return <SpriteContext.Provider value={sprite}>{children}</SpriteContext.Provider>;
};

export * from './Animated';
export * from './Movable';
