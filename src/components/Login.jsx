import React, {useState} from 'react'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import TextField from '@mui/material/TextField'
import Link from '@mui/material/Link'

export default function Login({children}) {
  const [code, setCode] = useState('');
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
          value={code}
          onChange={e=>setCode(e.target.value)}
        />
      </Box>
      <Box>
        <Button
          variant='contained'
          disabled={!code}
          href={`/code=${code}`}
        >
          Ok
        </Button>
      </Box>
    </Container>
  )
}