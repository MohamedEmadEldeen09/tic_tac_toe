import { createSlice } from "@reduxjs/toolkit"
import { resetXOInputs } from "../helpers/resetXOInputs"

const initState = {
  mainPlayer:{
    name:"",
    socketID:"", 
    playerState:"available", 
    room:{
      inputType:'',
      roomID:"",
      roomRounds:3
    }
  },

  guestPlayer:{
    name:"",
    socketID:"",  
    playerState:"available", 
    room:{
      inputType:'',
      roomID:"",
      roomRounds:3
    }
  },

  isThePlayerMainOrGuest:'',

  notifications:[],
  joinsAndRequests:[],
  targetNote:[],
  waitingAccepting:'',

  currentPlayer:{
    name:"",
    inputType:''
  },
  currentRound:1,
  mainPlayerScore:0,
  guestPlayerScore:0,

  gameState:{
    type:"",
    message:""
  },

  groundWinningTemplates:[
    [
      {
          name:'box-1',
          inputType:'',
      },
      {
          name:'box-2',
          inputType:'',
      },
      {
          name:'box-3',
          inputType:'',
      }
    ],
    [
        {
            name:'box-4',
            inputType:'',
        },
        {
            name:'box-5',
            inputType:'',
        },
        {
            name:'box-6',
            inputType:'',
        }
    ],
    [
        {
            name:'box-7',
            inputType:'',
        },
        {
            name:'box-8',
            inputType:'',
        },
        {
            name:'box-9',
            inputType:'',
        }
    ],

    [
        {
            name:'box-1',
            inputType:'',
        },
        {
            name:'box-4',
            inputType:'',
        },
        {
            name:'box-7',
            inputType:'',
        }
    ],
    [
        {
            name:'box-2',
            inputType:'',
        },
        {
            name:'box-5',
            inputType:'',
        },
        {
            name:'box-8',
            inputType:'',
        }
    ],
    [
        {
            name:'box-3',
            inputType:'',
        },
        {
            name:'box-6',
            inputType:'',
        },
        {
            name:'box-9',
            inputType:'',
        }
    ],

    [
        {
            name:'box-1',
            inputType:'',
        },
        {
            name:'box-5',
            inputType:'',
        },
        {
            name:'box-9',
            inputType:'',
        }
    ],
    [
        {
            name:'box-7',
            inputType:'',
        },
        {
            name:'box-5',
            inputType:'',
        },
        {
            name:'box-3',
            inputType:'',
        }
    ]
  ],

  messagesTextStore:[{
      from:'main',
      message:`hello guest player`,
      time:'00:00:00'
    },{  
      from:'guest',
      message:`hello main player`,
      time:'00:00:00'
    }
  ],

  playerLeaved:false
}

