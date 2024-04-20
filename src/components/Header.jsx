import React, { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import IconButton from '@mui/material/IconButton'
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ClearIcon from '@mui/icons-material/Clear';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Header({title}) {
    const location = useLocation();
    const navigate = useNavigate();
    const isConfigurationPage = location.pathname == '/configuration'

    function handleSwapConfigs(){
        navigate(
            isConfigurationPage ? -1 : '/configuration'
        )
    }

    return (
        <Stack
            direction='row'
            justifyContent='center'
            sx={{
                boxShadow: 'rgba(0, 0, 0, 0.1) 0px 1px 2px 0px',
                position:'sticky',
                top:0,
                width:'100%',
                height: 48,
                background:'white',
                zIndex:2,
            }}
        >
            <Stack
                direction='row'
                justifyContent='space-between'
                alignItems='center'
                sx={{
                    p:'0 6px',
                    width:'100%',
                    maxWidth:512,
                }}
            >
                <IconButton
                    sx={{
                        margin:'auto 12px'
                    }}
                    onClick={handleSwapConfigs}
                >
                    {
                        isConfigurationPage?
                            <ClearIcon/>
                        :
                            <MoreVertIcon/>
                    }
                </IconButton>
                <Box>{title}</Box>
                <Stack sx={{m:'auto 12px',p:0, display:'flex',justifyContent:'center',flexDirection:'column'}}>
                    <img style={{width:'24px', height:'24px'}} src="assets/imgs/icon-48x48.png"/>
                </Stack>
            </Stack>
        </Stack>
    )
}
