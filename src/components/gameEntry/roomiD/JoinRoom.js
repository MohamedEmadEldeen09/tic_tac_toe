import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setPlayerInfo, setTargetNote, setWaiting } from '../../../reduxStore/gameSlice'
import { socket } from '../../../backendServer'
import { nanoid } from '@reduxjs/toolkit'
import {ThreeCircles } from 'react-loader-spinner'

function JoinRoom() {
  const roomName = useRef('')
  const navigate = useNavigate()
  const mainPlayer = useSelector(state=>state.game.mainPlayer)
  const waitingAccepting = useSelector(state=>state.game.waitingAccepting)
  const targetNote = useSelector(state=>state.game.targetNote)
  const dispatch = useDispatch()

  //protect route
  useEffect(()=>{
    if(mainPlayer.room.roomID != ""){
      navigate('/tic_tac_toe/entry/room_details')
    }        
  },[])
  
  useEffect(()=>{
    //if room is exist
    socket.on('room-exist-success' , (targetPlayerID)=>{
      const t = new Date(Date.now()) 
      const timeInSeconds = `${t.getSeconds()}`
      const message = `player "${mainPlayer.name}" wants to join your game room to play.`
    
      const note = {
        id:nanoid(16),
        from : mainPlayer.name,
        playerID:mainPlayer.socketID,
        timeInSeconds,
        message
      }

      socket.emit('play-request-note' , note , targetPlayerID)
      dispatch(setTargetNote({id:note.id , targetPlayerID}))
      dispatch(setWaiting('waiting for the other player.....!'))            
    })
    
    //if room not exist
    socket.on('room-exist-failed' , ()=>{
      alert('this room is not available now!.')
    })
    
    //refuse play request notification
    socket.on('refuse-play-request-note' , (playerID)=>{
      setWaiting('')     
    })
    
    //if the other player accept my join request
    socket.on('accept-sender-request-to-join-my-room' , (targetPlayer)=>{
      dispatch(setPlayerInfo({
        guestPlayer:{
          name : targetPlayer.name,
          socketID: targetPlayer.socketID,
          room:targetPlayer.room,
          playerState:"busy",
        },
        mainPlayer:{
          name:mainPlayer.name,
          socketID:mainPlayer.socketID,
          room:{
            roomID:targetPlayer.room.roomID,
            roomRounds:targetPlayer.room.roomRounds,
            inputType:targetPlayer.room.inputType == 'x'? 'o':'x'
          },
          playerState:"busy",
        },
        isThePlayerMainOrGuest:"guest",
      }))

      //<<mainPlayer.socketID?? here i emit an event to myself 
      //because i am the guest player 
      socket.emit('start-room' , targetPlayer.room.roomID, targetPlayer.socketID)

      navigate(`/tic_tac_toe/dashboard/room/${targetPlayer.room.roomID}/room_request_path` , {
        replace:true
      })
    })

    return(()=>{
      socket.off('refuse-play-request-note')
      socket.off('room-exist-success')
      socket.off('room-exist-failed')
    })
  },[socket])

  //handle join room process
  const handleJoinRoom = ()=>{   
    if(roomName.current.value == ""){
      alert('please inter a valid room name')
      return
    }
    socket.emit('check-if-room-exist' , roomName.current.value)
  }

  const handleGoToAvailableRooms = ()=>{
    navigate('/tic_tac_toe/entry/available_rooms')
  }
  
  const handleStopSearching = ()=>{
    dispatch(setWaiting(''))   
    socket.emit('cancel-join-request-note' ,targetNote[0])
  }

  if(waitingAccepting != ""){
   return (
    <div className='avalable-rooms'>
      <div className='wating-container'>
        <div style={{textAlign:'center'}}>
          <div className='icon-class icon-available'>
            <i className='bx bxs-tachometer'></i>
          </div>
          <p className='room-details-paragraph'>{waitingAccepting}</p>          
        </div>
        <div className='line-wave'>
        <ThreeCircles width='100' height='100'
          color='rgb(0, 255, 255)'/>
        </div>    
        <button className='btn btn-cancel' onClick={handleStopSearching}>cancel</button>       
      </div>
    </div>      
   )
  }

  return (
    <div className='entry-room-id-page entry-room-id-page-join'>
      <div className='entry-room-id-page-cotent'>
        <label id='join-room' className='entry-label'>Room Name : </label>          
        <input type='text' ref={roomName} className='entry-input' 
        placeholder='Enter Room ID' id='join-room'/>
        <button className='btn btn-second' onClick={handleJoinRoom}>Join Room</button>
      </div>
      
      <div className='entry-room-id-page-available'>
        <button className='btn btn-available' 
        onClick={handleGoToAvailableRooms}>online rooms</button>
      </div>     
    </div>
  )
}

export default JoinRoom
