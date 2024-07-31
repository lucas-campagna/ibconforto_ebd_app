import React, {useEffect, useState} from 'react'
import Stack from '@mui/material/Stack'
import CheckButtom from '../components/CheckButtom'
import Button from '@mui/material/Button'
import PlusOneIcon from '@mui/icons-material/PlusOne';

export default function AttendanceList({list, onChanged, canEdit}){
    onChanged = onChanged || (()=>null)
    const [modifiedList, setModifiedList] = useState(list);
    function handleNameClick(i){
        const newList = [...modifiedList.slice(0, i), {name: modifiedList[i].name, status: !modifiedList[i].status}, ...modifiedList.slice(i+1)]
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
        modifiedList.map(
          ({name, status},i)=>
            <CheckButtom
              key={i}
              name={name}
              checked={status}
              onClick={() => handleNameClick(i)}
              canEdit={canEdit}
            />
        )
      }
      {/* <Button variant='outlined' sx={{height:'54px'}}><PlusOneIcon/></Button> */}
      </Stack>
    )
  }