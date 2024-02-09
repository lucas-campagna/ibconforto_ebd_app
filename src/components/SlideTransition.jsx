import React, {useMemo, useState, useEffect} from 'react'
import Slide from '@mui/material/Slide';
import Box from '@mui/material/Box';

export default function SlideTransition({direction, in:_in, from, to, onFinished, onStart, ...props}){
  onFinished = onFinished || (()=>null)
  onStart = onStart || (()=>null)
  const oppositeDirection = useMemo(()=>({left: 'right', right:'left', up: 'down', down: 'up'})[direction], [direction]);
  const [scene, setScene] = useState(0)
  const nextScene = ()=>setScene(Math.min(scenes.length - 1, scene+1))
  const scenes = [
    {direction, in: true},
    {direction, in: false, onExit: ()=>onStart(), onExited: ()=>nextScene()},
    {direction: oppositeDirection, in: true, onEntered: onFinished},
  ]
  const [isFirstCall, setIsFirstCall] = useState(true)
  const isLastScene = scene == scenes.length - 1
  useEffect(()=>{
    if(!isFirstCall){
      if(_in){
        nextScene()
      }
      else{
        setScene(0)
      }
    }else{
      setIsFirstCall(false)
    }
  }, [_in])
  let currentScene = scenes[scene]
  return (
    <Slide {...currentScene} timeout={150} {...props}>
      <Box>
        {isLastScene ? to : from}
      </Box>
    </Slide>
  )
}