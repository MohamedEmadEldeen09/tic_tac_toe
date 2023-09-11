import React, { useEffect , useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setPlayerInfo, setTargetNote, setWaiting } from '../../reduxStore/gameSlice'
import { socket } from '../../backendServer'
import { nanoid } from '@reduxjs/toolkit'
import {ThreeCircles } from 'react-loader-spinner'
import {toast} from 'react-toastify'

function AvailableRooms() {
  const [onlinePlayers , setOnlinePlayers] = useState([])
  const waitingAccepting = useSelector(state=>state.game.waitingAccepting)
  const targetNote = useSelector(state=>state.game.targetNote)
  const mainPlayer = useSelector(state=>state.game.mainPlayer)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  useEffect(()=>{
    if(mainPlayer.room.roomID != ""){
      navigate('/tic_tac_toe/entry/room_details')
    }
    if(mainPlayer.name == ""){
      navigate('/tic_tac_toe/entry/player_info')
    }
    socket.emit('get-all-rooms')
  },[])
  
  useEffect(()=>{
    socket.on('recieve-all-rooms' , (playersHowHaveRooms)=>{
      setOnlinePlayers(playersHowHaveRooms)
    })
    
    //when romm is busy and is not available any more
    socket.on('recieve-all-users' , (availablePlayers , rooms)=>{
      setOnlinePlayers(rooms)
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
      socket.emit('start-room' , targetPlayer.room.roomID, targetPlayer.socketID)

      navigate(`/tic_tac_toe/dashboard/room/${targetPlayer.room.roomID}/room_request_path`, {
        replace:true
      })
    })

    //refuse play request notification
    socket.on('refuse-play-request-note' , (playerID)=>{
      setWaiting('')
    })
    
    return(()=>{
      socket.off('refuse-play-request-note')
    })
  },[socket])

  const handleBack = ()=>{
    navigate('/tic_tac_toe/entry/room_id')
  }
  
  const handleJoinRoom = (e)=>{
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

    socket.emit('play-request-note' , note , e.target.id)              
    dispatch(setWaiting('waiting for the other player response.....!'))   
    dispatch(setTargetNote({id:note.id , targetPlayerID : e.target.id}))
  }

  const handleStopSearching = ()=>{
    dispatch(setWaiting(''))  
    socket.emit('cancel-join-request-note' ,targetNote[0])
  }
  
  if(onlinePlayers.length == 0){
    return (
      <div className='avalable-rooms entry-card'>
        <p>no rooms available</p>
        <article className='entry-article'>
          <button onClick={handleBack} className='btn back-btn'>Back</button>
        </article>
      </div>        
    )
  }

  if(waitingAccepting != ""){
    return (  
      <div className='avalable-rooms'>
        <div className='wating-container'>
           <div style={{textAlign:'center'}}>
              <div className='icon-class icon-available'>
                <i className='bx bxs-tachometer' ></i>
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
    <div className='avalable-rooms'>
      <div className='rooms-container'>
        {
          onlinePlayers.map((player)=>{
            return (
              <div className='avalable-room-div' key={`key_${player.socketID}`}>
                <div className='room-creator-player'>
                  <div className='icon-class icon-available'>
                    <i className='bx bxs-tachometer' ></i>
                  </div>
                  <p>{player.room.roomID}</p>
                </div>
                
                <div className='room-info-div'>
                  <div className='room-info-div-content'>
                    <p className='room-details-paragraph'>Owner: 
                    <span className='room-details-paragraph-value'>{player.name}</span></p>
                    <p className='room-details-paragraph'>Selected Player: 
                    <span className='room-details-paragraph-value'>{player.room.inputType}</span></p>
                    <p className='room-details-paragraph'>Rounds: 
                    <span className='room-details-paragraph-value'>{player.room.roomRounds}</span></p>
                    <p className='room-details-paragraph'>Room id:  
                    <span className='room-details-paragraph-value'>{player.room.roomID}</span></p> 
                  </div>  

                  <div className='room-info-join'>
                    <button onClick={handleJoinRoom}
                    id={player.socketID} className='btn btn-request'>Join</button> 
                  </div>                              
                </div>                   
              </div>
            )
          })
        }
      </div>             
      <div>
        <button onClick={handleBack} className='btn btn-back'>Back</button>
      </div>
    </div>
  )
}

export default AvailableRooms
