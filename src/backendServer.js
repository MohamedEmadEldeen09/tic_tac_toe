import io from 'socket.io-client'

//backend server setup
export const socket = io.connect('https://tic-tac-toe-game-server.onrender.com')
//