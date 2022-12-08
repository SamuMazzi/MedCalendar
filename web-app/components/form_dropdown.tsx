import { Grid, FormControl, InputLabel, Select, MenuItem, Container, SelectChangeEvent } from '@mui/material'
import { RootState, useAppDispatch,useAppSelector }  from '../logic/store'
import { setMese, setMedico } from '../logic/slice'
import { ReactNode } from 'react'

export interface PropsMapDropdown {
    value: any
    label: string
    inputMap: Record<any, any>,
    onChangeFn: (event: SelectChangeEvent<any>, child: ReactNode) => void
}

export default function MapDropdownForm(props: PropsMapDropdown) {
  return (
    <Container sx={{py: 1}}>
          <Grid item xs={8} md={6}>
            <FormControl fullWidth style={{minWidth: 120}}>
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
