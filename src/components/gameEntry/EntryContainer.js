import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { setAllHasReacted, setHasReacted, setNotifications, setPlayerLeaved, setWaiting } from '../../reduxStore/gameSlice'
import { socket } from '../../backendServer'
import { ToastContainer, toast } from 'react-toastify'


function EntryContainer() {  
  const [notificationsCounter , setNotificationsCounter] = useState(0)

  const notifications = useSelector(state=>state.game.notifications)
  const mainPlayer = useSelector(state=>state.game.mainPlayer)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  //protect route
  useEffect(()=>{
    if(mainPlayer.playerState == 'busy'){
      navigate(`/tic_tac_toe/dashboard/room/${mainPlayer.room.roomID}/player-request-path`)
    }
    
    return(()=>{
      dispatch(setAllHasReacted())
    })    
  },[])

  useEffect(()=>{
    socket.on('play-request-note' , (note)=>{
      dispatch(setNotifications(note))
    })

    socket.on('accept-sender-request-to-join-his-room' , (note)=>{
      dispatch(setNotifications(note))
    })

    //if room became busy which means this room is not available any more
    socket.on('room-is-busy-now' , ()=>{
      toast('the other player is busy!' ,{
        type:'error',
        autoClose:true,       
      })
      dispatch(setWaiting(''))      
    })

    socket.on('cancel-join-request-note' , ({id , targetPlayerID})=>{     
      dispatch(setHasReacted(id))
    })
  },[socket])
  
  useEffect(()=>{   
    const notesThatHasNoReactionYet = notifications.filter(note=> !note.hasReacted)
    setNotificationsCounter(notesThatHasNoReactionYet.length)   
  },[notifications])

  return (
    <div className='entry-container'>
        <div className='logo'>
          <h3>Live Server<span className='game-name'>Tic Tac Toe Game</span></h3>                  
        </div>         

        <div className='entry-player-notifictaions-room'>         
          {
            mainPlayer.room.roomID != "" &&
            mainPlayer.room.inputType != "" &&
            <Link  className='player-notes-room'
              to={`/tic_tac_toe/entry/room_details/${mainPlayer.room.roomID}`}>              
              <div className='icon-class'><i className='bx bxs-tachometer' ></i></div> 
            </Link>
          }     
          {
            mainPlayer.name != "" &&
            <Link  className='player-notes-room' 
            to='/tic_tac_toe/entry/notifications'>
            <div className='icon-class'><i className='bx bxs-bell'></i></div>
            {
              notificationsCounter > 0 && 
              <div className='notes-counter'>+{notificationsCounter}</div>
            }</Link>
          }              
        </div>

        <div className='entry-container-children'>
          <Outlet />
        </div>
        <ToastContainer />
    </div>
  )
}

export default EntryContainer

//<i class='bx bxs-bell'></i>
//<i class='bx bxs-home-alt-2' ></i>

//rooms 
//<i class='bx bxs-tachometer' ></i>

//players
//<i class='bx bxs-user'></i>

//request player
//<i class='bx bxs-user-plus'></i>

//user connect
//<i class='bx bxs-user-check'></i>

//user disconnect
//<i class='bx bxs-user-x'></i>

//for chat
//<i class='bx bxs-send'></i>
//<i class='bx bxs-user-account'></i>
