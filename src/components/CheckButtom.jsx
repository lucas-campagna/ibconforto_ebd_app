import React from 'react'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Typography from '@mui/material/Typography'

export default function CheckButtom({name, checked, onClick, canEdit}) {
  return (
    <Button
      disabled={!canEdit}
      sx={{
        display:'flex',
        justifyContent:'space-between',
      }}
      variant={checked?'contained':'outlined'}
      onClick={onClick}
      >
      <Typography noWrap={true}>{name}</Typography>
      <Checkbox
        sx={{
          visibility:(canEdit?'visible':'hidden'),
          color:'#0072BC',
          '&.Mui-checked':{
          color: 'white',
        }
        }}
        checked={checked}
      />
    </Button>
  )
}
