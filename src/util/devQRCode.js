import { autoPrefix } from './css';
import { isDevelopment } from './env';


// 加个二维码，方便手机访问
isDevelopment && window.addEventListener('load', () => import('qrcode').then(({ toCanvas }) =>
    document.body.appendChild((container => {
        container.id = 'shareQRCode';

        const canvas = document.createElement('canvas');
        container.appendChild(canvas);
        canvas.addEventListener('mouseenter', () => toCanvas(canvas, window.location.href));
        toCanvas(canvas, window.location.href);

        const style = document.createElement('style');
        container.appendChild(style);
        style.innerHTML = autoPrefix(
            `
            #shareQRCode>canvas {
                position: fixed;
                bottom: 6px;
                right: 6px;
                transform: scale(0.2);
                transform-origin: 100% 100%;
                transition: transform 0.3s ease-in-out;
                z-index: 1;
            }
            #shareQRCode>canvas:active,
            #shareQRCode>canvas:hover {
                transform: scale(1);
            }`.replace(/\n\s{12}/g, '\n')
        );
        return container;
    })(document.createElement('div')))
));
