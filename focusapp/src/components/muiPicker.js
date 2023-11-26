import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import {DatePicker} from '@mui/lab'
import { useState } from 'react'

export const muiPicker = () => {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    console.log({selectedDate})
    return (
        <Stack spacing={4} sx={{ width: '250px' }}>
            <DatePicker
                label= 'Date Picker'
                renderInput={ (params) => <TextField {...params} />} value={selectedDate} onChange={ (newValue) => { setSelectedDate (newValue)
                }}
            />
        </Stack>
    )
}