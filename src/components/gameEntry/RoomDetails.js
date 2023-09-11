import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setPlayerInfo } from '../../reduxStore/gameSlice'
import { socket } from '../../backendServer'

function RoomDetails() {
  const notifications = useSelector(state=>state.game.notifications) 
  const mainPlayer = useSelector(state=>state.game.mainPlayer)
  const dispatch = useDispatch()

  const navigate = useNavigate()
 
  //protect route
  useEffect(()=>{
    if(mainPlayer.room.roomID==""){
      navigate('/tic_tac_toe/entry/room_id')
    }
    if(mainPlayer.room.inputType=="" ||  mainPlayer.room.roomRounds==""){
      navigate('/tic_tac_toe/entry/room_rounds')
    }
    if(mainPlayer.name==""){
      navigate('/tic_tac_toe/entry/player_info')
    }
    if(mainPlayer.playerState=="busy"){
      navigate(`/tic_tac_toe/dashboard/room/${mainPlayer.room.roomID}`)
    }
  },[])

  //close the room
  const handleCloseRoom = ()=>{
    const noteRequestOnMyRoom = notifications.filter(note =>{
      if(!note.room && !note.hasReacted){
        return note
      }
    })

    if(noteRequestOnMyRoom.length == 0){
      dispatch(setPlayerInfo({
        mainPlayer:{
          room :{
            inputType:'',
            roomID:"",
            roomRounds:3
          }
        }
      }))      
      socket.emit('close-room')
      navigate('/tic_tac_toe/entry/room_id')
    }else{
      alert(`There are ${noteRequestOnMyRoom.length} notifications related to this room
      so please refuse them first!, check your notifications`)
    } 
  }
 
  const handleSeePlayers = ()=>{
    navigate('/tic_tac_toe/entry/available_players')
  }
  
  //if the viewer is the main player (room owner) 
  return (
    <div className='room-details entry-room-id-page-cotent'>
      <div className='room-details-paragraphs-container'>
        <p className='room-details-paragraph'>Owner: 
        <span className='room-details-paragraph-value'>{mainPlayer.name}</span></p>
        <p className='room-details-paragraph'>Selected Player: 
        <span className='room-details-paragraph-value'>{mainPlayer.room.inputType}</span></p>
        <p className='room-details-paragraph'>Rounds: 
        <span className='room-details-paragraph-value'>{mainPlayer.room.roomRounds}</span></p>
        <p className='room-details-paragraph'>Room id:  
        <span className='room-details-paragraph-value'>{mainPlayer.room.roomID}</span></p>
      </div>
      <div className='room-details-buttons-group'>
        <button className='btn btn-cancel' 
        onClick={handleCloseRoom}>Close room</button>
        <button className='btn btn-second' 
        onClick={handleSeePlayers}>available players</button>
      </div>
    </div>
  )
}

export default RoomDetails
