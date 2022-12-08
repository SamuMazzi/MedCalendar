import { Grid, FormControl, InputLabel, Select, MenuItem, Box, Container, TextField, Typography, Divider } from '@mui/material'
import { PersonalCalendar } from '../components/calendar'
import { RootState, useAppDispatch,useAppSelector }  from '../logic/store'
import { setValue, handleSede } from '../logic/slice'

export default function GruppoTurni() {
  const fasceTurni: string[] = ["8-20", "20-8"]
  const listSedi = ['Sassuolo', 'Formigine', 'Vignola']
  const stateNOre = useAppSelector((state: RootState) => state.turni.value)
  const stateDisponibilita = useAppSelector((state: RootState) => state.turni.disponibilita)
  const stateSedi = useAppSelector((state: RootState) => state.turni.sedi)
  const dispatch = useAppDispatch()

  /* const styleModal = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    //backgroundColor: 'white'
  }; */

  return (
    <Container>
      <Grid container style={{minWidth: 120}}>
        <Grid item xs={8} md={8}  sx={{py: 2}}>
          <FormControl fullWidth style={{minWidth: 120}}>
            <TextField
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} 
              placeholder="N° massimo di ore" 
              label='N° massimo di ore'
              value={stateNOre}
              onChange={(event) => dispatch(setValue(parseInt(event.target.value !== "" ? event.target.value : "0")))}
              variant="outlined" />
          </FormControl>
        </Grid>
        <Grid item xs={8} md={6}>
        <FormControl fullWidth style={{minWidth: 120}}>
          <InputLabel>Sede</InputLabel>
          <Select
            value={stateSedi}
            multiple={true}
            label="Sedi"
            onChange={(event) => dispatch(handleSede(event.target.value as string[]))}
          >
            {listSedi.map((sede: string) => {
              return (
                <MenuItem value={sede} key={sede}>
                  {sede}
                </MenuItem>)
              })
            }
          </Select>
        </FormControl>
      </Grid>
          
      </Grid>
      <Container sx={{py: 5}}>
        {
          fasceTurni.map((val: string, index: number) => 
            <Container key={index}>
              <Grid container 
                //justifyContent="flex-start"
                //alignItems="center"
                //style={{ minHeight: '100vh' }}
              
              >                    
                <Grid item>
                  <Typography fontWeight="fontWeightRegular"><strong>Turno:</strong> {val}</Typography>
                </Grid>
                <Grid item>
                  <Divider variant="middle" />
                </Grid>
              </Grid>
              <PersonalCalendar fasciaTurno={val}/>
              <Grid item xs={8} md={8} sx={{py: 2}}>
                {
                  (stateDisponibilita[val] !== undefined &&
                    stateDisponibilita[val].length !== 0) && "Hai scelto i seguenti giorni: " + stateDisponibilita[val].join(', ')
                }
              </Grid>
            </Container>
          )
        }        
      </Container>
    </Container>
  )
}
