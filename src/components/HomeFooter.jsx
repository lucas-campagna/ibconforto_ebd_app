import React from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { Link } from "react-router-dom";

export default function HomeFooter({prev, next, hasNext, current}) {
    
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
                    justifyContent:'space-between',
                    alignItems: 'center',
                    width:'100%',
                    maxWidth:512,
                }}
            >
                <DateButton date={prev}/>
                <Button disabled={true}>{formatDate(current)}</Button>
                <DateButton date={next} disabled={!hasNext}/>
            </Box>
        </Box>
    )
}

const DateButton = ({date, disabled, ...props}) => date?
    (
        disabled?
        <Button disabled={disabled} {...props}>{formatDate(date)}</Button>
        :
        <Link to={`?date=${date}`}><Button {...props}>{formatDate(date)}</Button></Link>
    )
    :
    <Button/>

const formatDate = date => {const fDate = dateFromStr(date); return `${padZeros(fDate.getDate())}/${padZeros(fDate.getMonth()+1)}/${padZeros(fDate.getFullYear())}`};
const dateFromStr = date => new Date(date);
const padZeros = (s,n=2) => String(s).padStart(n,'0')
