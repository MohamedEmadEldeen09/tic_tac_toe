import React, { useEffect, useRef } from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {setPlayerInfo} from '../../../reduxStore/gameSlice'
import {useNavigate} from 'react-router-dom'
import { socket } from '../../../backendServer'

function CreateRoom() {
  const roomName = useRef('')
  
  const mainPlayer = useSelector(state=>state.game.mainPlayer)
  const dispatsh = useDispatch()
  const navigate = useNavigate()
  
  //protect route
  useEffect(()=>{
    if(mainPlayer.room.roomID != ""){
      navigate('/tic_tac_toe/entry/room_details')
    }   
  },[])

  const handleCreateRoom = ()=>{
    if(roomName.current.value ==""){
      return
    }
        
    dispatsh(setPlayerInfo({
      mainPlayer:{
        room :{
          roomID:roomName.current.value,
          roomRounds:3,
          inputType:""
        } 
      },
      isThePlayerMainOrGuest:"main"
    }))

    socket.emit('room-info' , {
      roomID:roomName.current.value,
      roomRounds:3,
      inputType:""
    })
    
    navigate('/tic_tac_toe/entry/room_rounds')
  }

  return (
    <div className='entry-room-id-page'>
      <div className='entry-room-id-page-cotent'>
        <label id='join-room' className='entry-label'>Room Name : </label> 
        <input type='text' ref={roomName} className='entry-input' 
        placeholder='Enter Rooom ID' id=''/>
        <button className='btn btn-second' onClick={handleCreateRoom}>Create Room</button>
      </div>      
    </div>
  )
}

export default CreateRoom
