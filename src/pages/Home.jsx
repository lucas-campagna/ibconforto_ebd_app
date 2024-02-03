import React, { useMemo, useState, useCallback, useEffect } from 'react'
import { useLoaderData, useRevalidator } from 'react-router'
import { useSearchParams, redirect } from 'react-router-dom'
import HomeFooter from '../components/HomeFooter'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Fab from '@mui/material/Fab'
import Typography from '@mui/material/Typography'
import SaveIcon from '@mui/icons-material/Save';
import Grow from '@mui/material/Grow';

import LoadingDialog from '../components/LoadingDialog'
import useSheets from '../hooks/sheets'
import CheckButtom from '../components/CheckButtom'


export default function Home() {
  const revalidator = useRevalidator()
  const [params, _] = useSearchParams()
  const {history: historyFromServer, saveHistory} = useLoaderData()
  const today = dateToStr(new Date(params.get('date') || Date.now()));
  const [history, setHistory] = useState({});
  const [dialogMessage, setDialogMessage] = useState('');
  const {
    historyFromServerTodayFiltered,
    datesFromServer,
    validDates,
    validToday,
  } = useMemo(()=>{
    const historyFromServerTodayFiltered = Object.fromEntries(Object.entries(historyFromServer).filter(([date, data]) => new Date(date) <= new Date()));
    const datesFromServer = Object.keys(historyFromServer);
    const validDates = Object.keys(historyFromServerTodayFiltered);
    const validToday = today in historyFromServerTodayFiltered ? today : validDates.at(-1);
    setHistory(historyFromServerTodayFiltered[validToday])
    return {historyFromServerTodayFiltered, datesFromServer, validDates, validToday}
  },[historyFromServer, today]);

  const {next, prev, hasNext} = useMemo(()=>{
    const prev = datesFromServer.filter(d=>d < validToday).at(-1)
    const next = datesFromServer.filter(d=>d > validToday).at(0)
    const hasNext = validDates.includes(next)
    return {next, prev, hasNext}
  }, [datesFromServer])

  useEffect(()=>{
    if(revalidator.state === 'idle'){
      setDialogMessage('')
    }else{
      setDialogMessage('Atualizando...')
    }
  },[revalidator.state])
  
  function handleClickName(name){
    const newHistory = {...history}
    newHistory[name] = !newHistory[name]
    setHistory(newHistory)
  }

  async function handleOnSave(){
    const newHistory = {}
    newHistory[validToday] = history;
    setDialogMessage('Salvando...')
    const {message, status} = await saveHistory(newHistory)
    revalidator.revalidate()
  }
  return (
    <Box
      sx={{
        width:'100%',
        display:'flex',
        flexDirection:'column',
        alignItems: 'center',
      }}
    >
      <Stack
        direction='column'
        spacing={1}
        sx={{
          mt:1,
          mb:6,
          maxWidth:375,
        }}
      >
      {
        history?
        Object.entries(history).map(
          ([name, checked],i)=>
            <CheckButtom
              key={i}
              name={name}
              checked={checked}
              onClick={handleClickName}
            />
        )
        :
        <></>
      }
      </Stack>
      <HomeFooter
        prev={prev}
        next={next}
        current={validToday}
        hasNext={hasNext}
      />
      <ButtonSave
        visible={Object.entries(history).reduce((last, [name, val])=>last || historyFromServerTodayFiltered[validToday][name] !== val, false)}
        onClick={handleOnSave}
        sx={{
          position:'fixed',
          right:'3%',
          bottom:60,
          zIndex:3,
        }}
      />
      <LoadingDialog message={dialogMessage}/>
    </Box>
  )
}


export async function homeLoader() { 
  const sheet = useSheets()
  if(!sheet) return redirect('/login')
  const {message, status} = await sheet.getHistory()
  if(status)
    return {
      history: message,
      saveHistory: sheet.setHistory
    }
  return {}
}

const ButtonSave = ({visible, ...props})=>(
  <Grow
    in={visible}
    >
    <Fab
      variant="extended"
      size="medium"
      color="secondary"
      {...props}
    >
      <SaveIcon />
      <Typography sx={{ml:1}}>Salvar</Typography>
    </Fab>
  </Grow>
)

const deepCopy = obj => JSON.parse(JSON.stringify(obj))
const dateToStr = date => {const fDate = dateFromStr(date); return `${padZeros(fDate.getFullYear())}/${padZeros(fDate.getMonth()+1)}/${padZeros(fDate.getDate())}`};
const dateFromStr = date => new Date(date);
const padZeros = (s,n=2) => String(s).padStart(n,'0')