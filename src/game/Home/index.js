import React, { useCallback } from 'react';
import { match } from 'react-router-dom';
import { History, Location } from 'history';
import './index.css';

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
        await document.body.requestFullscreen();
        history.push({ ...location, pathname: '/--start' });
    }, []);
    return (
        <div className="Home">
            <h1 onClick={onStart}>START</h1>
        </div>
    );
};
export default Home;
