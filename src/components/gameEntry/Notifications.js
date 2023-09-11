import React, { useEffect ,useState} from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setHasReacted, setPlayerInfo, setTargetNote } from '../../reduxStore/gameSlice'
import { socket } from '../../backendServer'
import { nanoid } from '@reduxjs/toolkit'

function Notifications() { 
  const notifications = useSelector(state=>state.game.notifications) 
  const mainPlayer = useSelector(state=>state.game.mainPlayer)
  const targetNote = useSelector(state=>state.game.targetNote)

  const dispatch = useDispatch()
  const navigate = useNavigate() 
  
  useEffect(()=>{
    if(mainPlayer.name == ""){
      navigate('/tic_tac_toe/entry/room_id')
    }
  },[])
   
  const handleRefuseNote = (e)=>{  
    const targetPlayerID = (e.target.id).split('__SEPRATOR__')[1]      
    dispatch(setHasReacted(targetPlayerID))
    socket.emit('refuse-play-request-note' , targetPlayerID)
    if(mainPlayer.room.roomID){
      navigate('/tic_tac_toe/entry/room_details/' + mainPlayer.room.roomID)
    }else{
      navigate('/tic_tac_toe/entry/room_id')
    }
  }
  
  const handleStartGame = (e)=>{
    const targetPlayerID = (e.target.id).split('__SEPRATOR__')[1]
    dispatch(setHasReacted(targetPlayerID))
    const selectedNote = notifications.find(note => note.playerID == targetPlayerID)    
    /*check wether the selected notification which the other player 
     wants to join my room or he wants me to join his room.*/
    //the other player room
    if(selectedNote.room){    
      dispatch(setPlayerInfo({
        mainPlayer:{
          room :{
            roomID:selectedNote.room.roomID,
            roomRounds:selectedNote.room.roomRounds,
            inputType:selectedNote.room.inputType == 'x'? 'o':'x'
          },
          playerState:"busy"
        },
        guestPlayer:{
          name:selectedNote.from,
          socketID:selectedNote.playerID,
          playerState:"busy",
          room : selectedNote.room
        },
        isThePlayerMainOrGuest:"guest",
      }))

      const message = 
      `player ${mainPlayer.name} accept your request and he joined the room.`
      
      const note = {
        id:nanoid(16),
        from : mainPlayer.name,
        playerID:mainPlayer.socketID,
        type:'accept-request',
        message
      }           

      socket.emit('accept-sender-request-to-join-his-room' , {
        note , 
        roomID:selectedNote.room.roomID
      } , targetPlayerID)
      
      dispatch(setTargetNote({id:note.id , targetPlayerID}))

      navigate(`/tic_tac_toe/dashboard/room/${selectedNote.room.roomID}/player_request_path`, {
        replace:true
      })
    }
    
    //accept play request
    if(selectedNote.type == 'accept-request' ){
      dispatch(setPlayerInfo({
        guestPlayer:{
          name:selectedNote.from,
          socketID:selectedNote.playerID,
          playerState:"busy",
          room:{
            roomID:mainPlayer.room.roomID,
            roomRounds:mainPlayer.room.roomRounds,
            inputType:mainPlayer.room.inputType == 'x'? 'o':'x'
          }
        },
        mainPlayer:{
          playerState:"busy",
        },
        isThePlayerMainOrGuest:"main",
      }))

      socket.emit('start-room' , mainPlayer.room.roomID , selectedNote.playerID)

      navigate(`/tic_tac_toe/dashboard/room/${mainPlayer.room.roomID}/player_request_path`, {
        replace:true
      })
    }
    
    //my room
    if(!selectedNote.room && !selectedNote.type ){
      dispatch(setPlayerInfo({
        guestPlayer:{
          name:selectedNote.from,
          socketID:selectedNote.playerID,
          playerState:"busy",
          room:{
            roomID:mainPlayer.room.roomID,
            roomRounds:mainPlayer.room.roomRounds,
            inputType:mainPlayer.room.inputType == 'x'? 'o':'x'
          }
        },
        mainPlayer:{
          playerState:"busy",
        },
        isThePlayerMainOrGuest:"main",
      }))
      
      socket.emit('accept-sender-request-to-join-my-room' , mainPlayer , targetPlayerID)
      
      navigate(`/tic_tac_toe/dashboard/room/${mainPlayer.room.roomID}/room_request_path`, {
        replace:true
      })
    }      
  }  

  //if there are no notifications.
  if(notifications.length == 0){
    return (
      <div className='entry-card'>
        you do not have any notifications!.
        {
        mainPlayer.room.roomID =="" || mainPlayer.room.inputType =="" ?
        <button className='btn btn-back' 
        onClick={()=>navigate('/online-tic-tac-toe-game/tic_tac_toe/entry/room_id')}>
          Back to room setting</button>:""
        }
      </div>
    )
  }
  
  //if there are notifications.
  return (
      <div className='avalable-rooms'>
       <div className='notifications rooms-container'>
        {
          notifications?.map((note , index)=>{
            return (
              <div className='avalable-room-div' key={`key_${note.playerID}_${index}`}>
                <div className='room-creator-player'>
                  <div className='icon-class icon-available'>
                    <i className='bx bxs-user'></i>
                  </div>
                  <p>{note.from}</p>                  
                </div>

                <div className='note-info-div'>
                  <div className='room-creator-player'>
                    <div className='icon-class icon-available'>
                      <i className='bx bxs-send'></i>
                    </div> 
                    <div className='note-message'>
                      <p>{note?.message}</p>
                    </div>                            
                  </div>

                  {
                    note.room && 
                    <div className='room-info-div-content'>
                      <p className='room-details-paragraph'>Owner: 
                      <span className='room-details-paragraph-value'>
                        {note.from}</span></p>
                      <p className='room-details-paragraph'>Selected Player: 
                      <span className='room-details-paragraph-value'>
                        {note.room.inputType}</span></p>
                      <p className='room-details-paragraph'>Rounds: 
                      <span className='room-details-paragraph-value'>
                        {note.room.roomRounds}</span></p>
                      <p className='room-details-paragraph'>Room id:  
                      <span className='room-details-paragraph-value'>
                        {note.room.roomID}</span></p> 
                    </div> 
                  }
                </div>

                {
                  !note.hasReacted&&
                  <div>
                    <button onClick={handleStartGame} 
                    id={`start__SEPRATOR__${note.playerID}`} 
                    className='btn btn-start'>start game</button>
                    {
                      !note.type &&
                      <button onClick={handleRefuseNote} 
                      id={`refuse__SEPRATOR__${note.playerID}`} 
                      className='btn btn-refuse'>refuse</button> 
                    }                                              
                  </div> 
                }                             
              </div>   
            )
          })
        }
      </div>

      {
        mainPlayer.room.roomID =="" ||  mainPlayer.room.inputType =="" ?
        <button className='btn btn-back' onClick={()=>navigate('/tic_tac_toe/entry/room_id')}>
          Back to room setting</button>:""
      }
      </div>
  )
}

export default Notifications
