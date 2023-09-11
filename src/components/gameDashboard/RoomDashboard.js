import React, { useEffect , useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import RoomChating from './RoomChating'
import GameLogic from './GameLogic'
import { useNavigate, useParams } from 'react-router-dom'
import { setPlayerLeaved } from '../../reduxStore/gameSlice'
import { socket } from '../../backendServer'
import { Radio} from 'react-loader-spinner'
import { ToastContainer, toast } from 'react-toastify'

function RoomDashboard() {

  const [waitingTowPlayersEntry , setWaitngTowPlayersEntry] = useState('waiting')
  const {entryWay} = useParams()

  const notifications = useSelector(state=>state.game.notifications) 
  const joinsAndRequests = useSelector(state=>state.game.joinsAndRequests) 
  const isThePlayerMainOrGuest = useSelector(state=>state.game.isThePlayerMainOrGuest)
  const mainPlayer = useSelector(state=>state.game.mainPlayer)
  const guestPlayer = useSelector(state=>state.game.guestPlayer)
  const playerLeaved = useSelector(state=>state.game.playerLeaved)
  const targetNote = useSelector(state=>state.game.targetNote)

  const navigate = useNavigate()
  const dispatch = useDispatch() 

  useEffect(()=>{
    //protect route
    if(mainPlayer?.name == "" || mainPlayer.room?.roomID == ""
    || mainPlayer.room?.inputType == ""){
      navigate('/tic_tac_toe/entry/player_info')
    }
    // 

    if(isThePlayerMainOrGuest == 'main'){
      if(entryWay == 'player_request_path'){

        joinsAndRequests.forEach(playerID => {    
          if(playerID != guestPlayer.socketID){
            socket.emit('room-is-busy-now' , playerID)  
          }                       
        })

        setWaitngTowPlayersEntry('ready') 
      }        

      if(entryWay == 'room_request_path'){        
        notifications.forEach(note => {
          if(!note.room && !note.hasReacted && note.playerID != guestPlayer.socketID){
            socket.emit('room-is-busy-now' , note.playerID)
          }  
        });
      }
    }       

    if(isThePlayerMainOrGuest == 'guest'){ 
      if(entryWay == 'room_request_path'){
        setWaitngTowPlayersEntry('ready') 
      } 
    }  

    //for random room start
    if(entryWay == 'random_request_path'){
      setWaitngTowPlayersEntry('ready') 
    } 
    
    //game start again
    if(entryWay == 'game_start_again'){
      setWaitngTowPlayersEntry('ready')
    }

    //when component unmount
    return(()=>{   
      socket.off('room-is-busy-now')

      //start or disconnect room  
      socket.off('guest-player-started-room')
      socket.off('player-disconnected-room')

      //chat
      socket.off('recieve-message')
      socket.off('chat-guest-player-typing-message-start')
      socket.off('chat-guest-player-typing-message-stop')

      //game logic
      socket.off('send-playing-inputType' )
      socket.off('update-game-logic')
      socket.off('player-wants-to-play-agian')
      socket.off('leave-room')
      socket.off('second-player-leave-room')
    })
    //
  },[])
   
  useEffect(()=>{
    socket.on('guest-player-started-room' , ()=>{
      setWaitngTowPlayersEntry('ready')
    })
    
    socket.on('room-is-busy-now' , ()=>{
      const playerDetails = JSON.parse(localStorage.getItem('ticTacGamePlayerDetails'))
      if(playerDetails){
        localStorage.removeItem('ticTacGamePlayerDetails')
      }

      localStorage.setItem('ticTacGamePlayerDetails' , JSON.stringify({
        name:mainPlayer.name,
        notifications
      }))
      
      toast('the other player is busy!' ,{
        type:'error',
        autoClose:true,       
      })

      window.location.href = 'https://MohamedEmadEldeen09.github.io/tic_tac_toe/entry/room_id/room_registration'
    })

    socket.on('player-disconnected-room' , ()=>{
      dispatch(setPlayerLeaved(true))     
    })   
  },[socket])

  const handleCloseOrExitGame = (e)=>{
    const playerDetails = JSON.parse(localStorage.getItem('ticTacGamePlayerDetails'))
    if(playerDetails){
      localStorage.removeItem('ticTacGamePlayerDetails')
    }

    localStorage.setItem('ticTacGamePlayerDetails' , JSON.stringify({
      name:mainPlayer.name,
      notifications
    }))
    
    //that will happen in the begining when i wait too mush time 
    //for the other player and i want leave before the game start
    //and i want the other player to know that i leaved
    if(e.target.id && e.target.id == 'leave-when-waiting'){
      socket.emit('cancel-join-request-note' ,targetNote[0])
    }
    //
    
    window.location.href = 'https://MohamedEmadEldeen09.github.io/tic_tac_toe/entry/room_id/room_registration'
  }

  //if one of the tow players did not inter the Room yet
  if(waitingTowPlayersEntry == 'waiting'){
    return (
      <div className='dashboard-room-container'>
        <div className='room-dashboard-card center-content'>  
          <Radio colors={['rgb(0, 255, 255)' , 'rgb(0, 255, 255)']}
            width='80px' height='80px'/>        
          <p className='player-win-message'>please wait for the other player!</p>    
          <button id='leave-when-waiting' className='btn btn-second' 
           onClick={handleCloseOrExitGame}>leave</button>      
        </div>              
      </div>
    )
  }
 
 //if player close or refresh the page or click on the leave button
  if(playerLeaved){
  return (
    <div className='dashboard-room-container'>
      <div className='room-dashboard-card center-content'>
        <div className='icon-class icon-available'>
          <i className='bx bxs-message-square-error'></i>
        </div>
        <h3 className='player-win-message'>player exit!</h3>
        <button className='btn btn-second' 
        onClick={handleCloseOrExitGame}>Go Back To Menu</button>
      </div>     
    </div>
  )
  }

  //if waitingTowPlayersEntry == 'ready'
  return (
    <div className='dashboard-room-container'>
      <div className='game-process'>
        <GameLogic />         
      </div>

      <div className='players-chating room-dashboard-card'>
        <RoomChating />
      </div>
      <ToastContainer />
    </div>
  )
}

export default RoomDashboard

//<i class='bx bxs-message-square-error'></i>

//<box-icon name='closet'></box-icon>

//<box-icon name='user-check'></box-icon>