import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';
import './css/entryStyles.css'
import './css/roomStyles.css'
import { Provider } from 'react-redux';
import store from './reduxStore/store';
import io from 'socket.io-client'
import 'react-toastify/dist/ReactToastify.css';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <App/>
  </Provider>

);

