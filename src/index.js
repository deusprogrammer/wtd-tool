import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import axios from 'axios';

axios.interceptors.response.use(function (response) {
    return response;
}, function (error) {
    if (error.response.status === 401) {
        window.localStorage.setItem("twitchRedirect", window.location);
        window.location = "https://deusprogrammer.com/api/auth-svc/auth/twitch";
        return;
    }
    return Promise.reject(error);
});

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
