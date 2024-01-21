import { useState } from 'react'
import Auth from './components/Auth'
import Home from './components/Home'

function App() {
  return (
    <Auth>
      <Home/>
    </Auth>
  )
}
export default App