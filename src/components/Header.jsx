import React from 'react'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ClearIcon from '@mui/icons-material/Clear';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Header() {
    const location = useLocation();
    const navigate = useNavigate();

    function handleSwapConfigs(){
        navigate(
            location.pathname == '/configuration' ?
            -1
            :
            '/configuration'
        )
    }

    return (
        <Box sx={{
            boxShadow: 'rgba(0, 0, 0, 0.1) 0px 1px 2px 0px',
            position:'sticky',
            top: -1,
            left:0,
            height: 48,
            background:'white',
            width:'100%',
            display:'flex',
            justifyContent:'center',
            zIndex:2,
        }}>
            <Box sx={{
                p:'0 6px',
                display:'flex',
                justifyContent:'space-between',
                alignItems: 'center',
                width:'100%',
                maxWidth:512,
            }}>
                <IconButton
                    sx={{
                        margin:'auto 12px'
                    }}
                    onClick={handleSwapConfigs}
                >
                    {
                        location.pathname == '/configuration' ?
                            <ClearIcon/>
                        :
                            <MoreVertIcon/>
                    }
                </IconButton>
                <Box sx={{m:'auto 12px',p:0, display:'flex',justifyContent:'center',flexDirection:'column'}}>
                <img style={{width:'24px', height:'24px'}} src="logo-ibc.png"/>
                </Box>
            </Box>
        </Box>
    )
}