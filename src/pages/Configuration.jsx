import { Input, Stack, TextField, Typography } from '@mui/material'
import React from 'react'
import { useLoaderData } from 'react-router'
import useSheets from '../hooks/sheets'

export default function Configuration() {
  const {name, className, code} = useLoaderData()
  return (
    <Stack
      alignItems='start'
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
        value={className}
        label='Classe'
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
    </Stack>
  )
}

export async function loader(){
  const sheets = useSheets()
  const {message: {name, id: userId, group: className}} = await sheets.getUserInfo()
  return {
    code: `${sheets.apiKey}.${sheets.userId}`,
    name,
    className
  }
}