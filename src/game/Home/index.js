import React, { useCallback } from 'react';
import { match } from 'react-router-dom';
import { History, Location } from 'history';
import './index.css';
import { images } from '../asset';

interface LocationState {
};
interface Props {
    history: History<LocationState>;
    location: Location<LocationState>;
    match: match;
};

// eslint-disable-next-line no-unused-vars
const Home = ({ history, location, match }: Props) => {
    const onStart = useCallback(async () => {
        if (window.requestFullscreen) await window.requestFullscreen();
        else if (document.body.requestFullscreen) await document.body.requestFullscreen();
        else if (document.body.webkitRequestFullscreen) await new Promise(resolve => { document.body.webkitRequestFullscreen(); setTimeout(() => resolve(), 1000); });
        else console.warn('browser not supported `requestFullscreen`'); // eslint-disable-line no-console
        history.push({ ...location, pathname: '/--start' });
    }, []);
    return (
        <div className="Home">
            <img src={images.bg} alt="background" />
            <img className="button" onClick={onStart} src={images.start} alt="start" />
        </div>
    );
};
export default Home;
