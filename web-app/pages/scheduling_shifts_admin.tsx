import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import CircularProgress from '@mui/material/CircularProgress'
import Switch from '@mui/material/Switch'
import TableResult from '../components/admin_pages/table_result';
import CircleIcon from '@mui/icons-material/Circle';
import Greetings from '../components/general/greetings';
import { useAppDispatch, useAppSelector } from '../logic/redux/store';
import { populateScheduler, SchedulingDataFromAPI, setMonthAndYear } from '../logic/redux/scheduler_slice';
import { useState } from 'react';
import { getDataDistrettoToSendAPI, uploadSchedulingDoctors } from '../logic/server/firestore/districts'
import { setMessageError } from '../logic/redux/settings_slice';
import ExportExcel from '../components/admin_pages/excel_export'
import Head from 'next/head'
import { AppFirebaseError } from '../logic/server/firebase'
import { SelectMeseCalendar } from '../components/calendar'
import { getDisponibilitaMeseDistretto } from '../logic/server/firestore/firestore'
import useInfoDistrict from '../logic/hooks/use_info_district'
import { getColorRole, getRoleLabel } from '../logic/local_utilities'

interface PropsTitleOfPage {
  title: string,
  distretto: string,
  description: string,
}

function TitleOfPage(props: PropsTitleOfPage) {
  return (
    <Grid item>
      <Typography style={{ fontWeight: 900, fontSize: 52 }}>
        {props.title}
      </Typography>
      <Typography variant="h6" component="h6" style={{whiteSpace: 'pre-line'}}>
        {"DISTRETTO: " + props.distretto.toUpperCase() + '\n' + props.description}
      </Typography>
    </Grid>
  )
}

interface PropsInfoTable {
  colorsRoles: Record<string, string>
  details: boolean
  setDetails: (arg0: boolean) => void
}

function InfoTable(props: PropsInfoTable) {
  return (
    <Grid item>
      <Grid container direction="row">
      <Grid item sx={{ mr: 2 }}>
        <Grid container direction="column" sx={{ borderRadius: 10, backgroundColor: '#EFEFEFBF', p: 4 }}>
          <Grid item>
            <Typography style={{ fontWeight: 'bold' }}>RUOLI</Typography>
          </Grid>
          {
            Object.keys(props.colorsRoles).map((role) =>
              <Grid item key={role} sx={{ mt: 1 }}>
                <Grid container direction="row" alignItems="center">
                  <CircleIcon style={{ color: props.colorsRoles[role] }} sx={{ mr: 1 }} />
                  <Typography>{getRoleLabel(role)}</Typography>
                </Grid>
              </Grid>
            )
          }
        </Grid>
      </Grid>
      <Grid item>
        <Grid container direction="column" sx={{ borderRadius: 10, backgroundColor: '#EFEFEFBF', p: 4 }}>
          <Grid item>
            <Typography style={{ fontWeight: 'bold' }}>DETTAGLI</Typography>
          </Grid>
          <Grid item>
            <Switch
              checked={props.details}
              onChange={(event) => { props.setDetails(event.target.checked) }}
              inputProps={{ 'aria-label': 'controlled' }}
              />
          </Grid>
        </Grid>
      </Grid>
      </Grid>
    </Grid>
  )
}

