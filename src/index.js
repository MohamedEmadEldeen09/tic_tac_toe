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


const socket = io.connect('https://tic-tac-toe-game-server.onrender.com')
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

