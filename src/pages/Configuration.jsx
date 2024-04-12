import React, {useState} from 'react'
import { useLoaderData, useNavigate } from 'react-router'
import useSheets from '../hooks/sheets'
import ShareIcon from '@mui/icons-material/Share';
import LogoutIcon from '@mui/icons-material/Logout';
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import {baseurl} from '../data.json'

export default function Configuration() {
  const [showDialog, setShowDialog] = useState(false)
  const {name, className, code, theme} = useLoaderData()
  const navigate = useNavigate()
  return (
    <Stack
      alignItems='stretch'
      spacing={3}
      sx={{
        m:3
      }}
    >
      <TextField
        variant='standard'
        value={name}
        label='Nome'
        InputProps={{
          readOnly: true,
        }}
      />
      <TextField
        variant='standard'
        value={code}
        label='Código de acesso'
        InputProps={{
          readOnly: true,
        }}
      />
      <TextField
        variant='standard'
        value={className}
        label='Classe'
        InputProps={{
          readOnly: true,
        }}
      />
      <TextField
        variant='standard'
        value={theme}
        label='Tema'
        InputProps={{
          readOnly: true,
        }}
      />
        <Button>
          <Stack
            direction='row'
            color='blue'
            spacing={1}
            >
              <ShareIcon/>
              <Typography>Compartilhar</Typography>
          </Stack>
        </Button>
        <Button onClick={()=>setShowDialog(true)}>
          <Stack
            direction='row'
            color='red'
            spacing={1}
          >
            <LogoutIcon/>
            <Typography>Sair</Typography>
          </Stack>
        </Button>
        <Dialog
          open={showDialog}
        >
          <Stack
            p={2}
            spacing={1}
          >
            <Typography>Tem certeza que deseja sair?</Typography>
            <Stack direction='row' justifyContent='center'>
              <Button onClick={()=>setShowDialog(false)}>Cancelar</Button>
              <Button sx={{color:'red'}} onClick={()=>{localStorage.clear();navigate(baseurl + '/login')}}>Ok</Button>
            </Stack>
          </Stack>
        </Dialog>
    </Stack>
  )
}

export async function loader(){
  const sheets = useSheets()
  const {message: {name, id: userId, group: className, theme}} = await sheets.getUserInfo()
  return {
    code: `${sheets.apiKey}.${sheets.userId}`,
    name,
    className,
    theme
  }
}