const gameReducer = createSlice({
  name:"tic_toc_game",
  initialState:initState,
  reducers:{
    setPlayerInfo:(state , action)=>{
      //mainPlayer
      if(action.payload.mainPlayer?.name){
        state.mainPlayer.name = action.payload.mainPlayer.name
      }
      if(action.payload.mainPlayer?.socketID){
        state.mainPlayer.socketID = action.payload.mainPlayer.socketID
      }
      if(action.payload.mainPlayer?.room){
        state.mainPlayer.room = action.payload.mainPlayer.room
      }
      if(action.payload.mainPlayer?.playerState){
        state.mainPlayer.playerState = action.payload.mainPlayer.playerState
      }

      //guestPlayer
      if(action.payload.guestPlayer?.name){
        state.guestPlayer.name = action.payload.guestPlayer.name
      }
      if(action.payload.guestPlayer?.socketID){
        state.guestPlayer.socketID = action.payload.guestPlayer.socketID
      }
      if(action.payload.guestPlayer?.room){
        state.guestPlayer.room = action.payload.guestPlayer.room
      }
      if(action.payload.guestPlayer?.playerState){
        state.guestPlayer.playerState = action.payload.guestPlayer.playerState
      }

      //isThePlayerMainOrGuest
      if(action.payload.isThePlayerMainOrGuest){
        state.isThePlayerMainOrGuest = action.payload.isThePlayerMainOrGuest
      }
      
      //gameState
      if(action.payload.gameState){
        state.gameState = action.payload
      }
      
      //notifications that saved in local storage after leaves room
      if(action.payload.notifications){
        state.notifications =[...action.payload.notifications] 
      }
    },
   
    //notifications
    setNotifications:(state , action)=>{
      const {playerID , timeInSeconds} = action.payload  
      const targetNote = state.notifications.filter(note =>{
        if(note.playerID == playerID){
          if(note.timeInSeconds != undefined && note.timeInSeconds == timeInSeconds){
            return note
          }
        }
      })

      if(targetNote.length == 0){
        if(action.payload.from != "" && action.payload.playerID != "" ){
          state.notifications = [...state.notifications , action.payload ]
        }  
      }          
    },
    setHasReacted:(state , action)=>{
      const targetNoteID = action.payload
      const newResetNotifications = state.notifications.map((note)=>{
        if((note.playerID == targetNoteID || note.id == targetNoteID) && !note.hasReacted){
          note.hasReacted = true
        }
        return note
      })
      state.notifications = newResetNotifications
    },
    
    setWaiting:(state , action)=>{
      state.waitingAccepting = action.payload
    },

    //when i send join request to specefic room and i wait but also i can cancel
    //the request
    setTargetNote:(state , action)=>{
      state.targetNote = [action.payload]
    },

    //when player return back to the menue after close game
    setAllHasReacted:(state , action)=>{
      const newResetNotifications = state.notifications.map((note)=>{
        note.hasReacted = true
        return note
      })
      state.notifications = newResetNotifications
    },
    
    //joinsAndRequests
    setJoinsAndRequests:(state , action)=>{
      state.joinsAndRequests = [...state.joinsAndRequests , action.payload]
    },
    //chat
    setMessagesTextStore:(state , action)=>{
      state.messagesTextStore = [...state.messagesTextStore , action.payload ]
    },
    
    //game logic
    setCurrentPlayer:(state , action)=>{     
      state.currentPlayer = action.payload
    },
    setCurrentRound:(state , action)=>{
      state.currentPlayer = state.currentPlayer + 1
    },
    setGameState:(state , action)=>{
      state.gameState = ""
    },
    setGameLogic:(state , action)=>{
      let drawCount = 0
      state.groundWinningTemplates.forEach((template)=>{
        let tempArrayToCheckWinning = []
        template.forEach((item)=>{
          if(item.inputType != ''){
            tempArrayToCheckWinning.push(item.inputType) 
            drawCount+=1
          }                 
        })
        
        //
        if(tempArrayToCheckWinning.length == 3 && 
          tempArrayToCheckWinning[0]== tempArrayToCheckWinning[1] &&
          tempArrayToCheckWinning[0]== tempArrayToCheckWinning[2] )
        {     
          //
          if(state.currentPlayer.name == state.mainPlayer.name){
            state.mainPlayerScore += 1
          }
          if(state.currentPlayer.name == state.guestPlayer.name){
            state.guestPlayerScore += 1
          }
          state.currentRound += 1
          //                       

          //if score for example were 2/0 and there is only one round left 
          //that means the player with score 2 wins
          if(state.currentRound == state.mainPlayer.room.roomRounds){
            if(state.mainPlayerScore == state.guestPlayerScore + 2 || state.guestPlayerScore == state.mainPlayerScore + 2){
              state.gameState.type = 'winning'

              //reset
              state.currentRound =1          
              state.currentPlayer.name=""
              state.currentPlayer.inputType=""
              state.groundWinningTemplates = resetXOInputs(state.groundWinningTemplates)
              //    
              return 
            }       
          }
          //
          
          if(state.currentRound > state.mainPlayer.room.roomRounds){         
            if(state.mainPlayerScore > state.guestPlayerScore){
              state.gameState.type = 'winning'
              state.gameState.message = 
              `Congratulation ${state.mainPlayer.name}, you win!`
            }
            if(state.mainPlayerScore < state.guestPlayerScore){
              state.gameState.type = 'winning'
              state.gameState.message = 
              `Congratulation ${state.guestPlayer.name}, you win!`
            }
            if(state.mainPlayerScore == state.guestPlayerScore){
              state.gameState.type = 'draw'
              state.gameState.message = 'Draw!'
            }    
            
            //reset
            state.currentRound =1          
            state.currentPlayer.name=""
            state.currentPlayer.inputType=""
            state.groundWinningTemplates = resetXOInputs(state.groundWinningTemplates)
            //    
            return          
          }
          //
                  
          state.groundWinningTemplates = resetXOInputs(state.groundWinningTemplates)                 
          return
        }
      })
      
      //if draw
      if(drawCount == 24){
        state.currentRound += 1
        if(state.currentRound > state.mainPlayer.room.roomRounds){
          if(state.mainPlayerScore > state.guestPlayerScore){
            state.gameState.type = 'winning'
            state.gameState.message = 
            `Congratulation ${state.mainPlayer.name}, you win!`
          }
          if(state.mainPlayerScore < state.guestPlayerScore){
            state.gameState.type = 'winning'
            state.gameState.message = 
            `Congratulation ${state.guestPlayer.name}, you win!`
          }
          if(state.mainPlayerScore == state.guestPlayerScore){
            state.gameState.type = 'draw'
            state.gameState.message = 'Draw!'
          }  

          //reset
          state.currentRound =1
          state.currentPlayer.name=""
          state.currentPlayer.inputType=""
          state.groundWinningTemplates = resetXOInputs(state.groundWinningTemplates)
          //   
          return    
        }

        state.groundWinningTemplates = resetXOInputs(state.groundWinningTemplates)
        return           
      }

      //switch to the other player
      if(state.currentPlayer.name == state.mainPlayer.name){
        state.currentPlayer.name = state.guestPlayer.name
        state.currentPlayer.inputType = state.guestPlayer.room.inputType
      }else{
        state.currentPlayer.name = state.mainPlayer.name
        state.currentPlayer.inputType = state.mainPlayer.room.inputType
      }        
    },
    setSwitchPlayer :(state , action)=>{
      //first the changes must save in the guest player groundWinningTemplates 
      //array as well.
      const {place , inputType} = action.payload
      const afterSaveChanges = state.groundWinningTemplates.map((t)=>{
        return t.map((i)=>{
          if(i.name == place){
            i.inputType = inputType
          }
          return i
        })
      })
      state.groundWinningTemplates = [...afterSaveChanges] 
      //

      //switch to the other player
      if(state.currentRound <= state.mainPlayer.room.roomRounds){
        if(state.currentPlayer.name == state.mainPlayer.name){
          state.currentPlayer.name = state.guestPlayer.name
          state.currentPlayer.inputType = state.guestPlayer.room.inputType
        }else{
          state.currentPlayer.name = state.mainPlayer.name
          state.currentPlayer.inputType = state.mainPlayer.room.inputType
        }
      }        
    },
    //save input x-o changes
    setGroundWinningTemplates:(state , action)=>{
      const {place , inputType} = action.payload
      const afterSaveChanges = state.groundWinningTemplates.map((t)=>{
        return t.map((i)=>{
          if(i.name == place){
            i.inputType = inputType
          }
          return i
        })
      })
      state.groundWinningTemplates = [...afterSaveChanges] 
      //
    },
    //update states in order to inform the guest player with the 
    //updated states in the game
    setUpdateGameLogicStates:(state , action)=>{
      if(action.payload.currentRound){
        state.currentRound = action.payload.currentRound
      }
      if(action.payload.gameState){
        state.gameState = action.payload.gameState
      }
      if(action.payload.mainPlayerScore){
        state.guestPlayerScore = action.payload.mainPlayerScore
      }
      if(action.payload.guestPlayerScore){
        state.mainPlayerScore = action.payload.guestPlayerScore
      }
      state.groundWinningTemplates = resetXOInputs(state.groundWinningTemplates)
    },
    
    //reset game logic values when game start again
    setResetGameLogicValues:(state , action)=>{
      const {mainPlayer , guestPlayer , isThePlayerMainOrGuest} = action.payload
      state.mainPlayer.room = mainPlayer.room
      state.guestPlayer.room = guestPlayer.room           

      if(isThePlayerMainOrGuest == 'main'){
        state.currentPlayer.name = state.mainPlayer.name
        state.currentPlayer.inputType = mainPlayer.room.inputType
      }
      if(isThePlayerMainOrGuest == 'guest'){
        state.currentPlayer.name = state.guestPlayer.name
        state.currentPlayer.inputType = guestPlayer.room.inputType
      }     

      state.isThePlayerMainOrGuest = isThePlayerMainOrGuest
      state.currentRound = 1
      state.mainPlayerScore = 0
      state.guestPlayerScore = 0
      state.groundWinningTemplates = resetXOInputs(state.groundWinningTemplates)
      state.gameState.message = ''
      state.gameState.type = ''
    },

    //playre leaved the game
    setPlayerLeaved:(state , action)=>{
      state.playerLeaved = action.payload
    },

    //reset all values
    //in case of player finished or queit the game room 
    setResetAllValuesToDefault:(state , action)=>{
      state.mainPlayer.playerState = 'available'
      state.mainPlayer.room.roomRounds = 3
      state.mainPlayer.room.inputType = ''
      state.mainPlayer.room.roomID = ''

      state.guestPlayer.name = ''
      state.guestPlayer.socketID = ''
      state.guestPlayer.playerState = 'available'
      state.guestPlayer.room.roomRounds = 3
      state.guestPlayer.room.inputType = ''
      state.guestPlayer.room.roomID = ''
      
      state.currentRound = 1
      state.mainPlayerScore = 0
      state.guestPlayerScore = 0
      state.currentPlayer.name = ''
      state.currentPlayer.inputType = ''
      state.groundWinningTemplates = resetXOInputs(state.groundWinningTemplates)
      state.gameState.message = ''
      state.gameState.type = ''

      state.isThePlayerMainOrGuest = ''
  
      state.messagesTextStore = [{
        from:'main',
        message:`hello guest player`
        },{  
          from:'guest',
          message:`hello main player`
      }]    

      state.playerLeaved = false
    }
  }
 })  


export const {setPlayerInfo
  ,setGameLogic,setNotifications,setGameState,setHasReacted,setGroundWinningTemplates,
  setMessagesTextStore,setCurrentPlayer,setSwitchPlayer,
  setUpdateGameLogicStates
,setResetGameLogicValues,setPlayerLeaved,setAllHasReacted
,setJoinsAndRequests , setTargetNote , setWaiting} = gameReducer.actions

export default gameReducer.reducer