import './App.css';
import React, {useState} from 'react';
import {BrowserRouter as Router, Switch, Route, Link, BrowserRouter} from 'react-router-dom'
import {ToastContainer, toast} from 'react-toastify';

import SubtitleEditor from './routes/SubtitleEditor';
import StandAloneEditor from './routes/StandAloneEditor';
import VideoList from './routes/VideoList';
import Home from './routes/Home';

import 'react-toastify/dist/ReactToastify.css';

let App = (props) => {
    return (
        <div className="App">
            <ToastContainer />
            <Router>
                <div style={{textAlign: "center"}}>
                    <Link to={`${process.env.PUBLIC_URL}/videos`}>Video List</Link>|<Link to={`${process.env.PUBLIC_URL}/editor/standalone`}>Standalone Editor</Link>
                </div>
                <Switch>
                    <Route exact path={`${process.env.PUBLIC_URL}/`} component={Home} />
                    <Route exact path={`${process.env.PUBLIC_URL}/videos`} component={VideoList} />
                    <Route exact path={`${process.env.PUBLIC_URL}/editor`} component={SubtitleEditor} />
                    <Route exact path={`${process.env.PUBLIC_URL}/editor/standalone`} component={StandAloneEditor} />
                </Switch>
            </Router>
        </div>
    );
}

export default App;
