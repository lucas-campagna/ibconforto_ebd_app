import React, { useMemo, useState, useCallback, useEffect } from 'react'
import { useLoaderData, useLocation, useNavigate, useRevalidator } from 'react-router'
import { useSearchParams, redirect } from 'react-router-dom'
import Stack from '@mui/material/Stack'
import Fab from '@mui/material/Fab'
import Typography from '@mui/material/Typography'
import SaveIcon from '@mui/icons-material/Save';
import SyncIcon from '@mui/icons-material/Sync';
import Grow from '@mui/material/Grow';
import Slide from '@mui/material/Slide';

import useSheets from '../hooks/sheets'

import LoadingDialog from '../components/LoadingDialog'
import HomeFooter from '../components/HomeFooter'
import SlideTransition from '../components/SlideTransition'
import AttendanceList from '../components/AttendanceList'
import { Button } from '@mui/material'

export default function Home() {
  const location = useLocation()
  const navigate = useNavigate()
  const revalidator = useRevalidator()
  const [params, _] = useSearchParams()
  const {history: historyFromServer, saveHistory, invalidateCache} = useLoaderData()
  const dateNow = useMemo(()=>dateToStr(Date.now()),[])
  const currentDateFromParams = dateToStr(new Date(params.get('date') || dateNow));
  const [buttonSaveVisible, setButtonSaveVisible] = useState(false);
  const [buttonSyncVisible, setButtonSyncVisible] = useState(true);
  const [dialogMessage, setDialogMessage] = useState('');
  const validDates = useMemo(()=>Object.keys(historyFromServer).filter(date=>date <= dateNow),[historyFromServer]);
  const [currentDate, setCurrentDate] = useState(currentDateFromParams in validDates ? currentDateFromParams : validDates.at(-1))
  const [lastDate, setLastDate] = useState(currentDate)
  const [currentAttendanceList, setCurrentAttendanceList] = useState(historyFromServer[currentDate])

  const {next, prev} = useMemo(()=>{
    const prev = validDates.filter(d=>d < currentDate).at(-1)
    const next = validDates.filter(d=>d > currentDate).at(0)
    return {next, prev}
  }, [validDates, currentDate])

  useEffect(()=>{
    setButtonSyncVisible(true)
    setCurrentAttendanceList(historyFromServer[currentDate])
  }, [location])

  useEffect(()=>{
    if(revalidator.state === 'idle'){
      setDialogMessage('')
      setButtonSyncVisible(true)
    }else{
      setDialogMessage('Atualizando...')
    }
  },[revalidator.state])

  function handleChangeCurrentDate(newDate){
    setCurrentDate(newDate)
  }

  async function handleOnSave(){
    const newServerAttendanceList = {}
    newServerAttendanceList[currentDate] = currentAttendanceList;
    setDialogMessage('Salvando...')
    setButtonSaveVisible(false)
    setButtonSyncVisible(false)
    const {message, status} = await saveHistory(newServerAttendanceList)
    revalidator.revalidate()
  }

  async function handleOnSync(){
    setDialogMessage('Atualizando...')
    setButtonSaveVisible(false)
    setButtonSyncVisible(false)
    invalidateCache()
    revalidator.revalidate()
  }

  function handleOnChangeAttendanceList(newList){
    const hasChanged = JSON.stringify(newList) != JSON.stringify(historyFromServer[lastDate])
    setButtonSaveVisible(hasChanged)
    setButtonSyncVisible(!hasChanged)
    setCurrentAttendanceList(newList);
  }

  const HistoryListLastDate = useMemo(()=>{
    return (
      <AttendanceList
        key={lastDate}
        list={historyFromServer[lastDate]}
        onChanged={handleOnChangeAttendanceList}
      />
    )},[lastDate, historyFromServer[lastDate]])
  const HistoryListCurrentDate = useMemo(()=>{
    return (
      <AttendanceList
        key={currentDate}
        list={historyFromServer[currentDate]}
        onChanged={handleOnChangeAttendanceList}
      />
    )},[currentDate, historyFromServer[currentDate]])
  return (
    <Stack
      direction='column'
      alignItems='center'
    >
      <Stack
        justifyContent='start'
        direction='column'
        alignItems='center'  
      >
        <SlideTransition
          direction={currentDate < lastDate ? 'left' : 'right'}
          in={lastDate !== currentDate}
          from={HistoryListLastDate}
          to={HistoryListCurrentDate}
          onStart={()=>{
            setButtonSaveVisible(false)
            setButtonSyncVisible(false)
          }}
          onFinished={()=>{
            setLastDate(currentDate);
            navigate(`?date=${currentDate}`)
            setButtonSyncVisible(true)
          }}
        />
      </Stack>
      <HomeFooter
        prev={prev}
        next={next}
        current={currentDate}
        onPrevClick={()=>handleChangeCurrentDate(prev)}
        onNextClick={()=>handleChangeCurrentDate(next)}
      />
      <Stack
        direction='row'
        spacing={1}
        sx={{
          position:'fixed',
          right:'3%',
          bottom:60,
          zIndex:3,
        }}
      >
        {buttonSaveVisible ? <ButtonSave visible={buttonSaveVisible} onClick={handleOnSave}/>:<></>}
        {buttonSyncVisible ? <ButtonSync visible={buttonSyncVisible} onClick={handleOnSync}/>:<></>}
      </Stack>
      <LoadingDialog message={dialogMessage}/>
    </Stack>
  )
}

export async function homeLoader() { 
  const sheet = useSheets()
  if(!sheet) return redirect('/login')
  // caching getUserInfo
  sheet.getUserInfo()
  const {message, status} = await sheet.getHistory()
  if(status)
    return {
      history: message,
      saveHistory: sheet.setHistory,
      invalidateCache: sheet.invalidateCache,
    }
  return {}
}

const ButtonSave = ({visible, ...props})=>(
  <Slide
    in={visible}
    direction='left'
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
  </Slide>
)

const ButtonSync = ({visible, ...props})=>(
  <Slide
    in={visible}
    direction='left'
  >
    <Fab
      variant="extended"
      size="medium"
      color="primary"
      sx={{width:0}}
      {...props}
    >
      <SyncIcon/>
      {/* <Typography sx={{ml:1}}>Salvar</Typography> */}
    </Fab>
  </Slide>
)

const deepCmp = (obj1,obj2) => JSON.stringify(obj1) === JSON.stringify(obj2)
const dateToStr = date => {const fDate = dateFromStr(date); return `${padZeros(fDate.getFullYear())}/${padZeros(fDate.getMonth()+1)}/${padZeros(fDate.getDate())}`};
const dateFromStr = date => new Date(date);
const padZeros = (s,n=2) => String(s).padStart(n,'0')