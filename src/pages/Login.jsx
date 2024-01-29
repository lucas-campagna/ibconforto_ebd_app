import React, {useEffect, useState} from 'react'
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
  logging: {level: 0,message: 'Validando...'},
  entering: {level: 1,message: 'Entrando...'},
  loginError:{level: 2,message:'Código inválido', loading: false}
}

export default function Login() {
  const submit = useSubmit();
  const code = useLoaderData()
  const stateFromAction = useActionData() || 'idle';
  const [state, setState] = useState(stateFromAction);
  if(loadingDialogStates[stateFromAction].level > loadingDialogStates[state].level) setState(stateFromAction)
  const [inputCode, setInputCode] = useState(code);
  const navigate = useNavigate();
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
        <Typography my='3%' display='block' variant='p'>Este é um aplicativo para visa auxiliá-lo(a) no acompanhamento da presença da sua turma de EBD. Para começar, você precisa fornecer o código que lhe fora previamente fornecido</Typography>
      </Box>
      <Form
        method='post'
        onSubmit={e=>{
          setState('logging')
          submit(e.currentTarget)
        }}
      >
        <Stack
          flexDirection='column'
          spacing={3}
          alignItems='baseline'
        >
          <TextField
            placeholder="Insira aqui o seu código"
            autoFocus={true}
            value={inputCode}
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
      <LoadingDialog {...loadingDialogStates[state]} onClick={()=>navigate('/login')}/>
    </Container>
  )
}

export function loginLoader({request}){
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const sheets = useSheets()
  return sheets ? redirect('/') : code
}

export async function loginAction({request}){
  const formData = await request.formData()
  try{
    const code = formData.get('code')
    const [apiKey, userId] = code.split('.')
    const sheets = await useSheets(apiKey, userId)
    if(!sheets)
      return 'loginError'
  }
  catch{
    return 'idle'
  }
  return 'entering'
}
