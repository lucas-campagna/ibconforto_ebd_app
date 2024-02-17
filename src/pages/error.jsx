import React, {useEffect} from 'react'
import { useNavigate } from 'react-router'

export default function Error() {
    const navigate = useNavigate()
    useEffect(()=>navigate('/'), []);
    return null;
}''