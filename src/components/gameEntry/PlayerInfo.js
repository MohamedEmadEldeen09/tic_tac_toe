import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setPlayerInfo } from '../../reduxStore/gameSlice'
import { socket } from '../../backendServer'

function PlayerInfo() {
  const nameInput = useRef('')

  const mainPlayer = useSelector(state=>state.game.mainPlayer)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  //protect route
  useEffect(()=>{
    const playerDetails = JSON.parse(localStorage.getItem('ticTacGamePlayerDetails'))
    if(playerDetails){
      localStorage.clear()
    }

    if(mainPlayer.name != '' && mainPlayer.room.roomID !=""){
      navigate('/tic_tac_toe/entry/room_id')
    }else{     
      nameInput.current.value = mainPlayer.name
    }
  },[])

  useEffect(()=>{
    socket.on('get-user-socket-id' , (userID)=>{
      dispatch(setPlayerInfo({
        mainPlayer:{
          socketID:userID, 
        }
      }))
      navigate('/tic_tac_toe/entry/room_id')
    })   
  },[socket])

  const handleConnect = ()=>{
    if(!(/^[a-zA-Z]+$/gi).test(nameInput.current.value)){
      alert(`please inter a valid name!, only letters allowed without any
      special character or number`)
      nameInput.current.value = ""
      nameInput.current.focus()
      return
    }

    dispatch(setPlayerInfo({
      mainPlayer:{
        name : nameInput.current.value,
        playerState:"available"
      }
    }))
    
    socket.emit('user-info' , {
      name:nameInput.current.value,
      socketID:"",
      playerState:'available'
    })
  }

  return (
    <div className='player-info-page entry-card'>
      <div className=''>
        <label id='player-info-name' className='entry-label'>Name :</label>          
        <input type='text' className='entry-input' 
        placeholder='Your Name' id='player-info-name' 
        ref={nameInput} required/>
      </div>        
      
      <div className=''>
        <button onClick={handleConnect} className='btn'>
          Connect</button>           
      </div>
    </div>
  )
}

export default PlayerInfo
