




import React from 'react'; 
import {useEffect, useState} from 'react';    
import Container from '@mui/material/Container';  
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper'; 
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Tooltip from '@mui/material/Tooltip';

export default function InputWrapper(props) {

    const {fieldData} = props;
    const [value, setValue] = useState("");

    useEffect(()=>{  
        console.log("fieldData:", fieldData);
    }, [fieldData]);

    const handleFieldChange = (event) => {
        setValue(event.target.value);
        fieldData.value.value = event.target.value;
    };

    return  <Tooltip title={fieldData.description}>
                <TextField id="outlined-basic" 
                        label={fieldData.display_name}
                        variant="outlined" 
                        size="small"
                        value={fieldData.value.value}
                        onChange={handleFieldChange}
                        fullWidth 
                        InputProps={{
                            endAdornment:<InputAdornment position="end">{fieldData.units}</InputAdornment>
                        }}
                />
            </Tooltip>

}