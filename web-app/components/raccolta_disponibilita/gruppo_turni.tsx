import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import { PersonalCalendar, SelectMeseCalendar } from '../calendar'
import { useAppDispatch, useAppSelector }  from '../../logic/redux/store'
import { setOreMassime, handleSede, setMese, clearDisponibilita } from '../../logic/redux/turni_slice'
import { RemoteSediInfo } from '../../logic/server/firestore/firestore';
import { getInfoSediDistretto } from '../../logic/server/firestore/distretti';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { NewListDropdown } from '../general/form_dropdown'
import { capitalizeFirstLetter, parseDateToTurno } from '../../logic/local_utilities'
import { AppFirebaseError } from '../../logic/server/firebase'
import { setMessageError } from '../../logic/redux/settings_slice'

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

const getExtraDaysFromInfo = (specialDays: any[] | undefined, timestamp_month: number | undefined) => {
  const extraDays: Record<string, Date[]> = {} //* Turno, giorno
  if (!specialDays || !timestamp_month) return extraDays

  const month = new Date(timestamp_month).getMonth()
  specialDays.forEach(v => {
    const [date, turno] = parseDateToTurno(v.toDate())
    if(v.toDate().getMonth() === month) {
      if(Object.keys(extraDays).includes(turno)) {
        extraDays[turno].push(date)
      } else {
        extraDays[turno] = [date]
      }
    }
  })
  return extraDays
}

export default function GruppoTurni(props: PropsGruppoTurni) {
  const stateTurni = useAppSelector((state) => state.turni)
  const predefinedSediUser = useAppSelector((state) => state.auth.sedi)
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(true)
  const [infoSedi, setInfoSedi] = useState<RemoteSediInfo>()
  console.log(infoSedi)
  const extraDays = getExtraDaysFromInfo(infoSedi?.specialDays, stateTurni.timestamp_mese)
  const mergedTurniToShow = [...Object.keys(infoSedi?.turni || []), ...Object.keys(extraDays).filter(v => !Object.keys(infoSedi?.turni || []).includes(v))]
  console.log(mergedTurniToShow)
  //const full_list = infoSedi?.turni
  //TODO Completa questa "full_list" con anche i giorni speciali
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

  //TODO: Rendi hook
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
    /* if (predefinedSediUser.length > 0) { //!: Applicare filtro su queste sedi
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
          <SelectMeseCalendar maxDate={3} timestamp_mese={stateTurni.timestamp_mese} onChange={(newValue) => {
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
          mergedTurniToShow.sort(compareTurni).map((turno: string, index: number) => 
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
                  <PersonalCalendar fasciaTurno={turno} extraDays={extraDays[turno]} selectableDays={infoSedi.turni[turno]?.split(',').map((day: string) => (parseInt(day) % 7))}/>
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
