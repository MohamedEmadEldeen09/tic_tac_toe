import React, {useEffect, useState , useRef} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {setResetGameLogicValues} from '../../reduxStore/gameSlice'
import { useNavigate } from 'react-router-dom'
import { socket } from '../../backendServer'
import { ThreeDots } from 'react-loader-spinner'

function changeRoomInfo({setPlayAgain , setGuestPlayerWantsToPlayAgain , setMainPlayerWantsToPlayAgain}) {
  const mainPlayer = useSelector(state=>state.game.mainPlayer)
  const guestPlayer = useSelector(state=>state.game.guestPlayer)
  const isThePlayerMainOrGuest = useSelector(state=>state.game.isThePlayerMainOrGuest)

  const [guestPlayerReadyToPlayAgain , setGuestPlayerReadyToPlayAgain] = useState(false)
  const mainPlayerReadyToPlayAgain = useRef('')

  const [roundsSelected , setRound] = useState(mainPlayer.room.roomRounds)
  const [playerTypeSelected , setPlayerType] = useState('')
  const [playerIdentitySelected , setPlayerIdentity] = useState(isThePlayerMainOrGuest)

  const dispatch = useDispatch() 
  const navigate = useNavigate()

  useEffect(()=>{   
    const xPlayer = document.getElementById('player-x-div')
    const oPlayer = document.getElementById('player-o-div')

    const mainIdentity = document.getElementById('switch-main-player')
    const guestIdentity = document.getElementById('switch-guest-player')

    if(mainPlayer.room.inputType == 'x'){
      xPlayer.style.boxShadow = '0 2px 10px rgb(98, 229, 46)'
      xPlayer.style.border = '3px solid rgb(98, 229, 46)'
      oPlayer.style.boxShadow = 'none'
      oPlayer.style.border = 'none'

      if(isThePlayerMainOrGuest == 'main'){
        mainIdentity.style.boxShadow = '0 2px 10px rgb(98, 229, 46)'
        mainIdentity.style.border = '3px solid rgb(98, 229, 46)'
        guestIdentity.style.boxShadow = 'none'
        guestIdentity.style.border = 'none'
      }
     
      if(isThePlayerMainOrGuest == 'guest'){
        guestIdentity.style.boxShadow = '0 2px 10px rgb(98, 229, 46)'
        guestIdentity.style.border = '3px solid rgb(98, 229, 46)'
        mainIdentity.style.boxShadow = 'none'
        mainIdentity.style.border = 'none'
      }
    }

    if(mainPlayer.room.inputType == 'o'){
      oPlayer.style.boxShadow = '0 2px 10px rgb(27, 169, 225)'
      oPlayer.style.border = '3px solid rgb(27, 169, 225)'
      xPlayer.style.boxShadow = 'none'
      xPlayer.style.border = 'none'  

      if(isThePlayerMainOrGuest == 'main'){
        mainIdentity.style.boxShadow = '0 2px 10px rgb(27, 169, 225)'
        mainIdentity.style.border = '3px solid rgb(27, 169, 225)'
        guestIdentity.style.boxShadow = 'none'
        guestIdentity.style.border = 'none'
      }
     
      if(isThePlayerMainOrGuest == 'guest'){
        guestIdentity.style.boxShadow = '0 2px 10px rgb(27, 169, 225)'
        guestIdentity.style.border = '3px solid rgb(27, 169, 225)'
        mainIdentity.style.boxShadow = 'none'
        mainIdentity.style.border = 'none'
      } 
    }    

    return (()=>{
      setPlayAgain(false)
      setGuestPlayerReadyToPlayAgain(false)
      setGuestPlayerWantsToPlayAgain(false)
      setMainPlayerWantsToPlayAgain(false)
      setPlayerType('')
      mainPlayerReadyToPlayAgain.current = null

      socket.off('change-rounds')
      socket.off('change-inputType')
      socket.off('switch-player')
      socket.off('player-ready-to-play-again')
      socket.off('player-not-ready-to-play-again')
    })
  },[])
  
  //socket changed
  useEffect(()=>{
    //room rounds changed
    socket.on('change-rounds' , (roomRounds)=>{
      setRound(roomRounds)
    })
    
    //inputType changed
    socket.on('change-inputType' , (selectedInputType)=>{
      const xPlayer = document.getElementById('player-x-div')
      const oPlayer = document.getElementById('player-o-div')

      const mainIdentity = document.getElementById('switch-main-player')
      const guestIdentity = document.getElementById('switch-guest-player')

      if(selectedInputType == 'x'){
        oPlayer.style.boxShadow = '0 2px 10px rgb(27, 169, 225)'
        oPlayer.style.border = '3px solid rgb(27, 169, 225)'
        xPlayer.style.boxShadow = 'none'
        xPlayer.style.border = 'none'  
        
        if(playerIdentitySelected == 'main' || (playerIdentitySelected == '' && isThePlayerMainOrGuest=='main')){
          mainIdentity.style.boxShadow = '0 2px 10px rgb(27, 169, 225)'
          mainIdentity.style.border = '3px solid rgb(27, 169, 225)'
          guestIdentity.style.boxShadow = 'none'
          guestIdentity.style.border = 'none'
        }
       
        if(playerIdentitySelected == 'guest'){
          guestIdentity.style.boxShadow = '0 2px 10px rgb(27, 169, 225)'
          guestIdentity.style.border = '3px solid rgb(27, 169, 225)'
          mainIdentity.style.boxShadow = 'none'
          mainIdentity.style.border = 'none'
        }

        setPlayerType('o')
      }
      if(selectedInputType == 'o'){
        xPlayer.style.boxShadow = '0 2px 10px rgb(98, 229, 46)'
        xPlayer.style.border = '3px solid rgb(98, 229, 46)' 
        oPlayer.style.boxShadow = 'none'
        oPlayer.style.border = 'none'
        
        if(playerIdentitySelected == 'main' || (playerIdentitySelected == '' && isThePlayerMainOrGuest=='main')){
          mainIdentity.style.boxShadow = '0 2px 10px rgb(98, 229, 46)'
          mainIdentity.style.border = '3px solid rgb(98, 229, 46)'
          guestIdentity.style.boxShadow = 'none'
          guestIdentity.style.border = 'none'
        }
       
        if(playerIdentitySelected == 'guest'){
          guestIdentity.style.boxShadow = '0 2px 10px rgb(98, 229, 46)'
          guestIdentity.style.border = '3px solid rgb(98, 229, 46)'
          mainIdentity.style.boxShadow = 'none'
          mainIdentity.style.border = 'none'
        }

        setPlayerType('x')
      }     
    })

    //switch player
    socket.on('switch-player' , (selectedIdentity , pts)=>{
      //pts == playerTypeSelected  for the other player
      const mainIdentity = document.getElementById('switch-main-player')
      const guestIdentity = document.getElementById('switch-guest-player')
  
      if(selectedIdentity == 'switch-main-player'){
        if(pts == 'o' || (playerTypeSelected == '' && mainPlayer.room.inputType=='o')){
          guestIdentity.style.boxShadow = '0 2px 10px rgb(98, 229, 46)'
          guestIdentity.style.border = '3px solid rgb(98, 229, 46)'
          mainIdentity.style.boxShadow = 'none'
          mainIdentity.style.border = 'none'
        }
  
        if(pts == 'x' || (playerTypeSelected == '' && mainPlayer.room.inputType=='x')){
          guestIdentity.style.boxShadow = '0 2px 10px rgb(27, 169, 225)'
          guestIdentity.style.border = '3px solid rgb(27, 169, 225)'
          mainIdentity.style.boxShadow = 'none'
          mainIdentity.style.border = 'none'
        }

        setPlayerIdentity('guest')
      }
      if(selectedIdentity == 'switch-guest-player'){
         if(pts == 'o' || (playerTypeSelected == '' && mainPlayer.room.inputType=='o')){
          mainIdentity.style.boxShadow = '0 2px 10px rgb(98, 229, 46)'
          mainIdentity.style.border = '3px solid rgb(98, 229, 46)'
          guestIdentity.style.boxShadow = 'none'
          guestIdentity.style.border = 'none'
        }

        if(pts == 'x' || (playerTypeSelected == '' && mainPlayer.room.inputType=='x')){
          mainIdentity.style.boxShadow = '0 2px 10px rgb(27, 169, 225)'
          mainIdentity.style.border = '3px solid rgb(27, 169, 225)'
          guestIdentity.style.boxShadow = 'none'
          guestIdentity.style.border = 'none'
        }

        setPlayerIdentity('main')
      }
    })

    //player ready process
    socket.on('player-ready-to-play-again' , (roomInfo)=>{     
      if(mainPlayerReadyToPlayAgain.current.value == 'player-ready'){   
        dispatch(setResetGameLogicValues({
          mainPlayer:{
            room:{
              inputType:roomInfo.playerTypeSelected == 'x' ?"o":'x',
              roomRounds:roomInfo.roundsSelected,
              roomID:mainPlayer.room.roomID
            }
          },
          guestPlayer:{
            room:{
              inputType:roomInfo.playerTypeSelected,
              roomRounds:roomInfo.roundsSelected,
              roomID:mainPlayer.room.roomID
            }
          },
          isThePlayerMainOrGuest:roomInfo.playerIdentitySelected == 'main' ? 'guest':'main'
        }))        
        navigate(`/tic_tac_toe/dashboard/room/${mainPlayer.room.roomID}/game_start_again`)        
      }else{
        setGuestPlayerReadyToPlayAgain(true)
      }
    })   
    
    socket.on('player-not-ready-to-play-again' , ()=>{
      setGuestPlayerReadyToPlayAgain(false)
    })
  },[socket])

  //select game rounds X or O
  const handleChangeRound = (e)=>{  
    setRound(e.target.value)
    socket.emit('change-rounds', e.target.value, guestPlayer.room.roomID)   
  }
  //

  //choose player type X or O
  const handleChoosePlayerType = (e)=>{
    if(isThePlayerMainOrGuest == 'guest') return    
     
    const xPlayer = document.getElementById('player-x-div')
    const oPlayer = document.getElementById('player-o-div')

    const mainIdentity = document.getElementById('switch-main-player')
    const guestIdentity = document.getElementById('switch-guest-player')

    if(e.target.id == 'player-x-div'){     
      xPlayer.style.boxShadow = '0 2px 10px rgb(98, 229, 46)'
      xPlayer.style.border = '3px solid rgb(98, 229, 46)'
      oPlayer.style.boxShadow = 'none'
      oPlayer.style.border = 'none'
      
      if(playerIdentitySelected == 'main' || (playerIdentitySelected == '' && isThePlayerMainOrGuest=='main')){
        mainIdentity.style.boxShadow = '0 2px 10px rgb(98, 229, 46)'
        mainIdentity.style.border = '3px solid rgb(98, 229, 46)'
        guestIdentity.style.boxShadow = 'none'
        guestIdentity.style.border = 'none'
      }
     
      if(playerIdentitySelected == 'guest'){
        guestIdentity.style.boxShadow = '0 2px 10px rgb(98, 229, 46)'
        guestIdentity.style.border = '3px solid rgb(98, 229, 46)'
        mainIdentity.style.boxShadow = 'none'
        mainIdentity.style.border = 'none'
      }
    }

    if(e.target.id == 'player-o-div'){
      oPlayer.style.boxShadow = '0 2px 10px rgb(27, 169, 225)'
      oPlayer.style.border = '3px solid rgb(27, 169, 225)'
      xPlayer.style.boxShadow = 'none'
      xPlayer.style.border = 'none'  

      if(playerIdentitySelected == 'main' || (playerIdentitySelected == '' && isThePlayerMainOrGuest=='main')){
        mainIdentity.style.boxShadow = '0 2px 10px rgb(27, 169, 225)'
        mainIdentity.style.border = '3px solid rgb(27, 169, 225)'
        guestIdentity.style.boxShadow = 'none'
        guestIdentity.style.border = 'none'
      }
     
      if(playerIdentitySelected == 'guest'){
        guestIdentity.style.boxShadow = '0 2px 10px rgb(27, 169, 225)'
        guestIdentity.style.border = '3px solid rgb(27, 169, 225)'
        mainIdentity.style.boxShadow = 'none'
        mainIdentity.style.border = 'none'
      }
    }
      
    setPlayerType(e.target.innerText)

    socket.emit('change-inputType', e.target.innerText , mainPlayer.room.roomID)
  }
  //
  
  //switch main to guest or guest to main
  const handleSwitchPlayer = (e)=>{
    if(isThePlayerMainOrGuest == 'guest') return

    const mainIdentity = document.getElementById('switch-main-player')
    const guestIdentity = document.getElementById('switch-guest-player')

    if(e.target.id == 'switch-main-player'){     
      if(playerTypeSelected == 'x' || (playerTypeSelected == '' && mainPlayer.room.inputType=='x')){
        mainIdentity.style.boxShadow = '0 2px 10px rgb(98, 229, 46)'
        mainIdentity.style.border = '3px solid rgb(98, 229, 46)'
        guestIdentity.style.boxShadow = 'none'
        guestIdentity.style.border = 'none'
      }

      if(playerTypeSelected == 'o' || (playerTypeSelected == '' && mainPlayer.room.inputType=='o')){
        mainIdentity.style.boxShadow = '0 2px 10px rgb(27, 169, 225)'
        mainIdentity.style.border = '3px solid rgb(27, 169, 225)'
        guestIdentity.style.boxShadow = 'none'
        guestIdentity.style.border = 'none'
      }

      setPlayerIdentity('main')
    }
    if(e.target.id == 'switch-guest-player'){
      if(playerTypeSelected == 'x' || (playerTypeSelected == '' && mainPlayer.room.inputType=='x')){
        guestIdentity.style.boxShadow = '0 2px 10px rgb(98, 229, 46)'
        guestIdentity.style.border = '3px solid rgb(98, 229, 46)'
        mainIdentity.style.boxShadow = 'none'
        mainIdentity.style.border = 'none'
      }

      if(playerTypeSelected == 'o' || (playerTypeSelected == '' && mainPlayer.room.inputType=='o')){
        guestIdentity.style.boxShadow = '0 2px 10px rgb(27, 169, 225)'
        guestIdentity.style.border = '3px solid rgb(27, 169, 225)'
        mainIdentity.style.boxShadow = 'none'
        mainIdentity.style.border = 'none'
      }

      setPlayerIdentity('guest')
    }   
       
    socket.emit('switch-player', e.target.id ,playerTypeSelected, mainPlayer.room.roomID)   
  }

  //start game agian
  const handleStartGameAgain = ()=>{
    if(mainPlayerReadyToPlayAgain.current.value == 'player-ready'){
      mainPlayerReadyToPlayAgain.current.classList.remove('btn-start')
      mainPlayerReadyToPlayAgain.current.innerText = 'ready'
      mainPlayerReadyToPlayAgain.current.value = 'player-not-ready'
      socket.emit('player-not-ready-to-play-again' , mainPlayer.room.roomID)
      return
    }        

    if(guestPlayerReadyToPlayAgain){  
      dispatch(setResetGameLogicValues({
        mainPlayer:{
          room:{
            inputType:playerTypeSelected!=''? playerTypeSelected:mainPlayer.room.inputType,
            roomRounds:roundsSelected,
            roomID:mainPlayer.room.roomID
          }
        },
        guestPlayer:{
          room:{
            inputType:playerTypeSelected !=''? playerTypeSelected == 'x' ?"o":'x' : guestPlayer.room.inputType,
            roomRounds:roundsSelected,
            roomID:mainPlayer.room.roomID
          }
        },
        isThePlayerMainOrGuest:playerIdentitySelected
      }))        
      socket.emit('player-ready-to-play-again' , mainPlayer.room.roomID,{
        playerTypeSelected:playerTypeSelected!=''? playerTypeSelected:mainPlayer.room.inputType,
        roundsSelected,
        playerIdentitySelected
      })
      navigate(`/tic_tac_toe/dashboard/room/${mainPlayer.room.roomID}/game_start_again`)     
    }else{   
      mainPlayerReadyToPlayAgain.current.classList.add('btn-start')
      mainPlayerReadyToPlayAgain.current.innerText = 'un ready'   
      mainPlayerReadyToPlayAgain.current.value = 'player-ready'
      socket.emit('player-ready-to-play-again' , mainPlayer.room.roomID)
    }  
  }
  //

  return ( 
    <div className='game-logic-container room-dashboard-card '>
      <div className='room-rounds entry-room-id-page-cotent full-width-div'> 
        {
          isThePlayerMainOrGuest=='guest' &&
          <article className='guest-player-note-change-room-info'>
            <h3 className='current-rounds-number'>note:</h3>
            <p>              
              the main player or the room owner who will just be able <br />
              to change setting and you will see the changes live <br />
              you can chat with him to inform him the changes you want.
            </p>
          </article>
        }   
        <article className=''>
          <label className='entry-label'>Select Game Rounds :</label>
          <select id='round-select' value={roundsSelected} 
            onChange={handleChangeRound} className='entry-input'
            disabled={isThePlayerMainOrGuest=='guest'}>
            <option value='3' defaultChecked={mainPlayer.room.roomRounds == '3'}>3</option>
            <option value='5' defaultChecked={mainPlayer.room.roomRounds == '5'}>5</option>
            <option value='7' defaultChecked={mainPlayer.room.roomRounds == '7'}>7</option>
          </select>
        </article>

        <article className=''>
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
    
        <article className=''>
          <p className='entry-label'>The main player plays first</p>  
          <div className='select-player-xo-container'>
            <div className='select-player-main-guest-div select-player-xo-div' 
              id='switch-main-player'
              onClick={handleSwitchPlayer}>Main</div>
              
              <div className='select-player-main-guest-div select-player-xo-div' 
              id='switch-guest-player'
              onClick={handleSwitchPlayer}>Guest</div>
          </div>    
        </article>
    
        <article className='play-again-controllers'>
          <div className='guest-player-response-to-play-again'>
          {
            guestPlayerReadyToPlayAgain == true ?
            <>
            <div className='icon-accept'>
              <i className='bx bx-user-check'></i>
            </div>
            <p>player is ready to play again.</p>           
            </>:
            <>
            <div className='controller-indicator'>
              <ThreeDots color='white' width='40' height='40'/>
            </div>               
            <p>please wait for the other player ready!</p>
            </>
          }   
          {
            mainPlayerReadyToPlayAgain.current.value == 'player-ready' &&
            <div className='guest-player-response-to-play-again'>
              <div className='icon-accept'>
                <i className='bx bx-user-check'></i>
              </div>
              <p>you ready!</p>
            </div>
          }
          </div> 

          <button className="btn" ref={mainPlayerReadyToPlayAgain} 
          id='btn-ready' value="player-not-ready" 
          onClick={handleStartGameAgain}>Ready</button>                 
        </article>
      </div>       
    </div> 
  )
}

export default changeRoomInfo