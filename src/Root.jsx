import useSheets from './hooks/sheets'
import { Outlet, useLoaderData, useLocation } from 'react-router'
import { redirect } from 'react-router-dom'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Header from './components/Header'

function Root() {
  const {theme} = useLoaderData()
  return (
    <Stack
      flexDirection='column'
      alignItems='center'
    >
      <Header title={theme}/>
      <Outlet/>
    </Stack>
  )
}

export async function loader({request}) { 
  const sheets = useSheets()
  if(!sheets || !await sheets.isValidUser()){
    return redirect('/login')
  }
  const user = await sheets.teacher.get()
  return user
  // const {message, status} = await sheets.isValidUser()
  // if(!status || !message){
  //   const url = new URL(request.url)
  //   return url.pathname === '/login' ? {} : redirect('/login')
  // }
  // const userInfoResponse = await sheets.getUserInfo()
  // if(!userInfoResponse.status){
  //   const url = new URL(request.url)
  //   return url.pathname === '/login' ? {} : redirect('/login')
  // }
  // const {group, id: userId, name, theme} = userInfoResponse.message
  // return {group, id: userId, name, theme, ...sheets}
}

export default Root