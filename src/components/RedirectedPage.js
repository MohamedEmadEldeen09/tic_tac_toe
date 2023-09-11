import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function RedirectedPage() {
    const navigate= useNavigate()   
    useEffect(()=>{
        navigate('/tic_tac_toe/entry')
    },[])
  return (
    <div></div>
  )
}

export default RedirectedPage