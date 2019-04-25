import React from 'react';
import { match, Link } from 'react-router-dom';
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
    return (
        <div className="Home">
            <Link to={{ ...location, pathname: '/--start' }}>START</Link>
        </div>
    );
};
export default Home;
