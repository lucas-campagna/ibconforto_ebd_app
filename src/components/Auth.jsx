import React, {useRef, useEffect, useState, createContext, useCallback} from 'react'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import TextField from '@mui/material/TextField'
import { useSearchParams, useNavigate, useLocation, redirect } from 'react-router-dom'
import useSheets from '../hooks/sheets'

export const AuthContext = createContext()

export default function Auth({children}) {
  const [state, setState] = useState({
    apiKey: localStorage.getItem('apiKey'),
    userId: localStorage.getItem('userId'),
    isLogged: false,
    data: {}
  });
  const {isValidUser} = useSheets(state.apiKey, state.userId);
  const [inputCode, setInputCode] = useState('');
  const [searchParams, _] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(()=>{
    async function parseUrl(){
      const code = searchParams.get('code')
      if(code){
        const [apiKey, userId] = code.split('.')
        connectToSheet(apiKey)
        login(userId)
      }
    }
    parseUrl()
  }, [location])

  useEffect(()=>{
    async function parseData(){
      const response = await isValidUser()
      if(response.status)
        setState({...state, isLogged: response.message})
    }
    parseData()
  },[state.apiKey, state.userId]);


  function handleEnterCode(){
    const [apiKey, userId] = inputCode.split('.')
    if((state.apiKey !== apiKey || state.userId !== userId) && confirm("Você já possui uma conta vinculada a este aplicativo.\nDeseja desavincular a conta atual e vincular outra?")){
      navigate(`/?code=${inputCode}`)
    }
  }

  function connectToSheet(apiKey) {
    if(state.apiKey !== apiKey){
      setState({...state, apiKey})
      localStorage.setItem('apiKey', apiKey)
      navigate('/')
    }
  }
  
  function login(userId) {
    if(state.userId !== userId){
      setState({...state, userId})
      localStorage.setItem('userId', userId)
      navigate('/')
    }
  }
  const LoggedContent = ()=>(
    <Container
      maxWidth="sm"
      sx={{
        py:'10%',
        px:'10%',
      }}
    >
      <Box>
        <Typography variant='h4'>EBD IBConforto</Typography>
      </Box>
      <Box
        my='10%'
        display='flex'
        flexDirection='column'
      >
        <Typography my='3%' display='block' variant='p'>Olá, caro(a) professor(a)!</Typography>
        <Typography my='3%' display='block' variant='p'>Este é um aplicativo para visa auxiliá-lo(a) no acompanhamento da presença da sua turma de EBD. Para começar, você precisa fornecer o código que lhe fora previamente fornecido</Typography>
        <TextField
          placeholder="Insira aqui o seu código"
          autoFocus={true}
          value={inputCode}
          onChange={e=>setInputCode(e.target.value)}
          onKeyDown={e=>e.key === 'Enter'? handleEnterCode() : null}
        />
      </Box>
      <Box>
        <Button
          variant='contained'
          disabled={!inputCode}
          onClick={handleEnterCode}
        >
          Ok
        </Button>
      </Box>
    </Container>
  )
  return (
    <AuthContext.Provider value={state}>
      {
        state.isLogged?
          children
        :
          <LoggedContent/>
      }
    </AuthContext.Provider>
  )
}