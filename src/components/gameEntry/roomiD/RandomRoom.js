import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setPlayerInfo } from '../../../reduxStore/gameSlice'
import { socket } from '../../../backendServer'
import { Radio } from 'react-loader-spinner'

function RandomRoom() {  
  const [searchingRunning , setSearchingRunning] = useState(false)
  const mainPlayer = useSelector(state=>state.game.mainPlayer)

  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  useEffect(()=>{ 
   return(()=>{
    if(mainPlayer.name != ""){
      socket.emit('random-room-stop-search-for-player',mainPlayer.socketID)
    }
   })
  },[])

  useEffect(()=>{
    socket.on('random-room-second-player-found' , (randomPlayer , randomRoomID)=>{
      dispatch(setPlayerInfo({
        mainPlayer:{
          name:mainPlayer.name,
          socketID:mainPlayer.socketID,
          room :{
            roomID:randomRoomID,
            roomRounds:3,
            inputType:'x'
          },
          playerState:"busy"
        },
        guestPlayer:{
          name:randomPlayer.name,
          socketID:randomPlayer.socketID,
          playerState:"busy",
          room : {
            roomID:randomRoomID,
            roomRounds:3,
            inputType:'o'
          }
        },
        isThePlayerMainOrGuest:"main",
      }))

      socket.emit('random-room-start-room',mainPlayer,randomRoomID)
        
      navigate(`/tic_tac_toe/dashboard/room/${randomRoomID}/random_request_path`, {
        replace:true
      })
    })

    socket.on('random-player-started-room' , (randomRoomID , randomPlayer)=>{
      dispatch(setPlayerInfo({
          mainPlayer:{
            name:mainPlayer.name,
            socketID:mainPlayer.socketID,
            room :{
              roomID:randomRoomID,
              roomRounds:3,
              inputType:'o'
            },
            playerState:"busy"
          },
          guestPlayer:{
            name:randomPlayer.name,
            socketID:randomPlayer.socketID,
            playerState:"busy",
            room : {
              roomID:randomRoomID,
              roomRounds:3,
              inputType:'x'
            }
          },
          isThePlayerMainOrGuest:"guest",
      }))

      navigate(`/tic_tac_toe/dashboard/room/${randomRoomID}/random_request_path`, {
        replace:true
      })
    })
  },[socket])

  const handleSearchAndStartRandomRoom = ()=>{  
   setSearchingRunning(true)    
   socket.emit('random-room-search-for-player', mainPlayer)
  }
  
  const handleStopSearching = ()=>{
   setSearchingRunning(false)
   socket.emit('random-room-stop-search-for-player')
  }

  return (
    <div className='entry-room-id-page'>
      <div className='entry-room-id-page-cotent entry-room-id-page-cotent-random'>             
          {
            searchingRunning ?
            <Radio colors={['rgb(0, 255, 255)' , 'rgb(0, 255, 255)']}
            width='80px' height='80px'/>:
            <button id='btn-search-for-player' 
            className='btn btn-second'
            disabled={searchingRunning} 
            onClick={handleSearchAndStartRandomRoom}>
             search for player   
            </button>
          }    
         
        {
          searchingRunning &&
          <button className='btn btn-cancel' onClick={handleStopSearching}>cancel</button>
        }
      </div>
    </div>
  )
}

export default RandomRoom