/** Render */

import React from 'react';
import { match, BrowserRouter as Router, Route, Redirect, RouteComponentProps } from 'react-router-dom';
import './index.css';
import { Renderer, Ticker, Stage } from '../pixi';
import Home from './Home';
import Scene0 from './Scene0';

const Scenes = {
    '0': Scene0,
};

interface Props {
    match: match<{ sceneId: '0' }>;
};

const Game = ({ match }: Props) => {
    const Scene = Scenes[match.params.sceneId];

    return (
        <Ticker>
            <Renderer id="game" {...Renderer.Creator({ width: 1920, height: 1080, transparent: true })}>
                <Stage>
                    <Stage.TickRefresh />
                    <Scene />
                </Stage>
            </Renderer>
        </Ticker>
    );
};

export default (
    <Router>
        <>
            <Route exact path={'/'} /* redirect the root page to `Home` */
                component={({ location }: RouteComponentProps) => <Redirect to={{ ...location, pathname: '/Home' }} />} />
            <Route path={'/Home'} component={Home} />

            <Route exact path={'/--start'} /* redirect `start` to first scene */
                component={({ location }: RouteComponentProps) => <Redirect to={{ ...location, pathname: '/Scene/0' }} />} />
            <Route path="/Scene/:sceneId" component={Game} />
        </>
    </Router>
);
