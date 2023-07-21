 
import React from 'react'; 
import {useEffect, useState } from 'react';    
import InputAccordion from "../../../components/InputAccordion/InputAccordion";
import FlowsheetOptions from "../../../components/FlowsheetOptions/FlowsheetOptions";
import { loadConfig, listConfigNames }  from '../../../services/output.service.js'
import { useParams } from "react-router-dom";
import { deleteConfig }  from '../../../services/input.service.js'
import { Button, Box, Modal, Select, Stack, Toolbar, Tooltip } from '@mui/material';
import { Grid, InputLabel, MenuItem, FormControl } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';





export default function ConfigInput(props) {
    let params = useParams(); 
    const { flowsheetData, updateFlowsheetData, reset, solveType } = props; 
    const [ displayData, setDisplayData ] = useState({}) 
    const [ previousConfigs, setPreviousConfigs ] = useState([]) 
    const [ configName, setConfigName ] = React.useState("");
    const [ openDeleteConfig, setOpenDeleteConfig] = useState(false)
    const [ openErrorMessage, setOpenErrorMessage ] = useState(false);
    const [ disableRun, setDisableRun ] = useState(false)

    const modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
      };
      

    useEffect(()=>{
        setDisplayData(JSON.parse(JSON.stringify(flowsheetData.inputData)))
        listConfigNames(params.id, flowsheetData.inputData.version)
        .then(response => {
            if (response.status === 200) {
                response.json()
                .then((data)=>{
                  setPreviousConfigs(data)
                  if(data.includes(flowsheetData.name)) {
                    setConfigName(flowsheetData.name)
                  }
                }).catch((err)=>{
                    console.error("unable to get list of config names: ",err)
                })
            }
        else {
            console.error("unable to get list of config names: ",response.statusText)
        }
        })
    }, [flowsheetData.inputData]);

    useEffect(()=>{
        if (solveType === "solve") setDisableRun(false)
        else {
            let tempDisableRun = true
            for(let each of Object.keys(flowsheetData.inputData.model_objects)) {
                let modelObject = flowsheetData.inputData.model_objects[each]
                if(modelObject.is_sweep) {
                    tempDisableRun = false
                    break
                }
            }
            setDisableRun(tempDisableRun)
        }

    }, [flowsheetData.inputData, solveType]);
 
    const handleConfigSelection = (event) => {
        const {
          target: { value },
        } = event;
  
        loadConfig(params.id, value)
        .then(response => response.json())
        .then((data)=>{
            let tempFlowsheetData = {...flowsheetData}
            tempFlowsheetData.name = value
            tempFlowsheetData.outputData = data.outputData
            tempFlowsheetData.inputData = data.inputData
            let tempData = {}
            Object.assign(tempData, tempFlowsheetData.inputData)
            setDisplayData({...tempData})
            updateFlowsheetData(tempFlowsheetData,"UPDATE_CONFIG")
            setConfigName(value);
        }).catch((err)=>{
            console.error("unable to get load config: ",err)
        });
        
      };

    const handleDelete = () => {
        console.log('deleting id=',params.id,'name=',configName)
        deleteConfig(params.id, configName)
        .then(response => response.json())
        .then((data)=>{
            console.log('returned data (configs) ',data)
          setConfigName("");
          setPreviousConfigs(data)
          setOpenDeleteConfig(false)
        }).catch((err)=>{
            console.error("unable to get load config: ",err)
            setOpenDeleteConfig(false)
        });
    }

    const handleUpdateDisplayValue = (id, value) => {
        let tempFlowsheetData = {...flowsheetData}
        let previousValue = tempFlowsheetData.inputData.model_objects[id].value
        console.log('updating '+id+' with value '+value+'. previous value was '+previousValue)
        tempFlowsheetData.inputData.model_objects[id].value = value
    }

    const handleUpdateFixed = (id, value, type) => {
        let tempFlowsheetData = {...flowsheetData}
        tempFlowsheetData.inputData.model_objects[id].fixed = value
        if(type==="sweep") tempFlowsheetData.inputData.model_objects[id].is_sweep = true
        else tempFlowsheetData.inputData.model_objects[id].is_sweep = false
        updateFlowsheetData(tempFlowsheetData, null)

        
    }

    const handleUpdateBounds = (id, value, bound) => {
        let tempFlowsheetData = {...flowsheetData}
        tempFlowsheetData.inputData.model_objects[id][bound] = value
    }

    const handleUpdateSamples = (id, value) => {
        let tempFlowsheetData = {...flowsheetData}
        tempFlowsheetData.inputData.model_objects[id].num_samples = value
        console.log('updating samples '+id+' with value '+value+ ' '+tempFlowsheetData.inputData.model_objects[id].num_samples)
    }
    /**
     * Organize variables into sections by their 'category' attribute.
     *
     * @returns Object {<category-name>: [list, of, variable, objects]}
     */
    const organizeVariables = (bvars) => {
        let var_sections = {}
        for (const [key, v] of Object.entries(bvars)) {
            let catg = v.input_category
            let is_input = v.is_input
            let is_output = v.is_output
            // console.log("key",key)

            if (catg === null) {
                catg = ""
            }
            if (!Object.hasOwn(var_sections, catg)) {
                var_sections[catg] = {display_name: catg, variables: {}, input_variables:{}, output_variables:{} }
            }
            var_sections[catg]["variables"][key] = v
            if(is_input) var_sections[catg]["input_variables"][key] = v;
            if(is_output) var_sections[catg]["output_variables"][key] = v;

            //round values for input 
            try {
                let roundedValue
                if(v.rounding != null) {
                    if (v.rounding > 0) {
                        roundedValue = parseFloat((Number(v.value)).toFixed(v.rounding))
                    } else if (v.rounding === 0) 
                    {
                        roundedValue = Math.round(Number(v.value))
                    }
                    else // if rounding is negative
                    {
                        let factor = 10 ** (-v.rounding)
                        roundedValue = Math.round((Number(v.value) / factor)) * factor
                    }
                }else // if rounding is not provided, just use given value 
                {
                    roundedValue = v.value
                }
                var_sections[catg]["variables"][key].value = roundedValue
                if(is_input) var_sections[catg]["input_variables"][key].value = roundedValue;
                if(is_output) var_sections[catg]["output_variables"][key].value = roundedValue;
            } catch (e) {
                console.error('error rounding input for: ',v)
                console.error(e)
            }
            
        }
        return var_sections
    }

    const renderInputAccordions = () => {
        try {
            if(Object.keys(displayData).length > 0) {
                let var_sections = organizeVariables(displayData.model_objects)
                return Object.entries(var_sections).map(([key, value])=>{
                    let _key = key + Math.floor(Math.random() * 100001);
                    if(Object.keys(value.input_variables).length > 0) {
                        return (<Grid item xs={6} key={_key}>
                            <InputAccordion 
                                handleUpdateDisplayValue={handleUpdateDisplayValue} 
                                handleUpdateFixed={handleUpdateFixed} 
                                handleUpdateBounds={handleUpdateBounds} 
                                handleUpdateSamples={handleUpdateSamples} 
                                data={value}
                                solveType={solveType}
                                />
                        </Grid>)
                    }
                })
            }
        } catch (e) {
            // version of data is likely wrong
            // should we delete this data automatically? 
            // for now just output an error. the user will have the ability to delete this record
            console.error('unable to display this data, likely an incorrect version of data')
            console.error(e)
        }
        
    };

    return ( 
        <>
            <Toolbar spacing={2}>
                <Stack direction="row" spacing={2}>
                    {previousConfigs.length > 0 && 
                    <>
                    <InputLabel style={{paddingTop:"8px"}} id="previous-configs-label">Previous Configurations:</InputLabel>
                    <FormControl sx={{ width: 200 }}>
                        {/* <InputLabel id="previous-configs-label">Previous Configs</InputLabel> */}
                        <Select
                        labelId="previous-configs-label"
                        id="previous-configs-select"
                        value={configName}
                        onChange={handleConfigSelection}
                        // MenuProps={MenuProps}
                        size="small"
                        >
                        {previousConfigs.map((name) => (
                            <MenuItem
                            key={name}
                            value={name}
                            // style={getStyles(name, personName, theme)}
                            >
                            {name}
                            </MenuItem>
                        ))}
                        </Select>
                    </FormControl>
                    </>
                    }
                    {configName.length > 0 &&
                    <Button variant="outlined" color="error" startIcon={<DeleteForeverIcon />} onClick={() => setOpenDeleteConfig(true)}>Delete</Button>
                    }

                </Stack>
                <Box sx={{ flexGrow: 1 }}>
                
                </Box>
                <Stack direction="row" spacing={2}>
                    {/* <Button variant="outlined" startIcon={<SaveIcon />} onClick={()=>updateFlowsheetData(flowsheetData.inputData,null)}>UPDATE FLOWSHEET</Button> */}
                    
                    <Button variant="outlined" startIcon={<RefreshIcon />} onClick={reset}>RESET FLOWSHEET</Button>
                    <Tooltip title={disableRun ? "To run a sweep, at least one variable must be set to sweep" : ""}>
                        <div>
                        <Button variant="contained" onClick={()=>updateFlowsheetData(flowsheetData.inputData,solveType)} disabled={disableRun}>RUN</Button>
                        </div>
                    </Tooltip>
                </Stack>
            </Toolbar>
                
            <Grid container spacing={2} alignItems="flex-start">
                <Grid item xs={6} key="flowsheet-options">
                    <FlowsheetOptions data={flowsheetData.inputData} />
                </Grid>
            </Grid>

            <Grid container spacing={2} alignItems="flex-start">
                {
                    renderInputAccordions()
                }
            </Grid>
                <Modal
                    open={openDeleteConfig}
                    onClose={() => setOpenDeleteConfig(false)}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Grid container sx={modalStyle} spacing={1}>
                        <Grid item xs={12}>
                            <Box justifyContent="center" alignItems="center" display="flex">
                                <p>Are you sure you want to delete {configName}?</p>
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <Box justifyContent="center" alignItems="center" display="flex">
                                <Button onClick={() => handleDelete()} variant="contained" color="error">Delete</Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Modal>
        </>
         
      
    );
  
}
 