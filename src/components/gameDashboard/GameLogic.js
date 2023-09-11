import React, { useEffect , useState ,useRef} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setCurrentPlayer, setGameLogic, setGroundWinningTemplates, 
  setPlayerLeaved, 
  setSwitchPlayer, setUpdateGameLogicStates} from '../../reduxStore/gameSlice'
import ChangeRoomInfo from './ChangeRoomInfo'
import { socket } from '../../backendServer'
import { ThreeDots } from 'react-loader-spinner'

function GameLogic() {
  const [playAgain , setPlayAgain] = useState(false)
  const [gameFinish , setGameFinish] = useState(false)
  const [guestPlayerWantsToPlayAgain , setGuestPlayerWantsToPlayAgain] = useState(false)
  const [mainPlayerWantsToPlayAgain , setMainPlayerWantsToPlayAgain] = useState(false)

  const playerLeaved = useSelector(state=>state.game.playerLeaved)
  const currentPlayer = useSelector(state=>state.game.currentPlayer)
  const isThePlayerMainOrGuest = useSelector(state=>state.game.isThePlayerMainOrGuest)
  const mainPlayer = useSelector(state=>state.game.mainPlayer)
  const guestPlayer = useSelector(state=>state.game.guestPlayer)
  const gameState = useSelector(state=>state.game.gameState)
  const currentRound = useSelector(state=>state.game.currentRound)
  const mainPlayerScore = useSelector(state=>state.game.mainPlayerScore)
  const guestPlayerScore = useSelector(state=>state.game.guestPlayerScore)

  const dispatch = useDispatch() 
  
  //first render
  useEffect(()=>{
    if(isThePlayerMainOrGuest == 'main'){    
      dispatch(setCurrentPlayer({
        name:mainPlayer.name,
        inputType:mainPlayer.room.inputType
      }))       
    }       

    if(isThePlayerMainOrGuest == 'guest'){
      dispatch(setCurrentPlayer({
        name:guestPlayer.name,
        inputType:guestPlayer.room.inputType
      }))
    }    
  },[])
 
  //socket changed
  useEffect(()=>{   
    socket.on('send-playing-inputType' , ({place , inputType})=>{
      if(place && inputType){
        const targetBox = document.getElementById(place)
        if(inputType == 'x'){
          targetBox.style.color = 'rgb(98, 229, 46)'
        }
        if(inputType == 'o'){
          targetBox.style.color = 'rgb(27, 169, 225)'
        }
        targetBox.value = inputType
        targetBox.innerHTML = inputType         

        dispatch(setSwitchPlayer({place , inputType}))        
      }    
    })

    socket.on('update-game-logic',(states)=>{
     dispatch(setUpdateGameLogicStates(states))
    })

    //play again
    socket.on('player-wants-to-play-agian', (mainReady)=>{         
      if(mainReady == true){
        setPlayAgain(true)
      }else{
        setGuestPlayerWantsToPlayAgain(true)
      } 
    })

    //leave the game
    socket.on('leave-room' , ()=>{
      dispatch(setPlayerLeaved(true))
      socket.emit('second-player-leave-room' , mainPlayer.room.roomID)
    })
  },[socket])

  //currentRound changed
  useEffect(()=>{  
    const XObuttons = document.getElementsByClassName('xo-box')
    for (let i = 0; i < XObuttons.length; i++) {
      XObuttons[i].innerHTML = ''
      XObuttons[i].value = ''
    }

    if(isThePlayerMainOrGuest == 'main'){
      dispatch(setCurrentPlayer({
        name:mainPlayer.name,
        inputType:mainPlayer.room.inputType
      }))       
    }       

    if(isThePlayerMainOrGuest == 'guest'){
      dispatch(setCurrentPlayer({
        name:guestPlayer.name,
        inputType:guestPlayer.room.inputType
      }))
    }
  },[currentRound]) 
  
  //gameState changed
  useEffect(()=>{
    if(gameState.type == ''){   
      setGameFinish(false)      
    }
    if(gameState.type != ''){
      setGameFinish(true)    
    }
  },[gameState])

  //mainPlayerScore changed
  useEffect(()=>{
    socket.emit('update-game-logic' , {
      currentRound,
      gameState,
      mainPlayerScore,
      guestPlayerScore,
    }, mainPlayer.room.roomID)
  },[mainPlayerScore , currentRound])

  //hover effect
  const handleHoverEffect = (e)=>{
    if(currentPlayer.name == mainPlayer.name){
      if(e.target.value == ""){
        if(currentPlayer.inputType == 'x'){
          e.target.style.color = 'rgb(98, 229, 46)'
        }
        if(currentPlayer.inputType == 'o'){
          e.target.style.color = 'rgb(27, 169, 225)'
        }
        e.target.innerHTML = currentPlayer.inputType
      }  
    }   
  }
    
  //leave effect
  const handleLeaveEffect = (e)=>{
    if(currentPlayer.name == mainPlayer.name){
      if(e.target.value == ""){
        e.target.innerHTML = ''
      }  
    }
  }
    
  //inter x o input
  const handlePlayerInput = (e)=>{
    if(e.target.value !=""){
      return
    }
    
    if(currentPlayer.name != mainPlayer.name){
      return
    }
    
    if(currentPlayer.inputType == 'x'){
      e.target.style.color = 'rgb(98, 229, 46)'
    }
    if(currentPlayer.inputType == 'o'){
      e.target.style.color = 'rgb(27, 169, 225)'
    }
 
    e.target.value = currentPlayer.inputType
    e.target.innerHTML = currentPlayer.inputType     

    dispatch(setGroundWinningTemplates({
      place :e.target.id,
      inputType:e.target.value
    }))

    socket.emit('send-playing-inputType',{
      place : e.target.id,
      inputType:currentPlayer.inputType
    }, mainPlayer.room.roomID)   
    
    dispatch(setGameLogic())
  }
  
  //player wants to play again
  const handlePlayAgain =()=>{  
    if(guestPlayerWantsToPlayAgain){
      setPlayAgain(true)    
      socket.emit('player-wants-to-play-agian' , mainPlayer.room.roomID , true)      
      return              
    }

    setMainPlayerWantsToPlayAgain(true)
    socket.emit('player-wants-to-play-agian' , mainPlayer.room.roomID , false)
  }   
  
  //player wants to leave the game 
  const handleLeaveGame = ()=>{
    //close the room
    dispatch(setPlayerLeaved(true))
    socket.emit('leave-room' , mainPlayer.room.roomID , guestPlayer.socketID)   
  }

  //in case of winning or draw when Room Rounds reach to the end
  if(gameFinish){
    return(
      <>
        {
          !playAgain &&
          <div className='game-logic-container room-dashboard-card'> 
            <div className='play-again-div'>
              <div className='game-results-info'>                
                <div className='win-lose-anounce-div'>
                  {
                    mainPlayerScore > guestPlayerScore &&
                    <>
                    <div className='winner-loser-tag'>
                      {
                        mainPlayer.room.inputType =='x'?
                        <p className='player-score player-x-color'>                       
                          {mainPlayer.room.inputType}
                        </p>:
                        <p className='player-score player-o-color'>                         
                          {mainPlayer.room.inputType}
                        </p> 
                      }
                      
                      <span className="material-symbols-outlined icon-trophy">trophy</span>      
                    </div>              

                    <p className='player-win-message'>Congratulation 
                     <span className='winner-loser-player-name'>{mainPlayer.name}</span></p>                                          
                    <p className='player-win-message'>you win!</p>
                    </>
                  }

                  {
                    mainPlayerScore < guestPlayerScore &&
                    <>
                    <div className='winner-loser-tag'>
                      {
                        mainPlayer.room.inputType =='x'?
                        <p className='player-score player-x-color'>                       
                          {mainPlayer.room.inputType}
                        </p>:
                        <p className='player-score player-o-color'>                         
                          {mainPlayer.room.inputType}
                        </p> 
                      } 
                      <span className="material-symbols-outlined icon-trophy icon-trophy-lose">sentiment_dissatisfied</span>                    </div>              

                    <p className='player-win-message'>Good Luck 
                      <span className='winner-loser-player-name'>{mainPlayer.name}</span></p>                                          
                    <p className='player-win-message'>you lose!</p>
                    </>
                  }

                  {
                    mainPlayerScore == guestPlayerScore &&
                    <>
                    <div className='winner-loser-tag'>
                      {
                        mainPlayer.room.inputType =='x'?
                        <p className='player-score player-x-color'>                       
                          {mainPlayer.room.inputType}
                        </p>:
                        <p className='player-score player-o-color'>                         
                          {mainPlayer.room.inputType}
                        </p> 
                      } 
                      <span class="material-symbols-outlined icon-trophy icon-trophy-draw">equal</span>      
                      {
                        guestPlayer.room.inputType =='x'?
                        <p className='player-score player-x-color'>                       
                          {guestPlayer.room.inputType}
                        </p>:
                        <p className='player-score player-o-color'>                         
                          {guestPlayer.room.inputType}
                        </p> 
                      }                 
                    </div>              
                    <p className='player-win-message'>Draw !
                    <span className='winner-loser-player-name'></span></p>                                          
                    <p className='player-win-message'></p>
                    </>
                  }                 
                </div>

                <div className='game-results-info-details'>
                  {
                    mainPlayer.room.inputType=='x'?
                    <>
                      <p className='winner-loser-player-name'>{mainPlayer.name} : 
                       <span className='player-score player-x-color'>{mainPlayerScore}</span>
                      </p> 
                      <p className='winner-loser-player-name'>{guestPlayer.name} : 
                       <span className='player-score player-o-color'>{guestPlayerScore}</span>
                      </p>           
                    </>
                    :
                    <>
                      <p className='winner-loser-player-name'>{mainPlayer.name} : 
                      <span className='player-score player-o-color'>{mainPlayerScore}</span>
                      </p> 
                      <p className='winner-loser-player-name'>{guestPlayer.name} : 
                       <span className='player-score player-x-color'>{guestPlayerScore}</span>
                      </p> 
                    </>
                  }                                    
                </div>     
              </div>

              <div className='play-again-controllers'>                         
                <div className='guest-player-response-to-play-again'>
                {
                  guestPlayerWantsToPlayAgain ?
                  <>
                  <div className='icon-accept'>
                    <i className='bx bx-user-check'></i>
                  </div>
                  <p>player ready to play again.</p>
                  </>:
                  <>
                  <div className='controller-indicator'>
                    <ThreeDots color='white' width='40' height='40'/>
                  </div>               
                  <p>please wait for the other player decision!</p>
                  </>
                }                
                </div>

               {
                mainPlayerWantsToPlayAgain == true ?
                <div className='guest-player-response-to-play-again'>               
                  <div className='icon-accept'>
                    <i className='bx bx-user-check'></i>
                  </div>
                  <p>you ready!</p>
                </div>
                :                
                <button id='btn-play-again'  
                name='guest-player' value="waiting"
                className='btn'
                onClick={handlePlayAgain} disabled={playerLeaved}>play again</button>                                           
              }
              </div>           
            </div>

          <div className='game-process-game-leave'>
            <button className='btn btn-refuse' onClick={handleLeaveGame}>Leave</button>
          </div>           
        </div>
        }     

        {
          playAgain &&
          <>
            <ChangeRoomInfo setPlayAgain={setPlayAgain} 
            setGuestPlayerWantsToPlayAgain={setGuestPlayerWantsToPlayAgain} 
            setMainPlayerWantsToPlayAgain={setMainPlayerWantsToPlayAgain} 
            socket={socket}/>              
          </>
        }
      </>
    )
  }

  return (
    <>
      <main className='game-logic-container room-dashboard-card'>
        <div className='game-process-game-rounds'>        
          <p>Round</p>
          <h3 className='game-process-game-rounds-current-round'>
           <span className='current-rounds-number'>{currentRound}</span>
          <span className='score-sign'>/</span>
           <span className='game-rounds-number'>{mainPlayer.room.roomRounds}</span>
          </h3>
        </div>

        <div className='game-process-game-players'>
          {
            mainPlayer.room.inputType=='x'?
          <>
            <div className='player-info player-x-box-shadow' id='main-player'>
              <h3 className='main-player-name'>{mainPlayer.name}</h3>
              <h3 className='main-player-inputType player-score player-x-color' 
              id='player-type-main'>{mainPlayer.room.inputType}</h3>

              {
                currentPlayer.name == mainPlayer.name ?
                <div className='main-player-waiting'>
                  <ThreeDots color='white' width='35' height='35'/>                  
                </div>:
                <div className='hiding-waiting-indicator'>hidden text</div> 
              }
            </div>

            <div className='players-current-game-result'>
              <p className='player-score'>
              <span className='player-score player-x-color' id='player-score-main'>
                {mainPlayerScore}</span>
              <span className='score-sign'>:</span>
              <span className='player-score player-o-color' id='player-score-guest'>
                {guestPlayerScore}</span>
              </p>
            </div>

            <div className='player-info player-o-box-shadow' id='guest-player'>
              <h3 className='guest-player-name'>{guestPlayer.name}</h3>
              <h3 className='guest-player-inputType player-score player-o-color' 
              id='player-type-guest'>{guestPlayer.room.inputType}</h3>
              {
                currentPlayer.name == guestPlayer.name ? 
                <div className='guest-player-waiting'>
                  <ThreeDots color='white' width='35' height='35'/>
                </div>:
                <div className='hiding-waiting-indicator'>hidden text</div>    
              }                                  
            </div>
          </>
          :
          <>
            <div className='player-info player-o-box-shadow' id='main-player'>
              <h3 className='main-player-name'>{mainPlayer.name}</h3>
              <h3 className='main-player-inputType player-score player-o-color' 
              id='player-type-main'>{mainPlayer.room.inputType}</h3>

              {
                currentPlayer.name == mainPlayer.name ?
                <div className='main-player-waiting'>
                  <ThreeDots color='white' width='35' height='35'/>                  
                </div>:
                <div className='hiding-waiting-indicator'>hidden text</div> 
              }
            </div>

            <div className='players-current-game-result'>
              <p className='player-score'>
              <span className='player-score player-o-color' id='player-score-main'>
                {mainPlayerScore}</span>
              <span className='score-sign'>:</span>
              <span className='player-score player-x-color' id='player-score-guest'>
                {guestPlayerScore}</span>
              </p>
            </div>

            <div className='player-info player-x-box-shadow' id='guest-player'>
              <h3 className='guest-player-name'>{guestPlayer.name}</h3>
              <h3 className='guest-player-inputType player-score player-x-color' 
              id='player-type-guest'>{guestPlayer.room.inputType}</h3>
              {
                currentPlayer.name == guestPlayer.name ? 
                <div className='guest-player-waiting'>
                  <ThreeDots color='white' width='35' height='35'/>
                </div>:
                <div className='hiding-waiting-indicator'>hidden text</div>    
              }                                  
            </div>
          </>
          }        
        </div>

        <div className='game-process-game-logic'>
          <button id='box-1' value='' onMouseOver={handleHoverEffect}  
          onClick={handlePlayerInput} onMouseLeave={handleLeaveEffect}       
          className='xo-box'></button>     

          <button id='box-2' value='' onMouseOver={handleHoverEffect}
          onClick={handlePlayerInput}  onMouseLeave={handleLeaveEffect}
          className='xo-box'></button>    

          <button id='box-3' value='' 
          onMouseLeave={handleLeaveEffect} onMouseOver={handleHoverEffect}
          onClick={handlePlayerInput} 
          className='xo-box'></button>

          <button id='box-4' value='' onMouseOver={handleHoverEffect} 
          onClick={handlePlayerInput} onMouseLeave={handleLeaveEffect}
          className='xo-box'></button>

          <button id='box-5' value='' onMouseLeave={handleLeaveEffect}
          onMouseOver={handleHoverEffect} 
          onClick={handlePlayerInput} 
          className='xo-box'></button>

          <button id='box-6' value='' onMouseLeave={handleLeaveEffect}
          onMouseOver={handleHoverEffect} 
          onClick={handlePlayerInput} 
          className='xo-box'></button>

          <button id='box-7' value='' onMouseLeave={handleLeaveEffect}
          onMouseOver={handleHoverEffect} 
          onClick={handlePlayerInput} 
          className='xo-box'></button>

          <button id='box-8' value='' onMouseLeave={handleLeaveEffect}
          onMouseOver={handleHoverEffect} 
          onClick={handlePlayerInput} 
          className='xo-box'></button>

          <button id='box-9' value='' onMouseLeave={handleLeaveEffect}
          onMouseOver={handleHoverEffect} 
          onClick={handlePlayerInput} 
          className='xo-box'></button>
        </div>
      </main>

      <div className='game-process-game-leave'>
        <button className='btn btn-refuse' onClick={handleLeaveGame}>Leave</button>
      </div>
    </>
  )
}

export default GameLogic