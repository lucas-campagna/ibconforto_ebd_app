import useSheets from './hooks/sheets'
import { Outlet, useLoaderData, useLocation } from 'react-router'
import { redirect } from 'react-router-dom'
import Box from '@mui/material/Box'
import Header from './components/Header'

function Root() {
  const {apiKey, userId, ...sheet} = useLoaderData()
  const location = useLocation()
  return (
    <Box
      sx={{
        display:'flex',
        flexDirection:'column',
        alignItems:'center',
        justifyContent:'start',
      }}
    >
      <Header/>
      <Outlet/>
    </Box>
  )
}

export async function rootLoader({request}) { 
  const sheet = useSheets()
  if(!sheet){
    const url = new URL(request.url)
    return url.pathname === '/login' ? {} : redirect('/login')
  }
  const {message, status} = await sheet.isValidUser()
  if(!status || !message){
    const url = new URL(request.url)
    return url.pathname === '/login' ? {} : redirect('/login')
  }
  return sheet
}

export default Root