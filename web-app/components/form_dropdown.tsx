import { SelectChangeEvent } from '@mui/material'
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/Select';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
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

export function NewMapDropdown(props: PropsMapDropdown) {
  // !Object.keys(props.inputMap).includes(props.value) ? "" :
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
          onChange={props.onChangeFn}
          multiple={props.multiple}
          style={{
            borderColor: props.helperText ? "red" : undefined
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                bgcolor: '#EFEFEF',
                borderRadius: '20px',
                maxHeight: '300px'
              },
            },
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
            '&:focus': {
              borderRadius: 4,
              borderColor: '#80bdff',
              boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
              backgroundColor: "red"
            },
          }}
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