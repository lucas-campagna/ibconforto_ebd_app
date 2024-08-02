import React from 'react'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { useNavigate } from "react-router-dom";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';

export default function HomeFooter({prev, next, current, onPrevClick, onNextClick}) {
    const hasPrev = !prev
    const hasNext = !next
    return (
        <Stack
            direction='row'
            justifyContent='center'
            sx={{
                boxShadow: 'rgba(0, 0, 0, 0.1) 0px -1px 2px 0px',
                position:'absolute',
                bottom:0,
                width:'100vw',
                height: 48,
                zIndex: 20,
                background:'white',
            }}
            >
            <Stack
                justifyContent='space-around'
                alignItems='center'
                direction='row'
                sx={{
                    p:'0 6px',
                    width:'100%',
                    maxWidth:512,
                }}
            >
                <Button variant='contained' disabled={hasPrev} onClick={onPrevClick}>
                    <NavigateBeforeIcon />
                </Button>
                <Typography>{current}</Typography>
                <Button variant='contained' disabled={hasNext} onClick={onNextClick}>
                    <NavigateNextIcon/>
                </Button>
            </Stack>
        </Stack>
    )
}