import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { socket } from '../../backendServer'
import { nanoid } from '@reduxjs/toolkit'
import { Rings} from 'react-loader-spinner'
import { setJoinsAndRequests } from '../../reduxStore/gameSlice'

function AvailablePlayers() {
  const [onlinePlayers , setOnlinePlayers] = useState([])
  const [requestSendedToSpecificPlayer , setSendedRequest] = useState([])

  const mainPlayer = useSelector(state=>state.game.mainPlayer)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  useEffect(()=>{
    //protect route
    if(mainPlayer.room.roomID == "" || mainPlayer.room.inputType == "" 
    || mainPlayer.name == ""){
      navigate('/tic_tac_toe/entry/room_id')
    }
    //
    socket.emit('get-all-users')  
  },[])

  useEffect(()=>{
    socket.on('recieve-all-users' , (availablePlayers , rooms)=>{
      setOnlinePlayers(availablePlayers)
    })
    
    socket.on('refuse-play-request-note' , (socketID)=>{
      setSendedRequest(requestSendedToSpecificPlayer.filter(playerID => playerID != socketID))
    })
  },[socket])

  const handlePlayRequest = (e)=>{
    const message = `player ${mainPlayer.name} wants you to join his game room to play.`
    const note = {
      id:nanoid(16),
      from : mainPlayer.name,
      playerID:mainPlayer.socketID,
      room:mainPlayer.room,
      message
    }
    const targetPlayerID = e.target.id

    dispatch(setJoinsAndRequests(targetPlayerID))
    
    socket.emit('play-request-note' , note , targetPlayerID)  
    
    setSendedRequest([...requestSendedToSpecificPlayer,targetPlayerID])
  }

  if(onlinePlayers.length == 0){
    return (      
    <div className='avalable-players entry-card'>
      no players available
    </div>     
    )
  }

  return (
      <div className='avalable-players'>
        {
          onlinePlayers?.map((player)=>{
            return (
              <div className='avalable-player-div' key={`key_${player.socketID}`}>
                <div className='room-creator-player'>
                  <div className='icon-class icon-available'>
                    <i className='bx bxs-user'></i>
                  </div>
                  <p>{player.name}</p>
                </div>
                <div>            
                  {
                    !requestSendedToSpecificPlayer.includes(player.socketID) ?
                    <button onClick={handlePlayRequest} 
                    id={player.socketID} 
                    className='btn btn-request'>request</button>
                     :
                    <h2>
                      <Rings color='rgb(0, 255, 255)' 
                      width='45' height='45'  radius="6"
                      ariaLabel="rings-loading"/>                      
                    </h2>
                  }                  
                </div>               
              </div>
            )
          })
        }
      </div>    
  )
}

export default AvailablePlayers
