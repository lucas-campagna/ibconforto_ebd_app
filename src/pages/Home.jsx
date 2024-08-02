import React, { useMemo, useState, useEffect, useReducer, useCallback } from 'react'
import { useLoaderData, useLocation, useNavigate, useRevalidator } from 'react-router'
import { useSearchParams, redirect } from 'react-router-dom'
import Stack from '@mui/material/Stack'
import Fab from '@mui/material/Fab'
import Typography from '@mui/material/Typography'
import SaveIcon from '@mui/icons-material/Save';
import SyncIcon from '@mui/icons-material/Sync';
import AddIcon from '@mui/icons-material/Add';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import SpeakerNotesIcon from '@mui/icons-material/SpeakerNotes';
import Dialog from '@mui/material/Dialog'
import Slide from '@mui/material/Slide';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';


import useSheets from '../hooks/sheets'

import LoadingDialog from '../components/LoadingDialog'
import HomeFooter from '../components/HomeFooter'
import SlideTransition from '../components/SlideTransition'
import AttendanceList from '../components/AttendanceList'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import { DialogActions } from '@mui/material'

export default function Home() {
  const location = useLocation()
  const navigate = useNavigate()
  const revalidator = useRevalidator()
  const [params, _] = useSearchParams()
  const {history: historyFromServer, saveHistory, invalidateCache} = useLoaderData()
  const today = dateToLocal(Date.now())
  const currentDateFromParams = dateToISO(params.get('date') || today);
  const [buttonSaveVisible, setButtonSaveVisible] = useState(false);
  const [buttonSyncVisible, setButtonSyncVisible] = useState(true);
  const [dialogMessage, setDialogMessage] = useState('');
  const validDates = useMemo(()=>Object.keys(historyFromServer).filter(date=>dateToISO(date) <= dateToISO(today)),[historyFromServer]);
  const [currentDate, setCurrentDate] = useState(currentDateFromParams in validDates ? currentDateFromParams : validDates.at(-1))
  const [lastDate, setLastDate] = useState(currentDate)
  const [currentAttendanceList, setCurrentAttendanceList] = useState(historyFromServer[currentDate])
  const [showRequestDialog, setShowRequestDialog] = useState(false)
  
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
    setDialogMessage('Salvando...')
    setButtonSaveVisible(false)
    setButtonSyncVisible(false)
    await saveHistory(currentAttendanceList.filter(({status},i) => historyFromServer[currentDate][i].status != status))
    setDialogMessage('')
    setButtonSyncVisible(true)
    revalidator.revalidate()
  }

  async function handleOnSync(){
    setDialogMessage('Atualizando...')
    setButtonSaveVisible(false)
    setButtonSyncVisible(false)
    invalidateCache()
    revalidator.revalidate()
  }

  async function handleOnRequest(){
    setButtonSaveVisible(false)
    setButtonSyncVisible(false)
    setShowRequestDialog(true)
  }

  function handleOnCloseRequestDialog(){
    setShowRequestDialog(false)
    setButtonSaveVisible(false)
    setButtonSyncVisible(true)
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
        canEdit={lastDate === today}
      />
    )},[lastDate, historyFromServer[lastDate]])
  const HistoryListCurrentDate = useMemo(()=>{
    return (
      <AttendanceList
        key={currentDate}
        list={historyFromServer[currentDate]}
        onChanged={handleOnChangeAttendanceList}
        canEdit={currentDate === today}
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
            // setButtonSaveVisible(false)
            // setButtonSyncVisible(false)
          }}
          onFinished={()=>{
            setLastDate(currentDate);
            navigate(`?date=${currentDate}`)
            setButtonSaveVisible(false)
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
        direction='column'
        alignItems={'end'}
        spacing={1}
        sx={{
          position:'fixed',
          right:'3%',
          bottom:60,
          zIndex:3,
        }}
      >
        <ButtonRequest visible={buttonSyncVisible} onClick={handleOnRequest}/>
        <ButtonSync visible={buttonSyncVisible} onClick={handleOnSync}/>
        <ButtonSave visible={buttonSaveVisible} onClick={handleOnSave}/>
        {/* {buttonSaveVisible ? :<></>} */}
        {/* {buttonSyncVisible ? (<>
          </>
        ):<></>} */}
      </Stack>
      <LoadingDialog message={dialogMessage}/>
      <RequestDialog visible={showRequestDialog} onClose={handleOnCloseRequestDialog}/>
    </Stack>
  )
}

export async function homeLoader() { 
  const sheets = useSheets()
  if(!sheets) {
    return redirect('/login')
  }
  sheets.fetchAll();
  const attendances = await sheets.attendance.get()
  const students = await sheets.student.get()
  const dates = await sheets.date.get()
  if(attendances && students && dates) {
    // TODO: filtrar data até o dia atual aqui
    return {
      history: Object.fromEntries(dates.map(date => [date, students.map(({name}) => ({name, status: attendances.reduce((o, {date: d, name: n}) => o || n === name && d === date, false)}))])),
      saveHistory: async newStatus => {
        try{
          await sheets.attendance.call([
            ...newStatus.filter(({status}) => status).map(({name}) => ({add: {name}})),
            ...newStatus.filter(({status}) => !status).map(({name}) => ({rm: {name}})),
        ]);
        } catch(error) {
          console.log(error)
          sheets.attendance.invalidate()
          await sheets.attendance.get()
        }
      },
      invalidateCache: () => {
        sheets.attendance.invalidate();
        sheets.date.invalidate();
        sheets.student.invalidate();
      },
    }
  }
  sheets.logout()
  return redirect('/login');
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
    </Fab>
  </Slide>
)

const ButtonRequest = ({visible, ...props}) => {
  const innerVisible = useDelay({value: visible, delay: 75, onEnter: true, onExit: true});
  return (
  <Slide
    in={innerVisible}
    direction='left'
  >
    <Fab
      variant="extended"
      size="medium"
      color="secondary"
      sx={{width:0}}
      {...props}
      >
      <AddIcon/>
    </Fab>
  </Slide>
)}

const useDelay = ({value, delay, onEnter, onExit}) => {
  onEnter = onEnter || false;
  onExit = onExit || false;
  const [innerVisible, setVisible] = useState(value);
  const setDelayed = ()=>setTimeout(()=>setVisible(value), delay)
  useEffect(()=>{
    if(innerVisible){
      if(onExit) setDelayed()
      else setVisible(value)
    } else {
      if(onEnter) setDelayed()
      else setVisible(value)
    }
  },[value])
  return innerVisible
}

const RequestDialog = ({visible, onClose, ...props}) => {
  const defaultNewStudent = {name: '', phone: '', formatedPhone: '', isValidPhoneNumber: false, isValidStudentName: true}
  const [open, setOpen] = useState(visible);
  const [screen, setScreen] = useReducer((current, action) => action, 'home')
  const [newStudent, setNewStudent] = useState(defaultNewStudent)
  const [studentToRemove, setStudentToRemove] = useState('')
  const [students, setStudents] = useState([])
  const [note, setNote] = useState('')
  const sheets = useSheets();
  newStudent.isValidStudentName = useMemo(()=>!students.includes(newStudent.name.toLocaleLowerCase()), [students, newStudent.name])
  useEffect(()=>{
    sheets.student.get()
      .then(students => setStudents(students.map(({name}) => name.toLocaleLowerCase())))
  },[])
  useEffect(()=>{
    setOpen(visible)
  },[visible])
  useEffect(()=>{
    if(!open){
      setNewStudent(defaultNewStudent)
      setStudentToRemove('')
      setNote('')
      onClose()
      setTimeout(()=>setScreen('home'), 200)
    }
  }, [open])

  function handlePhoneInput(phone) {
    phone = phone.replaceAll(/[^0-9]/g,'').slice(0,11)
    let formatedPhone = phone
    if(phone.length > 2){
      if(phone.length > 10){
        formatedPhone = `(${phone.slice(0,2)}) ${phone.slice(2,6)}-${phone.slice(6)}`
      } else {
        formatedPhone = `(${phone.slice(0,2)}) ${phone.slice(2,5)}-${phone.slice(5)}`
      }
    }
    if(phone.length < 6) {
      formatedPhone = formatedPhone.replace('-','')
    }
    const isValidPhoneNumber = phone.length > 9
    setNewStudent({ ...newStudent, phone, formatedPhone, isValidPhoneNumber })
  }

  function handleAddStudent() {
    async function fetchData(){
      const {className} = await sheets.teacher.get()
      sheets.requisition.add({description: `Adicionar aluno ${newStudent.name} (telefone: ${newStudent.formatedPhone}) na classe ${className}`})
      setOpen(false)
    }
    fetchData();
  }
  
  function handleRemoveStudent() {
    async function fetchData(){
      const {className} = await sheets.teacher.get()
      sheets.requisition.add({description: `Remover aluno ${studentToRemove} da classe ${className}`})
      setOpen(false)
    }
    fetchData();
  }

  function handleAddNote() {
    sheets.requisition.add({description: `Pedido do professor: ${note}`})
    setOpen(false)
  }

  return (
    <Dialog
      open={open}
      onClose={()=>{
        onClose()
        setOpen(false)
      }}
      {...props}
    >
      <DialogContent>
        {{
          home: <>
            <DialogTitle>
            Fazer um pedido
            </DialogTitle>
            <Stack direction='column' spacing={2} justifyContent='space-evenly' alignItems='stretch'>
              <Button variant='contained' color='primary' startIcon={<PersonAddIcon/>} onClick={()=>setScreen('addStudent')}>
              Adicionar Aluno
              </Button>
              <Button variant='contained' color='primary' startIcon={<PersonRemoveIcon/>} onClick={()=>setScreen('rmStudent')}>
              Remover Aluno
              </Button>
              <Button variant='contained' color='primary' startIcon={<SpeakerNotesIcon/>} onClick={()=>setScreen('note')}>
              Outro Assunto
              </Button>
            </Stack>
          </>,
          addStudent: <>
            <DialogTitle>Dados do novo aluno</DialogTitle>
            <Stack direction='column' spacing={2}>
              <TextField
                label={newStudent.isValidStudentName ? 'Nome' : "Nome repetido!"}
                value={newStudent.name}
                variant='outlined'
                color={newStudent.isValidStudentName ? 'primary' : 'error'}
                onChange={(e)=>setNewStudent({...newStudent, name: e.target.value})}
                />
              <TextField
                label='Telefone'
                color={newStudent.isValidPhoneNumber ? 'primary' : 'error'}
                value={newStudent.formatedPhone}
                variant='outlined'
                fullWidth
                onChange={e=>handlePhoneInput(e.target.value)}
              />
            </Stack>
            <DialogActions>
              <Button
                disabled={!newStudent.isValidPhoneNumber || newStudent.name.length < 3 || !newStudent.isValidStudentName}
                onClick={handleAddStudent}
              >Ok</Button>
            </DialogActions>
          </>,
          rmStudent: <>
            <DialogTitle>Remover aluno</DialogTitle>
            <Select
              fullWidth
              value={studentToRemove}
              onChange={e=>setStudentToRemove(e.target.value)}
            >
              {students.map(name => (
                <MenuItem key={name} value={name}>{name}</MenuItem>
              ))}
            </Select>
            <DialogActions>
              <Button
                disabled={studentToRemove.length === 0}
                onClick={handleRemoveStudent}
              >Ok</Button>
            </DialogActions>
          </>,
          note: <>
            <DialogTitle>Pedido</DialogTitle>
            <Stack direction='column' spacing={2}>
              <TextField
                value={note}
                variant='outlined'
                multiline
                minRows={4}
                maxRows={4}
                fullWidth
                onChange={(e)=>setNote(e.target.value)}
              />
            </Stack>
            <DialogActions>
              <Button
                disabled={note.length === 0}
                onClick={handleAddNote}
              >Ok</Button>
            </DialogActions>
          </>,
        }[screen]}
      </DialogContent>
    </Dialog>
  )
}

const dateToLocal = date => {
  try {
    return new Date(date).toLocaleDateString('pt-BR')
  } catch {
    return `Formato inválido de data=${date}`
  }
}
const dateToISO = date => {
  try {
    const [day, month, year] = date.split('/');
    return new Date(year, month-1, day).toISOString();
  } catch {
    return `Formato de data inválido ${date}`
  }
}

const deepCmp = (obj1,obj2) => JSON.stringify(obj1) === JSON.stringify(obj2)
// const dateToStr = date => new Date(date).toLocaleDateString('pt-BR');
const dateFromStr = date => {const [day, month, year] = date.split('/'); return new Date(year, month-1, day).toISOString();};
const padZeros = (s,n=2) => String(s).padStart(n,'0')