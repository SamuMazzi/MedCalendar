import { SelectChangeEvent } from '@mui/material'
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import Autocomplete from '@mui/material/Autocomplete';
import { createFilterOptions } from '@mui/material/Autocomplete';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import FormHelperText from '@mui/material/FormHelperText';
import { ReactNode } from 'react'

interface PropsListDropdown {
  value: any
  label: string
  inputList: any[],
  onChangeFn: (event: SelectChangeEvent<any>, child: ReactNode) => void
  helperText?: string,
  extraFieldMenuItem?: string,
  multiple?: boolean
}

interface PropsMapDropdown {
    value: any
    label: string
    inputMap: Record<any, any>
    onChangeFn: (event: SelectChangeEvent<any>, child: ReactNode) => void
    helperText?: string
    extraFieldMenuItem?: string
}

export interface PropsGenericDropdown {
  value: any
  label: string
  inputList: any[],
  onChangeFn: (event: SelectChangeEvent<any>, child: ReactNode) => void
  helperText?: string,
  extraFieldMenuItem?: string
  map?: Record<any, any>,
  multiple?: boolean
}

const sxPaper = {
  bgcolor: '#EFEFEF',
  borderRadius: '20px',
  maxHeight: '300px'
}


const getSxDropdown = (placeholder?: string) => {
  const sxDropdown: Record<any, any> = {
    mb: 1,
    backgroundColor: '#EFEFEF',
    borderRadius: '20px',
    boxShadow: 'none',
    '.MuiOutlinedInput-notchedOutline': { border: 0 },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(228, 219, 233, 0.25)',
    },
    '&:focus': {
      borderRadius: 4,
      borderColor: '#80bdff',
      boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
      backgroundColor: "red"
    },
  }
  /* '& .MuiSelect-select .notranslate::after': placeholder
    ? {
      content: `"${placeholder}"`,
      opacity: 0.42,
    }
    : {}, */
  if(placeholder) {
    sxDropdown['& .MuiSelect-select .notranslate::after'] = {
        content: `"${placeholder}"`,
        opacity: 0.42,
      }
  }
  return sxDropdown
}

export function NewMapDropdown(props: PropsMapDropdown) {
  return (
  <GenericDropdown 
    value={props.value}
    label={props.label}
    onChangeFn={props.onChangeFn}
    helperText={props.helperText}
    inputList={Object.keys(props.inputMap)}
    extraFieldMenuItem={props.extraFieldMenuItem}
    map={props.inputMap}
  />)
}

export function NewListDropdown(props: PropsListDropdown) {
  return (
    <GenericDropdown
      value={props.value}
      label={props.label}
      onChangeFn={props.onChangeFn}
      helperText={props.helperText}
      inputList={props.inputList}
      extraFieldMenuItem={props.extraFieldMenuItem}
      multiple={props.multiple}
    />)
}


function GenericDropdown(props: PropsGenericDropdown) {
  return (
    <Grid item>
      <FormControl style={{ width: "230px" }}>
        {
        //  <InputLabel>{props.label}</InputLabel> //! Non si sa perchè ma si bugga
        }
        <Select
          value={props.value}
          //label={props.label}
          placeholder={props.label}
          onChange={props.onChangeFn}
          multiple={props.multiple}
          style={{
            borderColor: props.helperText ? "red" : undefined
          }}
          MenuProps={{
            PaperProps: {
              sx: sxPaper
            },
          }}
          sx={getSxDropdown(props.label)}
        >
          {props.inputList.map((key) => {
            const val = props.map ? props.map[key] : key
            return (
              <MenuItem value={key} key={key}>
                {props.extraFieldMenuItem !== undefined ? val[props.extraFieldMenuItem] : val}
              </MenuItem>)
          })
          }
        </Select>
        <FormHelperText error>
          {props.helperText ? props.helperText : ""}
        </FormHelperText>
      </FormControl>
    </Grid>
  )
}

export interface PropsSearchableDropdown {
  value: any
  label: string
  inputList: any[],
  onChangeFn: (arg0: string | null) => void
  helperText?: string,
  extraFieldMenuItem?: string
  map?: Record<any, any>
}

