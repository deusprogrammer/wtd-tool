import './App.css';
import React, {useState} from 'react';
import {BrowserRouter as Router, Switch, Route, Link, BrowserRouter} from 'react-router-dom'
import {ToastContainer, toast} from 'react-toastify';

import SubtitleEditor from './routes/SubtitleEditor';
import ZipEditor from './routes/ZipEditor';
import VideoList from './routes/VideoList';
import VideoView from './routes/VideoView';

import 'react-toastify/dist/ReactToastify.css';
import TypeSelection from './routes/TypeSelection';

let App = (props) => {
    return (
        <div className="App">
            <ToastContainer />
            <Router>
                <h1>What the Dub Tools</h1>
                <hr/>
                <div>v1.5.0b</div>
                <hr/>
                <div style={{minHeight: "50vh"}}>
                    <Switch>
                        <Route exact path={`${process.env.PUBLIC_URL}/`} component={TypeSelection} />
                        <Route exact path={`${process.env.PUBLIC_URL}/create/:type`} component={ZipEditor} />
                        <Route exact path={`${process.env.PUBLIC_URL}/videos`} component={VideoList} />
                        <Route exact path={`${process.env.PUBLIC_URL}/videos/:id`} component={VideoView} />
                        <Route exact path={`${process.env.PUBLIC_URL}/editor`} component={SubtitleEditor} />
                        <Route exact path={`${process.env.PUBLIC_URL}/editor/standalone`} component={ZipEditor} />
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
