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


const socket = io.connect('http://localhost:3002')
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
  //   <Provider store={store}>
  //      <App />
  //   </Provider>
  // </React.StrictMode>

  <Provider store={store}>
     <App socket={socket}/>
  </Provider>

);