export default function PianificazioneTurniPage() {
  const monthData = useAppSelector(state => state.scheduler.month)
  const yearData = useAppSelector(state => state.scheduler.year)
  const dateData = new Date(yearData, monthData, 3)
  const dataScheduler = useAppSelector(state => state.scheduler)
  const [ loadingTurni, setLoadingTurni ] = useState(false)
  const [ dettagli, setDettagli] = useState(false)
  const [ shiftsUploaded, setShiftsUploaded ] = useState(false)
  const [ dataSent, setDataSent ] = useState(false)
  const [ nMedici, setNMedici ] = useState(0)
  const dispatch = useAppDispatch()
  const district = useAppSelector(state => state.auth.selectedDistrict)
  const [infoDistrict, error, loading] = useInfoDistrict(district)
  const colorsRoles: Record<string, string> = {}
  if(infoDistrict) {
    Object.keys(infoDistrict.roles).forEach((role, index) => {
      colorsRoles[role] = getColorRole(role)
    })
  }

  const getTurniMedici = async () => {
    if(yearData === 0) return
    try {
      const dataMedici: any = await getDisponibilitaMeseDistretto(district, yearData, monthData)
      const listMedici = getListMediciFromData(dataMedici)
      setNMedici(listMedici ? listMedici.length : 0)
    } catch (error: unknown) {
      if(error instanceof AppFirebaseError) {
        dispatch(setMessageError(error.message))
      } else {
        dispatch(setMessageError("Errore, riprovare!"))
      }
    }
  }

  const getListMediciFromData = (data: Record<string, Record<string, string[]>>) => {
    if(!data) return
    const listOut: string[] = []
    Object.keys(data).forEach(giorno => {
      Object.keys(data[giorno]).forEach(turno => {
        data[giorno][turno].forEach(medico => listOut.includes(medico) ? null : listOut.push(medico))
      })
    })
    return listOut
  }

  const sendSchedulingData = async () => {
    setLoadingTurni(true)
    try {
      await uploadSchedulingDoctors(district, dataScheduler)
      setDataSent(true)
    } catch(error: unknown) {
      if (error instanceof AppFirebaseError) {
        dispatch(setMessageError(error.message))
      } else {
        dispatch(setMessageError("Errore, riprovare!"))
      }
    } finally {
      setLoadingTurni(false)
    }
  }

  const pianificaTurni = async () => {
    setLoadingTurni(true)
    try {
      const data_disp = await getDataDistrettoToSendAPI(district, yearData, monthData)
      await callApi(data_disp)
    } catch (e) {
      console.log(e)
    } finally {
      setLoadingTurni(false)
    }
  }

  // TODO: Define types
  const callApi = async (data_to_send: any) => {
    const debugUrlApi = "http://127.0.0.1:8080"
    const urlProductionApi ="https://europe-west1-programmazione-turni-gm.cloudfunctions.net/schedule_from_data"
    const urlApi = process.env.NODE_ENV === 'production' ? urlProductionApi : debugUrlApi
    
    const res = await fetch(urlApi,
      {
        method: "POST",
        headers: {
          "Content-Type": "Application/JSON",
          "Access-Control-Request-Method": "POST"
        },
        body: JSON.stringify(data_to_send)
      })
      const jsonData: SchedulingDataFromAPI | any = await res.json() // any if there's an error
      if(res.status >= 200 && res.status < 215) {
        dispatch(populateScheduler(jsonData))
        setShiftsUploaded(true)
      } else {
        dispatch(setMessageError('Errore: ' + jsonData['message']))
      }
  }
  //<button onClick={() => debugWriteJson({filename: "out.json", data: {}})}>Debug</button>
  return (
    <>
    <Head>
      <title>Pianificazione turni</title>
    </Head>
    {dataSent ?
      <Grid container direction="column" justifyContent="center" alignItems="center" minHeight="calc(100vh - 199px)">
        <Grid item>
          <Greetings />
        </Grid>
        <Grid item>
          <ExportExcel excelData={dataScheduler} filename={"Programmazione_Turni_" + monthData + '-' + yearData} />
        </Grid>
      </Grid>
      :
    <Grid container sx={{ px: "11%", pt: 5 }}
        direction="column"
        minHeight="calc(100vh - 199px)"
        minWidth='100vw'
    >
      <Grid item>
        <Grid container direction="row" justifyContent="space-around">
          <Grid item>
            <TitleOfPage
              title="Pianifica i turni" 
              distretto={district} 
                  //* Dovrebbe dirti che c'è gente
                  description={""
                    /**!turniUploaded && yearData !== 0 ? "Per " + mesi[dateData.getMonth()+1] + " " + dateData.getFullYear() +  " hanno inserito le loro disponibilità " + nMedici + (nMedici !== 1 ? " medici" : " medico") : "" */}
            />
            <Grid item sx={{pt: 3}}>
              <Typography sx={{pb: 1}} style={{fontWeight: 'bold'}}>Seleziona il mese</Typography>
              <SelectMeseCalendar timestamp_mese={yearData === 0 ? undefined : dateData.getTime()} onChange={(newVal) => {
                if (newVal !== null && newVal !== undefined) {
                  if((newVal.getMonth() !== monthData || newVal.getFullYear() !== yearData)) {
                    dispatch(setMonthAndYear({
                      month: newVal.getMonth(),
                      year: newVal.getFullYear()
                    }))
                    getTurniMedici()
                  }
                }
              }}/>
            </Grid>
            <Grid item sx={{pl: 2}}>
              <Grid container spacing={2} alignItems="center" sx={{mt: 4}}>
                <Button
                    variant="contained"
                    component="label"
                    disabled={loadingTurni}
                    onClick={shiftsUploaded ? sendSchedulingData : pianificaTurni} 
                  >
                    {
                      shiftsUploaded ? "Conferma i turni" : "Pianifica i turni"
                    }
                </Button>
                {
                  loadingTurni && (
                    <>
                      <CircularProgress sx={{mx:2}}/>
                      <Typography style={{ color: '#868686'}}>Stiamo creando la tabella dei turni...</Typography>
                    </>
                  )
                }
              </Grid>
            </Grid>
          </Grid>
          {
            shiftsUploaded &&
            <InfoTable colorsRoles={colorsRoles} details={dettagli} setDetails={setDettagli}/>
          }
        </Grid>
      </Grid>
      {
        shiftsUploaded && <TableResult dettagli={dettagli}/>
      }
    </Grid>}
    </>
  )
}