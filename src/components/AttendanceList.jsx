import React, {useEffect, useState} from 'react'
import Stack from '@mui/material/Stack'
import CheckButtom from '../components/CheckButtom'
import Button from '@mui/material/Button'
import PlusOneIcon from '@mui/icons-material/PlusOne';

export default function AttendanceList({list, onChanged}){
    onChanged = onChanged || (()=>null)
    const [modifiedList, setModifiedList] = useState(list);
    function handleNameClick(name){
        const newList = {...modifiedList}
        newList[name] = !newList[name]
        onChanged(newList)
        setModifiedList(newList)
    }
    useEffect(()=>{
      setModifiedList(list)
    }, [list])
    return (
      <Stack
        direction='column'
        spacing={1}
        sx={{
          mt:1,
          mb:6,
          maxWidth:375,
        }}
      >
      {
        modifiedList?
        Object.entries(modifiedList).map(
          ([name, present],i)=>
            <CheckButtom
              key={i}
              name={name}
              checked={present}
              onClick={handleNameClick}
            />
        )
        :
        <></>
      }
      {/* <Button variant='outlined' sx={{height:'54px'}}><PlusOneIcon/></Button> */}
      </Stack>
    )
  }