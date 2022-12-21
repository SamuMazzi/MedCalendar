import { Grid, FormControl, InputLabel, Select, MenuItem, Container, Box, TextField, Typography, CircularProgress } from '@mui/material'
import { PersonalCalendar } from '../components/calendar'
import { RootState, useAppDispatch, useAppSelector }  from '../logic/redux/store'
import { setValue, handleSede } from '../logic/redux/turni_slice'
import { useDocumentDataOnce } from 'react-firebase-hooks/firestore';
import { getInfoSediRef } from '../logic/server/firestore';

interface PropsGruppoTurni {
  distretto: string | undefined
}

type mockTurniType = Record<string, string>

export default function GruppoTurni(props: PropsGruppoTurni) {
  const [infoSedi, loading, error] = useDocumentDataOnce(getInfoSediRef(props.distretto ? props.distretto : ""));
  const stateNOre = useAppSelector((state: RootState) => state.turni.value)
  const stateDisponibilita = useAppSelector((state: RootState) => state.turni.disponibilita)
  const stateSedi = useAppSelector((state: RootState) => state.turni.sedi)
  const dispatch = useAppDispatch()
  const mockSedi = ['Sassuolo', 'Formigine', 'Vignola']
  const mockTurni: mockTurniType = {"20:30-8": "1,2,3,4,5", "8-20": "6,7"}

  return (
    <Container>
      <Grid container>
        <Grid item xs={8} md={8}  sx={{py: 2}}>
          <Typography fontWeight="fontWeightBold" variant="h6" component="h6" sx={{py: 2}}>
            {"Numero massimo di ore"}
          </Typography>
          <TextField
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} 
            value={stateNOre}
            onChange={(event) => dispatch(setValue(parseInt(event.target.value !== "" ? event.target.value : "0")))}
            variant="outlined" 
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "20px",
              }
            }}
          />
        </Grid>
        <Grid item xs={8} md={6}>
        <Typography fontWeight="fontWeightBold" variant="h6" component="h6" sx={{py: 2}}>
          {"Seleziona una o più sedi"}
        </Typography>
        <FormControl fullWidth>
          <InputLabel>Sedi</InputLabel>
          <Select
            value={stateSedi}
            multiple={true}
            label="Sedi"
            onChange={(event) => dispatch(handleSede(event.target.value as string[]))}
            sx={{ borderRadius: '20px' }}
          >
            {(infoSedi ? Object.keys(infoSedi.sedi) : mockSedi).map((sede: string) =>
                <MenuItem value={sede} key={sede}>
                  {sede}
                </MenuItem>
              )
            }
          </Select>
        </FormControl>
      </Grid>
          
      </Grid>
      <Typography variant="h5" component="h5" sx={{py: 2}}>
        {"Seleziona le tue disponibilità per Gennaio 2023"}
      </Typography>
      { error && <Typography>{error.message}</Typography>}
      { loading && <CircularProgress />}
      <Grid container sx={{pb: 3}} direction="row">
        { !loading &&
          (infoSedi ? Object.keys(infoSedi.turni) : Object.keys(mockTurni)).map((turno: string, index: number) => 
            <Box key={index} sx={{ borderRadius: '16px', backgroundColor: '#EFEFEF', m: 2, py: 3 }}>
              <Grid container
                  display="flex"
                  direction="column"
                  alignItems="center"
                  justifyContent="center"
                  sx={{minWidth: "200px"}}
                >                    
                <Grid item>
                  <Typography fontWeight="fontWeightRegular" style={{display: 'inline-block'}}><strong>Turno: {turno}</strong></Typography>
                </Grid>
                <Grid item>
                  <PersonalCalendar fasciaTurno={turno} selectableDays={infoSedi ? infoSedi.turni[turno].split(',').map((day: string) => parseInt(day)) : mockTurni[turno].split(',').map((day: string) => parseInt(day))}/>
                </Grid>
                <Grid item>
                  {
                    (stateDisponibilita[turno] !== undefined &&
                      stateDisponibilita[turno].length !== 0) && stateDisponibilita[turno].length + " giorni selezionati"
                  }
                </Grid>
              </Grid>
            </Box>
          )
        }        
      </Grid>
    </Container>
  )
}
