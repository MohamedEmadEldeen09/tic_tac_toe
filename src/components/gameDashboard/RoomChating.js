import React from 'react'
import { useRef } from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setMessagesTextStore } from '../../reduxStore/gameSlice'
import { socket } from '../../backendServer'
import human_1 from '../../img/human1.png'
import human_2 from '../../img/human2.png'
import { Comment } from 'react-loader-spinner'


function RoomChating(){ 
  const [guestPlayerTypingMessage , setGuestPlayerTypingMessage] = useState(false)
  const mainPlayer = useSelector(state=>state.game.mainPlayer)
  const guestPlayer = useSelector(state=>state.game.guestPlayer)
  const messagesTextStore = useSelector(state=>state.game.messagesTextStore)
  const isThePlayerMainOrGuest = useSelector(state=>state.game.isThePlayerMainOrGuest)

  const dispatch = useDispatch() 
  
  const messageText = useRef('')

  useEffect(()=>{
    socket.on('recieve-message' , (message)=>{ 
      setGuestPlayerTypingMessage(false)  
      
      const t = new Date(Date.now()) 
      const time = `${t.getHours()}:${t.getMinutes()}:${t.getSeconds()}`
     
      dispatch(setMessagesTextStore({
        from:'guest',
        message,
        time
      }))
    })

    socket.on('chat-guest-player-typing-message-start' , ()=>{
      setGuestPlayerTypingMessage(true)
    })
    socket.on('chat-guest-player-typing-message-stop' , ()=>{
      setGuestPlayerTypingMessage(false)
    })
  },[socket])

  const handleSendMessage = ()=>{
    if(messageText.current.value != ''){ 
      const t = new Date(Date.now()) 
      const time = `${t.getHours()}:${t.getMinutes()}:${t.getSeconds()}`
      dispatch(setMessagesTextStore({
        from:'main',
        message:messageText.current.value,
        time
      }))
      socket.emit('send-message' , messageText.current.value , mainPlayer.room.roomID)
      messageText.current.value = ''
    }   
  }
  
  const handleChangeTextStart = ()=>{
    socket.emit('chat-guest-player-typing-message-start' , mainPlayer.room.roomID)
  }

  const handleChangeTextStop = ()=>{
    if( messageText.current.value == ''){
      socket.emit('chat-guest-player-typing-message-stop' , mainPlayer.room.roomID)
    }    
  }

  return (
    <>
    <header className='players-chating-header'>    
      <div className='player-avatar-online'>
        {
          isThePlayerMainOrGuest == 'main' ?
          <img src={human_1} className='player-avatar player-avatar-in-message' 
          alt='player1'/>:
          <img src={human_2} className='player-avatar player-avatar-in-message' 
          alt='player1'/>
        }  
        <div className='player-online'></div>
      </div>
      <p>{mainPlayer.name}</p>
    </header>
      
    <main className='players-chating-message-view'>
      {
        messagesTextStore.map((messageObject, index)=>{
          if(messageObject.from == 'main'){
            return(
              <div className='main-palyer-message player-message player-message-right' 
              key={index}>
                {
                  isThePlayerMainOrGuest == 'main' ?
                  <img src={human_1} className='player-avatar player-avatar-in-message' 
                  alt='player1'/>:
                  <img src={human_2} className='player-avatar player-avatar-in-message' 
                  alt='player1'/>
                }        
                <div className='message-container'>
                  <p className='message-player-name'>{mainPlayer.name}</p>
                  <p className='message-date'>{messageObject.time}</p>         
                  {
                    mainPlayer.room.inputType == 'x' ? 
                    <div className='message-container-message-itself message-background-color-x'>                              
                     <p>{messageObject.message}</p>          
                    </div>:
                    <div className='message-container-message-itself message-background-color-o'>                              
                     <p>{messageObject.message}</p>          
                    </div>
                  } 
                </div>       
              </div>
            ) 
          }

          if(messageObject.from == 'guest'){
            return (
              <div className='guest-palyer-message player-message player-message-left'
              key={index}>
                {
                  isThePlayerMainOrGuest == 'main' ?
                  <img src={human_2} className='player-avatar player-avatar-in-message' 
                  alt='player1'/>:
                  <img src={human_1} className='player-avatar player-avatar-in-message' 
                  alt='player1'/>
                }
              
                <div className='message-container'>
                  <p className='message-player-name'>{guestPlayer.name}</p>
                  <p className='message-date'>{messageObject.time}</p>  
                  {
                    mainPlayer.room.inputType == 'x' ? 
                    <div className='message-container-message-itself-guest message-background-color-o'>                              
                     <p>{messageObject.message}</p>          
                    </div>:
                    <div className='message-container-message-itself-guest message-background-color-x'>                              
                     <p>{messageObject.message}</p>          
                    </div>
                  }                       
                </div>    
              </div>
            ) 
          }
        })
      }       

      {
        guestPlayerTypingMessage && 
         <div className='guest-palyer-message player-message player-message-left'> 
          {
            isThePlayerMainOrGuest == 'main' ?
            <img src={human_2} className='player-avatar player-avatar-in-message' 
            alt='player1'/>:
            <img src={human_1} className='player-avatar player-avatar-in-message' 
            alt='player1'/>
          }       
            <div className='message-container'>
              <p className='message-player-name'>{guestPlayer.name}</p>
              <p className='message-date'></p>         
              <div>               
                <p>
                <Comment
                height="40"
                width="40"
                ariaLabel="comment-loading"                        
                backgroundColor={
                  mainPlayer.room.inputType == 'x'?
                  'rgba(27, 169, 225,0.5)':'rgba(98, 229, 46,0.5)'
                } />           
              </p>          
              </div>
            </div>         
         </div>        
      }
    </main>
    
    <footer className='players-chating-message-input-send'>
      <textarea className='message-input' placeholder='inter your message' 
      rows={2} 
      onInput={handleChangeTextStart} 
      onChange={handleChangeTextStop}          
      ref={messageText}></textarea>       
      <button className='btn btn-send-message' onClick={handleSendMessage}>
          <i className='bx bxs-send'></i>   
      </button>
    </footer>
    </>
  )
}

export default RoomChating