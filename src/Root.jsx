import { useState } from 'react'
import { Outlet } from 'react-router'

function Root() {
  return (
    <div>
      <Outlet/>
    </div>
  )
}

export function rootLoader() { 
  return null
}

export default Root