import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import { PersonalCalendar, SelectMeseCalendar } from '../calendar'
import { useAppDispatch, useAppSelector }  from '../../logic/redux/store'
import { setMaxHours, handleLocation, setMonth, clearAvailability } from '../../logic/redux/turni_slice'
import { parseDateToTurno } from '../../logic/local_utilities'
import useSediDoctor from '../../logic/hooks/use_sedi_remote'
import { InputNumber } from 'primereact/inputnumber';
import { MultiSelect } from 'primereact/multiselect';
import { SelectItem } from 'primereact/selectitem'

interface PropsGroupShifts {
  district: string | undefined
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
    const dateValue = v.toDate()
    const [date, turno] = parseDateToTurno(dateValue)
    if(dateValue.getMonth() === month) {
      if(Object.keys(extraDays).includes(turno)) {
        extraDays[turno].push(date)
      } else {
        extraDays[turno] = [date]
      }
    }
  })
  return extraDays
}

interface PropsTitleSection { title: string }
const TitleSection = (props: PropsTitleSection) => <Typography fontWeight="fontWeightBold" variant="h6" component="h6" sx={{ py: 2 }}>{props.title}</Typography>

export default function GruppoTurni(props: PropsGroupShifts) {
  const stateTurni = useAppSelector((state) => state.turni)
  const dispatch = useAppDispatch()
  const [infoSedi, loading] = useSediDoctor(props.district)
  const extraDays = getExtraDaysFromInfo(infoSedi?.specialDays, stateTurni.timestamp_month)
  const mergedTurniToShow = [...Object.keys(infoSedi?.shifts || []), ...Object.keys(extraDays).filter(v => !Object.keys(infoSedi?.shifts || []).includes(v))]
  const itemsLocations: SelectItem[] = infoSedi !== undefined ? Object.keys(infoSedi!.locations).map((sede) => ({label: sede, value: sede})) : []

  return (
    <>
      <Grid container direction="column">
        <Grid item sx={{py: 2}}>
          <TitleSection title='Scegli il mese'/>
          <SelectMeseCalendar maxDate={3} timestamp_mese={stateTurni.timestamp_month} onChange={(newValue) => {
            if (newValue !== null && newValue !== undefined) {
              dispatch(setMonth(newValue.getTime()))
              dispatch(clearAvailability())
            }
          }}/>
        </Grid>
        <Grid item sx={{py: 2}}>
          <TitleSection title='Numero massimo di turni'/>
          {/*sx={{
            minWidth: 130
          }}*/}
          <InputNumber placeholder='Turni' value={stateTurni.max_hours} onValueChange={(event) => dispatch(setMaxHours(parseInt(event.value !== undefined && event.value !== null ? event.value.toString() : "0")))} />
        </Grid>
        <Grid item>
        <TitleSection title='Seleziona una o più sedi'/>
        {
          infoSedi && 
          /*<NewListDropdown
              value={stateTurni.locations}
              label="Sedi"
              multiple={true}
              onChangeFn={(event) => dispatch(handleSede(event.target.value as string[]))}
              inputList={Object.keys(infoSedi.sedi)}
          />*/
          <MultiSelect 
            value={stateTurni.locations} 
            onChange={(e) => dispatch(handleLocation(e.target.value as string[]))} 
            options={itemsLocations} 
            placeholder="Sedi" 
          />
        }
        </Grid>
      </Grid>
      <TitleSection title='Seleziona le tue disponibilità'/>
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
                  <PersonalCalendar shift={turno} extraDays={extraDays[turno]} selectableDays={infoSedi.shifts[turno]?.split(',').map((day: string) => (parseInt(day) % 7))}/>
                </Grid>
                <Grid item>
                  {
                    (stateTurni.availability[turno] !== undefined &&
                      stateTurni.availability[turno].length !== 0) && stateTurni.availability[turno].length + " giorni selezionati"
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