export interface PropsMapSearchableDropdown {
  value: any
  label: string
  inputMap: Record<any, any>,
  onChangeFn: (arg0: any) => void
  helperText?: string,
  extraFieldMenuItem?: string
}

export function SearchableDropdownMap(props: PropsMapSearchableDropdown) {
  return (
  <SearchableDropdown
    value={props.value}
    label={props.label}
    onChangeFn={props.onChangeFn}
    helperText={props.helperText}
    inputList={Object.keys(props.inputMap)}
    extraFieldMenuItem={props.extraFieldMenuItem}
    map={props.inputMap}
  />)
}

export function SearchableDropdown(props: PropsSearchableDropdown) {
  const getValueFromOption = (option: any) => props.map ? props.extraFieldMenuItem ? props.map[option][props.extraFieldMenuItem] : props.map[option] : option
  const filterOptions = createFilterOptions({
    stringify: (option: any) => getValueFromOption(option),
  });

  return (
    <Grid item>
      <FormControl style={{ width: "230px" }}>
        <Autocomplete
          ListboxProps={{style: {overflow: 'auto'}}}
          filterOptions={filterOptions}
          disablePortal
          id="combo-box"
          options={props.inputList}
          onChange={(event: any, newValue: string | null) => {
            props.onChangeFn(newValue)
          }}
          getOptionLabel={option => getValueFromOption(option)}
          value={props.value}
          renderInput={(params) => <TextField {...params} label="" placeholder={props.label}/>}
          sx={getSxDropdown(props.label)}
          style={{
            borderColor: props.helperText ? "red" : undefined
          }}
          renderOption={(optionProps, option) => {
            return (
              <li {...optionProps}>
                {getValueFromOption(option)}
              </li>
            )
          }}
          PaperComponent={(props: any) => <Paper elevation={5} sx={{
            bgcolor: '#EFEFEF',
            borderRadius: '20px',
          }} {...props} />}
        />
        <FormHelperText error>{props.helperText}</FormHelperText>
      </FormControl>
    </Grid>
  )
}

/*

export function MapDropdownForm(props: PropsMapDropdown) {
  return (
    <Container sx={{py: 1}}>
          <Grid item xs={8} md={6}>
            <FormControl fullWidth>
              <InputLabel>{props.label}</InputLabel>
              <Select
                value={!Object.keys(props.inputMap).includes(props.value) ? "" : props.value}
                label={props.label}
                onChange={props.onChangeFn}
                style={{
                  borderColor: props.helperText ? "red" : undefined
                }}
                sx={{
                  mb: 1,
                  backgroundColor: '#EFEFEF',
                  borderRadius: '20px',
                  boxShadow: 'none',
                  '.MuiOutlinedInput-notchedOutline': { border: 0 },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(228, 219, 233, 0.25)',
                  },
                }}
              >
                {Object.keys(props.inputMap).map((keyMap: string) => {
                  return (
                    <MenuItem value={keyMap} key={keyMap}>
                      { props.extraFieldMenuItem !== undefined ? props.inputMap[keyMap][props.extraFieldMenuItem] : props.inputMap[keyMap] }
                    </MenuItem>)
                  })
                }
              </Select>
              <FormHelperText error>
                {props.helperText}
              </FormHelperText>
            </FormControl>
          </Grid>
    </Container>
  )
}


export function ListDropdownForm(props: PropsListDropdown) {
  return (
    <Container sx={{py: 1}}>
          <Grid item xs={8} md={6}>
            <FormControl fullWidth sx={{minWidth: 130}}>
              <InputLabel>{props.label}</InputLabel>
              <Select
                value={!props.inputList.includes(props.value) ? "" : props.value}
                label={props.label}
                onChange={props.onChangeFn}
                sx={{
                  mb: 1,
                  backgroundColor: '#EFEFEF',
                  borderRadius: '20px',
                  boxShadow: 'none',
                  '.MuiOutlinedInput-notchedOutline': { border: 0 },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(228, 219, 233, 0.25)',
                  },
                }}
              >
                {props.inputList.map((val: any) => {
                  return (
                    <MenuItem value={val} key={val}>
                      {val}
                    </MenuItem>)
                  })
                }
              </Select>
            </FormControl>
          </Grid>
    </Container>
  )
}
*/