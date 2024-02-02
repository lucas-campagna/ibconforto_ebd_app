import React from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { useNavigate } from "react-router-dom";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';

export default function HomeFooter({prev, next, hasNext, current}) {
    const navigate = useNavigate();
    return (
        <Box
            sx={{
                boxShadow: 'rgba(0, 0, 0, 0.1) 0px -1px 2px 0px',
                position:'sticky',
                bottom: -1,
                left:0,
                height: 48,
                zIndex: 2,
                background:'white',
                width:'100%',
                display:'flex',
                justifyContent:'center'
            }}
            >
            <Box
                sx={{
                    p:'0 6px',
                    display:'flex',
                    justifyContent:'space-around',
                    alignItems: 'center',
                    width:'100%',
                    maxWidth:512,
                }}
            >
                <Button variant='contained' disabled={!prev} onClick={()=>navigate(`?date=${prev}`)}>
                    <NavigateBeforeIcon />
                </Button>
                <Typography>{formatDate(current)}</Typography>
                <Button variant='contained' disabled={!hasNext} onClick={()=>navigate(`?date=${next}`)}>
                    <NavigateNextIcon/>
                </Button>
            </Box>
        </Box>
    )
}

const formatDate = date => {const fDate = dateFromStr(date); return `${padZeros(fDate.getDate())}/${padZeros(fDate.getMonth()+1)}/${padZeros(fDate.getFullYear())}`};
const dateFromStr = date => new Date(date);
const padZeros = (s,n=2) => String(s).padStart(n,'0')
