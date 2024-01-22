import React, {useContext} from 'react'
import {LoginContext} from './Login'
import { useLoaderData } from 'react-router'

export default function Home() {
  const sheets = useLoaderData()
  return (
    <div>
      <div>HOME</div>
      <div>apiKey: {apiKey}</div>
      <div>userId: {userId}</div>
    </div>
  )
}

export function homeLoader() { 
  const sheet = useSheets()
  if(sheet?.isValidUser())
    return sheet
  return null
}