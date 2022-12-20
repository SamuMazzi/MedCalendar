import { Grid, FormControl, InputLabel, Select, MenuItem, Container, SelectChangeEvent } from '@mui/material'
import { ReactNode } from 'react'

export interface PropsMapDropdown {
    value: any
    label: string
    inputMap: Record<any, any>,
    onChangeFn: (event: SelectChangeEvent<any>, child: ReactNode) => void
}

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
              >
                {Object.keys(props.inputMap).map((keyMap: string) => {
                  return (
                    <MenuItem value={keyMap} key={keyMap}>
                      {props.inputMap[keyMap]}
                    </MenuItem>)
                  })
                }
              </Select>
            </FormControl>
          </Grid>
    </Container>
  )
}

export interface PropsListDropdown {
  value: any
  label: string
  inputList: any[],
  onChangeFn: (event: SelectChangeEvent<any>, child: ReactNode) => void
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
