import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import { PersonalCalendar } from '../components/calendar'
import { useAppDispatch, useAppSelector }  from '../logic/redux/store'
import { setOreMassime, handleSede } from '../logic/redux/turni_slice'
import { getInfoSediDistretto, RemoteSediInfo } from '../logic/server/firestore';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { NewListDropdown } from './form_dropdown'
import { capitalizeFirstLetter } from '../logic/local_storage'

interface PropsGruppoTurni {
  distretto: string | undefined
}

type mockTurniType = Record<string, string>
const mockSedi = ['Sassuolo', 'Formigine', 'Vignola']
const mockTurni: mockTurniType = {"20:30-8": "1,2,3,4,5", "8-20": "6,7"}

export default function GruppoTurni(props: PropsGruppoTurni) {
  const stateTurni = useAppSelector((state) => state.turni)
  const predefinedSediUser = useAppSelector((state) => state.auth.sedi)
  const authState = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(false)
  const [messageError, setMessageError] = useState("")
  const [infoSedi, setInfoSedi] = useState<RemoteSediInfo>()
  const router = useRouter()

  const getInfoSedi = async () => {
    setLoading(true)
    if(props.distretto === undefined) {
      router.replace('/')
      return
    }
    try {
      const data: RemoteSediInfo = await getInfoSediDistretto(props.distretto)
      setInfoSedi(data)
    } catch(e: any) {
      setMessageError("C'è stato un errore, riprovare.\nErrore: " + e.toString())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log(predefinedSediUser)
    console.log(authState)
    if (predefinedSediUser.length > 0) {
      console.log('set def')
      dispatch(handleSede(predefinedSediUser.map(el => capitalizeFirstLetter(el))))
    }
    getInfoSedi()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    messageError ? <Grid container>
      <Grid item sx={{py: 3}}>
        <Typography style={{fontWeight: "bold", fontSize: 30}}>Errore</Typography>
        <Typography style={{whiteSpace: "pre-line"}}>{messageError}</Typography>
      </Grid>
    </Grid> :
    <>
      <Grid container direction="column">
        <Grid item sx={{py: 2}}>
          <Typography fontWeight="fontWeightBold" variant="h6" component="h6" sx={{py: 2}}>
            {"Numero massimo di turni"}
          </Typography>
          <TextField
            label=''
            placeholder='Turni'
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} 
            value={stateTurni.oreMassime !== 0 ? stateTurni.oreMassime : ""}
            onChange={(event) => dispatch(setOreMassime(parseInt(event.target.value !== "" ? event.target.value : "0")))}
            variant="outlined"
            sx={{
              minWidth: 130
            }}
          />
        </Grid>
        <Grid item>
        <Typography fontWeight="fontWeightBold" variant="h6" component="h6" sx={{py: 2}}>
          {"Seleziona una o più sedi"}
        </Typography>
        {
          infoSedi && 
          <NewListDropdown 
              value={stateTurni.sedi}
              label="Sedi"
              multiple={true}
              onChangeFn={(event) => dispatch(handleSede(event.target.value as string[]))}
              inputList={Object.keys(infoSedi.sedi)}
          />
        }
      </Grid>
          
      </Grid>
      <Typography fontWeight="fontWeightBold" variant="h6" component="h6" sx={{ py: 2 }}>
        {"Seleziona le tue disponibilità per Gennaio 2023"}
      </Typography>
      { loading && <CircularProgress />}
      <Grid container sx={{pb: 3}} direction="row">
        { !loading && infoSedi &&
          Object.keys(infoSedi.turni).map((turno: string, index: number) => 
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
                  <PersonalCalendar fasciaTurno={turno} selectableDays={infoSedi.turni[turno].split(',').map((day: string) => (parseInt(day) % 7))}/>
                </Grid>
                <Grid item>
                  {
                    (stateTurni.disponibilita[turno] !== undefined &&
                      stateTurni.disponibilita[turno].length !== 0) && stateTurni.disponibilita[turno].length + " giorni selezionati"
                  }
                </Grid>
              </Grid>
            </Box>
          )
        }
      </Grid>
    </>
  )
}
