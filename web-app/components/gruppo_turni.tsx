import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import { PersonalCalendar, SelectMeseCalendar } from '../components/calendar'
import { useAppDispatch, useAppSelector }  from '../logic/redux/store'
import { setOreMassime, handleSede, setMese, clearDisponibilita } from '../logic/redux/turni_slice'
import { getInfoSediDistretto, RemoteSediInfo } from '../logic/server/firestore';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { NewListDropdown } from './form_dropdown'
import { capitalizeFirstLetter } from '../logic/local_utilities'
import { AppFirebaseError } from '../logic/server/firebase'
import { setMessageError } from '../logic/redux/settings_slice'

interface PropsGruppoTurni {
  distretto: string | undefined
}

function getFormattedHour(hour: string) {
  const prefix = '9/19/2022 '
  if(!hour.includes(':')) {
    return prefix + hour + ':00'
  }
  return prefix + hour
}

function compareTurni(a?: string, b?: string) {
  if (!a && !b) return 0
  if (!a) return -1
  if (!b) return 1
  const firstTurni = a!.split('-')
  const secondTurni = b!.split('-')
  const dateFirstBegin = Date.parse(getFormattedHour(firstTurni[0]));
  const dateSecondBegin = Date.parse(getFormattedHour(secondTurni[0]));
  const dateFirstEnd = Date.parse(getFormattedHour(firstTurni[1]));
  const dateSecondEnd = Date.parse(getFormattedHour(secondTurni[1]));
  return dateFirstBegin - dateSecondBegin === 0 ? dateFirstEnd - dateSecondEnd : dateFirstBegin - dateSecondBegin
}

export default function GruppoTurni(props: PropsGruppoTurni) {
  const stateTurni = useAppSelector((state) => state.turni)
  const predefinedSediUser = useAppSelector((state) => state.auth.sedi)
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(true)
  const [infoSedi, setInfoSedi] = useState<RemoteSediInfo>()
  const router = useRouter()

  const setPredefinedSedi = (remoteSedi: string[]) => {
    if (predefinedSediUser.length > 0) {
      const normalizedSedi = remoteSedi.map(el => el.toLowerCase())
      const normalizedPredefinedSedi = predefinedSediUser.map(el => el.toLowerCase())
      const out = normalizedPredefinedSedi.filter(el => normalizedSedi.includes(el)).map(el => capitalizeFirstLetter(el))
      if(out.length > 0) {
        dispatch(handleSede(out))
      }
    } 
  }

  const getInfoSedi = async () => {
    setLoading(true)
    if(props.distretto === undefined) {
      router.replace('/')
      return
    }
    try {
      const data: RemoteSediInfo = (await getInfoSediDistretto(props.distretto))!
      setInfoSedi(data)
      setPredefinedSedi(Object.keys(data.sedi))
    } catch(error: unknown) {
      if (error instanceof AppFirebaseError) {
        dispatch(setMessageError(error.message))
      } else {
        dispatch(setMessageError("Errore, riprovare!"))
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    /* if (predefinedSediUser.length > 0) { //TODO: Applicare filtro su queste sedi
      dispatch(handleSede(predefinedSediUser.map(el => capitalizeFirstLetter(el))))
    } */
    getInfoSedi()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <Grid container direction="column">
        <Grid item sx={{py: 2}}>
          <Typography fontWeight="fontWeightBold" variant="h6" component="h6" sx={{ py: 2 }}>
            {"Scegli il mese"}
          </Typography>
          <SelectMeseCalendar timestamp_mese={stateTurni.timestamp_mese} onChange={(newValue) => {
            if (newValue !== null) {
              dispatch(setMese(newValue.toDate().getTime()))
              dispatch(clearDisponibilita())
            }
          }}/>
        </Grid>
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
        {"Seleziona le tue disponibilità"}
      </Typography>
      { loading && <CircularProgress />}
      <Grid container sx={{pb: 3}} direction={{xs: "column", md: "row"}}>
        { !loading && infoSedi &&
          Object.keys(infoSedi.turni).sort(compareTurni).map((turno: string, index: number) => 
            <Box key={index} sx={{ borderRadius: '16px', backgroundColor: '#EFEFEF', m: 2, py: 3 }}>
              <Grid container
                  display="flex"
                  direction="column"
                  alignItems="center"
                  justifyContent="center"
                  sx={{minWidth: "200px"}}
                >                    
                <Grid item>
                  {
                    //Color black è per mantenerlo nero anche nella modalità scura
                  }
                  <Typography fontWeight="fontWeightBold" style={{color: 'black', display: 'inline-block'}}>Turno: {turno}</Typography>
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
