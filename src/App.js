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
                <h1>What the Dub Tools</h1>
                <hr/>
                <div>v1.0.0a</div>
                <hr/>
                <div style={{minHeight: "50vh"}}>
                    <Switch>
                        <Route exact path={`${process.env.PUBLIC_URL}/`} component={StandAloneEditor} />
                        <Route exact path={`${process.env.PUBLIC_URL}/videos`} component={VideoList} />
                        <Route exact path={`${process.env.PUBLIC_URL}/editor`} component={SubtitleEditor} />
                        <Route exact path={`${process.env.PUBLIC_URL}/editor/standalone`} component={StandAloneEditor} />
                    </Switch>
                </div>
                <hr/>
                <div>This product is still in early access.</div>
                <div>Contribute to the project at <a href="https://github.com/deusprogrammer/wtd-tool">https://github.com/deusprogrammer/wtd-tool</a></div>
            </Router>
        </div>
    );
}

export default App;
