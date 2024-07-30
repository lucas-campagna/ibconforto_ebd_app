import React, {useEffect, useState, useRef} from 'react'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Container from '@mui/material/Container'
import TextField from '@mui/material/TextField'
import Slide from '@mui/material/Slide'
import { useSearchParams, useNavigate, useLocation, useSubmit, redirect, Form, useActionData, useLoaderData } from 'react-router-dom'
import useSheets from '../hooks/sheets'
import LoadingDialog from '../components/LoadingDialog'

const loadingDialogStates = {
  idle: {},
  logging: {message: 'Validando...'},
  entering: {message: 'Entrando...'},
  loginError:{message:'Código inválido', loading: false}
}

export default function Login() {
  const submit = useSubmit();
  const {code} = useLoaderData()
  const stateFromAction = useActionData() || 'idle';
  const [state, setState] = useState(stateFromAction);
  const formRef = useRef()
  // if(loadingDialogStates[stateFromAction].level > loadingDialogStates[state].level) setState(stateFromAction)
  const [inputCode, setInputCode] = useState(code);
  // const navigate = useNavigate();
  useEffect(()=>{
    if(stateFromAction != state)
      setState(stateFromAction)
  },[stateFromAction]);
  useEffect(()=>{
    if(code) {
      // console.log(formRef.current)
      // submit(formRef.current)
    }
  }, [])
  return (
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
      <Box my='40px'>
        {/* <Slide in={show} direction='right' timeout={400}> */}
          <Typography my='3%' display='block' variant='p'>Olá, caro(a) professor(a)!</Typography>
        {/* </Slide> */}
        <Typography my='3%' display='block' variant='p'>Este é um aplicativo que visa auxiliá-lo(a) no acompanhamento da presença da sua turma de EBD. Para começar, você precisa fornecer o código previamente fornecido pela organização.</Typography>
      </Box>
      <Form
        method='post'
        onSubmit={e=>{
          setState('logging')
          submit(e.currentTarget)
        }}
        ref={formRef}
      >
        <Stack
          flexDirection='column'
          spacing={3}
          alignItems='baseline'
        >
          <TextField
            placeholder="Insira aqui o seu código"
            autoFocus={true}
            value={inputCode || ''}
            onChange={e=>setInputCode(e.target.value)}
            name='code'
          />
          <Button
            variant='contained'
            disabled={!inputCode}
            type='submit'
          >
            Entrar
          </Button>
        </Stack>
      </Form>
      <LoadingDialog {...loadingDialogStates[state]} onClick={()=>setState('idle')}/>
    </Container>
  )
}

export async function loginLoader({request}){
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const sheets = useSheets()
  if (code) {
    if (sheets) {
      sheets.logout()
    }
    return {code}
  }
  if (sheets && await sheets.isValidUser()) {
    return redirect('/')
  }
  return {}
}

export async function loginAction({request}){
  const formData = await request.formData()
  try{
    const code = formData.get('code')
    const [apiKey, ...userIds] = code.split('.')
    const sheets = useSheets(apiKey, userIds[0])
    if(!sheets)
      return 'loginError'
    userIds.forEach(userId => sheets.addUserId(userId))
  }
  catch{
    return 'idle'
  }
  return 'entering'
}
