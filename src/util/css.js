/** 如果是旧浏览器则返回 `legacy` ，否则返回空字符串，用于一些兼容性处理 */
export const legacy = window.CSS && window.CSS.supports && window.CSS.supports('display: flex') ? '' : 'legacy';

const autoPrefixProperties = (properties: string[]) =>
    (style: string | React.CSSProperties) =>
        typeof style === 'string'
            ? style.replace(
                new RegExp(`(;?\r?\n?)(\\s*)(${Array.from(properties).join('|')})([^;]+;\r?\n?)`, 'g'),
                `$1${['-webkit-', '-moz-', '-ms-', ''].map(prefix => `$2${prefix}$3$4`).join('')}`
            )
            : Object.entries(style).map(
                ([name, value]) =>
                    properties.has(name)
                        ? ['Webkit', 'Moz', 'ms']
                            .map(prefix => [prefix, `${prefix}${name[0].toUpperCase()}${name.slice(1)}`])
                            .reduce((style, name) => ({ ...style, [name]: value }), { [name]: value })
                        : ({ [name]: value })
            ).reduce((dict, style) => ({ ...dict, style }));

export const autoPrefix = autoPrefixProperties(new Set(['transform', 'transform-origin', 'transition']));
