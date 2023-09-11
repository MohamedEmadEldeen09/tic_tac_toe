import React, { useEffect} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, NavLink, Outlet, useNavigate ,useParams} from 'react-router-dom'
import { setPlayerInfo } from '../../reduxStore/gameSlice'
import { socket } from '../../backendServer'

function RoomId() {
  const {afterLeaveRoom} = useParams()
  const navigate = useNavigate()
  const mainPlayer = useSelector(state=>state.game.mainPlayer)
  const dispatch = useDispatch()
  
  //protect route
  useEffect(()=>{
    if(afterLeaveRoom == 'room_registration'){
      /* 
      I needed to save player name an his notifications in the local
      storage after he leaves the game room and i have no  
      choise but to use this way beacuse i will navigate using window.location
      and that will make the player disconnected with the server and his data will
      delete so i need to save his data in some place.
      I should use useNavigation from react-router-dom libarary but 
      this approach takes place
      a lot of issues with sockets events the main problem is that the
      socket were runnong multiple times so i tried many solutions
      (socket.off()) to solve this 
      issues but they did not work so i had to restart the socket again
      which means disconnect the player and connect him agian
      that is the only solution i have right now.
      */
      const playerDetails = JSON.parse(localStorage.getItem('ticTacGamePlayerDetails'))
      if(playerDetails){
        dispatch(setPlayerInfo({
          mainPlayer:{
            name : playerDetails.name,
            playerState:"available"
          },
          notifications:playerDetails.notifications
        }))       

        socket.emit('user-info' , {
          name:playerDetails.name,
          socketID:"",
          playerState:'available'
        })
      }else{
        navigate('/tic_tac_toe/entry/player_info')
      }
      //
    }else{
      if(mainPlayer.name == ''){
        navigate('/tic_tac_toe/entry/player_info')
      }
      if(mainPlayer.room.roomID != ""){
        navigate('/tic_tac_toe/entry/room_rounds')
      }
    }   

    return(()=>{      
      const playerDetails = JSON.parse(localStorage.getItem('ticTacGamePlayerDetails'))
      if(playerDetails){
        localStorage.clear()
      }
    })
  },[])

  useEffect(()=>{
    socket.on('get-user-socket-id' , (userID)=>{
      dispatch(setPlayerInfo({
        mainPlayer:{
          socketID:userID, 
        }
      }))
    })   
  },[socket])

  const handleBack = ()=>{
    navigate('/tic_tac_toe/entry/player_info')
  }
    
  return (
    <div className='room-id'>                
      <div className='switch-tab-create-join'>
        <NavLink to='/tic_tac_toe/entry/room_id/create_room'>Create Room</NavLink>
        <NavLink to='/tic_tac_toe/entry/room_id/join_room'>Join Room</NavLink>       
        <NavLink to='/tic_tac_toe/entry/room_id/random_room'>Random Room</NavLink>
      </div>

      <Outlet/>
      
      <div className='entry-article'>
        <button onClick={handleBack} className='btn btn-back'>Back</button>
      </div>
    </div>
  )
}

export default RoomId
