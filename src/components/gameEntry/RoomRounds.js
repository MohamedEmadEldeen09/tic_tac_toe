import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setPlayerInfo } from '../../reduxStore/gameSlice'
import { socket } from '../../backendServer'

function RoomRounds() {
  const [roundsSelected , setRound] = useState('3')
  const [playerTypeSelected , setPlayerType] = useState('x')

  const mainPlayer = useSelector(state=>state.game.mainPlayer)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  //protect route
  //this component will render if the player is the main player
  useEffect(()=>{
    if(mainPlayer.room.roomID == ""){
      navigate('/tic_tac_toe/entry/room_id')
    }
    if(mainPlayer.name == ""){
      navigate('/tic_tac_toe/entry/player_info')
    }
    if(mainPlayer.room.inputType != ""){
      navigate('/tic_tac_toe/entry/room_details/' + mainPlayer.room.roomID)
    }
  },[])

  //handle selected round
  const handleChangeRound = (e)=>{
    setRound(e.target.value)
  }

  //handle player input type
  const handleChoosePlayerType = (e)=>{
    const xPlayer = document.getElementById('player-x-div')
    const oPlayer = document.getElementById('player-o-div')

    if(e.target.id == 'player-x-div'){
      xPlayer.style.boxShadow = '0 2px 10px rgb(98, 229, 46)'
      xPlayer.style.border = '3px solid rgb(98, 229, 46)'

      oPlayer.style.boxShadow = 'none'
      oPlayer.style.border = 'none'
    }
    if(e.target.id == 'player-o-div'){
      oPlayer.style.boxShadow = '0 2px 10px rgb(27, 169, 225)'
      oPlayer.style.border = '3px solid rgb(27, 169, 225)'

      xPlayer.style.boxShadow = 'none'
      xPlayer.style.border = 'none'     
    }

    setPlayerType((e.target.innerText).toLowerCase())
  }

  //create button
  const handleNext = ()=>{
    dispatch(setPlayerInfo({
      mainPlayer:{
        room:{
          inputType:playerTypeSelected,
          roomRounds:roundsSelected,
          roomID:mainPlayer.room.roomID
        }
      },
    }))
    
    socket.emit('room-info' , {
      roomID: mainPlayer.room.roomID,
      inputType:playerTypeSelected,
      roomRounds:roundsSelected
    })

    navigate(`/tic_tac_toe/entry/room_details/${mainPlayer.room.roomID}`)
  }

  return (
    <div className='room-rounds entry-room-id-page-cotent'>
      <article className='entry-article'>
        <label className='entry-label'>Select Game Rounds :</label>
        <select id='round-select' value={roundsSelected} 
          onChange={handleChangeRound} className='entry-input'>
          <option value='3' defaultChecked>3</option>
          <option value='5'>5</option>
          <option value='7'>7</option>
        </select>
      </article>

      <article className='entry-article'>
        <label className='entry-label'>Choose Player</label>
        <div className='select-player-xo-container'>
          <div className='select-player-xo-div' 
          id='player-x-div'
          onClick={handleChoosePlayerType}>x</div>
          
          <div className='select-player-xo-div' 
          id='player-o-div'
          onClick={handleChoosePlayerType}>o</div>
        </div>             
      </article>

      <article className='entry-article'>
        <button  onClick={handleNext} className='btn btn-second'>
          Create</button>
      </article>
    </div>
  )
}

export default RoomRounds
