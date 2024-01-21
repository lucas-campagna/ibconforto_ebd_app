import React, {useContext} from 'react'
import {AuthContext} from './Auth'

export default function Home() {
  const {apiKey, userId} = useContext(AuthContext);
  return (
    <div>
      <div>HOME</div>
      <div>apiKey: {apiKey}</div>
      <div>userId: {userId}</div>
    </div>
  )
}