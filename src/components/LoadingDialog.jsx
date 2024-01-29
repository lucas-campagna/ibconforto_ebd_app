import React from 'react'
import Dialog from '@mui/material/Dialog'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress';
import { Button } from '@mui/material';

export default function LoadingDialog({message, loading, onClick}) {
  loading = loading === undefined ? true : loading
  const visible = message ? true  : false
  return (
    <Dialog
        open={visible}
      >
        <Stack
          direction='column'
          alignItems='center'
          spacing={1}
          sx={{
            m:1
          }}
        >
          <Typography>{message}</Typography>
          {
            loading ?
            <CircularProgress/>
            :
            <Button autoFocus={true} onClick={onClick}>Ok</Button>
          }
        </Stack>
      </Dialog>
  )
}
