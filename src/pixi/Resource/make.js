import { loaders, Graphics, Circle, Ellipse, Polygon, Rectangle, RoundedRectangle, Point, Texture, Text, TextStyleOptions, CanvasRenderer } from 'pixi.js';

type Shapes = Circle | Ellipse | Polygon | Rectangle | RoundedRectangle;

const newColor = (value: number, data: string) => {
    if (value > 0xFFFFFFFF) throw new Error(`color value overflow: ${value.toString(16)}`);
    const hex = `#${value.toString(16).toUpperCase()}`;
    const R = value / 0x01000000 | 0;
    const G = (value / 0x00010000 | 0) % 0x100;
    const B = (value & 0x0000FF00) >> 8;
    const A = value & 0x000000FF;
    return {
        /** 0x123456 */value, /** base64 uri data */data,
        /** "#123456" */hex, /** "123456" */toString() { return value.toString(16); },
        rgb: { R, G, B }, rgba: { R, G, B, A }, alpha: A,
    };
};
export const THColor = {
    /** red */
    Reimu: newColor(0xCB1B45ff, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAE0lEQVQoU2M8Le36nwEPYBwZCgDiuxFZv0b9QAAAAABJRU5ErkJggg=='),
    /** black */
    Marisa: newColor(0x1C1C1Cff, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAE0lEQVQoU2OUkZH5z4AHMI4MBQAGEgqh6nJAewAAAABJRU5ErkJggg=='),
    /** yellow */
    Alice: newColor(0xE98B2Aff, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAE0lEQVQoU2N82a31nwEPYBwZCgDzHRTxpXyovQAAAABJRU5ErkJggg=='),
    /** baka */
    Cirno: newColor(0x58B2DCff, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAFElEQVQoU2OM2HTnPwMewDgyFAAAMsMXMXWBeqIAAAAASUVORK5CYII='),
    /** white */
    Sakuya: newColor(0xFCFAF2ff, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAFElEQVQoU2P88+vTfwY8gHFkKAAA1JcfQVtkt10AAAAASUVORK5CYII='),
    /** green */
    Youmu: newColor(0x227D51ff, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAE0lEQVQoU2NUqg38z4AHMI4MBQDO6A+BFQpJiAAAAABJRU5ErkJggg=='),
    /** sakura */
    Yuyuko: newColor(0xFEDFE1ff, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAFElEQVQoU2P8d//hfwY8gHFkKAAAFOcd8YzlO0MAAAAASUVORK5CYII='),
    /** purple */
    Yakumo: newColor(0x4A225Dff, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAE0lEQVQoU2P0Uor9z4AHMI4MBQAdPA5J0HdVbgAAAABJRU5ErkJggg=='),
};

export const makeResource = {
    preset: {},
    shape: (
        { fill, line }: {
            fill?: {
                color?: number,
                alpha?: number,
            },
            line?: { width?: number, color?: number, alpha?: number },
        } = {},
    ) => {
        const border = (line && line.width) ? 2 * line.width : 0;
        return {
            draw: (shape: Shapes | ((graphics: Graphics) => void)) => {
                const graphics = new Graphics();
                fill ? graphics.beginFill(fill.color, fill.alpha) : graphics.beginFill(0x000000);
                line && graphics.lineStyle(line.width, line.color, line.alpha);
                if (shape instanceof Function) {
                    shape(graphics);
                } else {
                    graphics.drawShape(shape);
                }
                return (id?: string, loader?: loaders.Loader, scaleMode?: number, resolution?: number) => {
                    const texture = graphics.generateCanvasTexture(scaleMode, resolution);
                    if (id) {
                        if (loader) {
                            const resource = new loaders.Resource(id, `#${id}`);
                            loader.resources[id] = resource;
                            resource.texture = texture;
                        }
                        Texture.addToCache(texture, id);
                    }
                    return texture;
                };
            },
            circle(radius: number) {
                return this.draw(new Circle(border + radius, border + radius, radius));
            },
            ellipse(width: number, height: number) {
                return this.draw(new Ellipse(border + width, border + height, width, height));
            },
            polygon(...points: Point[]) {
                return this.draw(new Polygon(...points));
            },
            rectangle(width: number, height: number) {
                return this.draw(new Rectangle(border, border, width, height));
            },
            roundedRectangle(width: number, height: number, radius?: number) {
                return this.draw(new RoundedRectangle(border, border, width, height, radius));
            },
            triangle(width: number, height: number, sharp: number) {
                return this.draw(new Polygon(new Point(border + sharp, border), new Point(border, border + height), new Point(border + width, border + height)));
            },
            star(points: number, radius: number, innerRadius?: number, rotation?: number) {
                return this.draw(graphics => graphics.drawStar(border + radius, border + radius, points, radius, innerRadius, rotation));
            },
        };
    },
    text: (value: string, style?: TextStyleOptions) => {
        const renderer = new CanvasRenderer();
        return (id?: string, loader?: loaders.Loader) => {
            const text = new Text(value, style);
            renderer.render(text);
            renderer.clear();
            const texture = text.texture;

            if (id) {
                if (loader) {
                    const resource = new loaders.Resource(id, `#${id}`);
                    loader.resources[id] = resource;
                    resource.texture = texture;
                }
                Texture.addToCache(texture, id);
            }
            return texture;
        };
    },
    // spritesheet: () => {
    //     const canvas = document.createElement('canvas');
    //     // TODO draw spritesheet.
    //     const baseTexture = BaseTexture.fromCanvas(canvas);
    //     const data = {};

    //     const spritesheet = new Spritesheet(baseTexture, data);
    //     return (id?: string, loader?: loaders.Loader) => {
    //         if (id) {
    //             if (loader) {
    //                 const resource = new loaders.Resource(id, `#${id}`);
    //                 loader.resources[id] = resource;
    //                 resource.spritesheet = spritesheet;
    //             }
    //         }
    //         return spritesheet;
    //     };
    // },
};

// type SpritesheetFrameData = {
//     frame: { x: number, y: number, h: number, w: number },
//     // rotated?: boolean,
//     trimmed?: boolean,
//     // spriteSourceSize?: { x: number, y: number, h: number, w: number },
//     // sourceSize?: { h: number, w: number },
// };
// const spritesheetData = (width: number, height: number, scale = 1) => {
//     const meta = {
//         // image: imageName,
//         size: { w: width, h: height },
//         scale,
//     };
//     const frames: { [frameName: string]: FrameData } = {};
//     const animations: { [animName: string]: string[] } = {}; // { animName -> [ ...frameName ] }
//     return {
//         meta,
//         frames,
//         animations,
//     };
// };
