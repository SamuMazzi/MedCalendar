import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import AddIcon from '@mui/icons-material/AddRounded';
import DeleteIcon from '@mui/icons-material/DeleteRounded';
import SingleLocation from './single_sede';
import MessageSnackbar from '../snackbar/message_snackbar';
import { useState, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../../logic/redux/store'
import { addLocationToDistrict, changeShiftDistrict, DistrictShift } from '../../logic/redux/configuration_district_slice'
import Head from 'next/head';
import { AppFirebaseError } from '../../logic/server/firebase';
import { setMessageError } from '../../logic/redux/settings_slice';
import HandlerSpecialTurni from './change_single_shift';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton'
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { FloatLabel } from 'primereact/floatlabel';
import { uniqueID } from '../../logic/local_utilities';


const days = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

interface PropsTitleSection {
    title: string
    description?: string
}

const TitleSection = (props: PropsTitleSection) => {
    return (
        <>
            <Grid item sx={{mt: 2}}>
                <Typography variant="h5">
                    {props.title}
                </Typography>
            </Grid>
            <Grid item sx={{mb: 2}}>
                <Typography style={{fontWeight: 300}}>
                    {props.description}
                </Typography>
            </Grid>
        </>
    )
}

interface PropsPageStepper {
  nextPage: () => void
}

export const turni_disp = [
  '00', '00:30', '01', '01:30', '02', '02:30', '03', '03:30', 
  '04', '04:30', '05', '05:30', '06', '06:30', '07', '07:30', '08', '08:30', 
  '09', '09:30', '10', '10:30', '11', '11:30', '12', '12:30', '13', '13:30', 
  '14', '14:30', '15', '15:30', '16', '16:30', '17', '17:30', '18', '18:30', 
  '19', '19:30', '20', '20:30', '21', '21:30', '22', '22:30', '23', '23:30']

export default function ConfigurationAdmin(props: PropsPageStepper) {
  //TODO: Numero massimo di turni notturni per mese
  //TODO: distanza temporale minima fra turni (diurni/notturni)
  const configurationDistrict = useAppSelector(state => state.configurationDistr)
  const dispatch = useAppDispatch()
  const [ loading, setLoading ] = useState(false)
  const [ isOpenSnackbar, setIsOpenSnackbar ] = useState(false)
  const [messageSnackbar, setMessageSnackbar] = useState("")
  /** This "shifts" workaround is useful only now that we have a single shifts-set for the whole district */
  const shifts = Object.keys(configurationDistrict.locations).length > 0 ? configurationDistrict.locations[Object.keys(configurationDistrict.locations)[0]].shifts : []

  const _editTurno = (newTurno: DistrictShift, index?: number) => {
    // TODO: Probabilmente è da cambiare anche questo
    // Si potrebbe avere una variabile locale qua che si applica a tutte le locations quando vai avanti
    const newSt = [...shifts]
    if (index !== undefined) {
      newSt[index] = newTurno
    } else {
      newSt.push(newTurno)
    }
    dispatch(changeShiftDistrict(newSt))
  }

  const changeDaysTurno = (
    event: React.MouseEvent<HTMLElement>,
    newDays: string[],
    index: number
  ) => {
      const newTurno: DistrictShift = {
          ...shifts[index],
          daysOfWeek: newDays.map(val => days.indexOf(val))
      }
      _editTurno(newTurno, index)
  };

  const changeFasciaTurno = (val: string, index: number, mode: keyof DistrictShift) => {
    const newTurno: DistrictShift = {
      ...shifts[index],
      [mode]: val
    }
    _editTurno(newTurno, index)
  }

  const deleteTurno = (index: number) => {
    dispatch(changeShiftDistrict(shifts.filter((val: any, i) => i !== index)))
  }

  const addNewTurno = () => {
    const newTurno = {
      from: '',
      to: '',
      daysOfWeek: []
    }
    _editTurno(newTurno)
  }

  const showError = (msg: string) => {
    setMessageSnackbar(msg)
    setIsOpenSnackbar(true)
  }
  const validateConfiguration = () => {
    if(Object.keys(configurationDistrict.locations).length <= 0) {
      showError("Inserisci almeno una sede")
      return false
    }
    for(const location of Object.values(configurationDistrict.locations)) {
      if(!location.name) {
        showError("Il nome di una sede non può essere vuoto")
        return false
      }
      if(location.doctors_for_shift <= 0) {
        showError("La sede " + location.name + " deve avere almeno un medico per turno.")
        return false
      }
    }
    /** We check only locations[0] because at the beginning every location has the same shifts */
    if(shifts.length <= 0) {
      showError("Inserisci almeno un turno")
      return false
    }
    for(const shift of shifts) {
      if(shift.daysOfWeek.length <= 0) {
        showError("Ogni turno necessita di essere applicato ad almeno un giorno")
        return false
      }
      if(shift.from === shift.to) {
        showError("Un turno non può iniziare e finire nello stesso momento")
        return false
      }
    }
    return true
  }

  const goToNextPage = async () => {
    setLoading(true)
    try {
      if(validateConfiguration()) {
        props.nextPage()
      }
    } catch (e: any) {
      if (e instanceof AppFirebaseError) {
        dispatch(setMessageError(e.message))
      } else {
        showError(e.toString())
      }
    } finally {
      setLoading(false)
    }
  }
  
  /**
   * Create a standard location (sede)
   */
  const addNewLocation = () => {
    const newIndex = Object.keys(configurationDistrict.locations).length
    dispatch(addLocationToDistrict({
      id: uniqueID(),
      name: "Sede " + newIndex.toString(),
      doctors_for_shift: 1,
      shifts: []
    }))
  }

  useEffect(() => {
    if(Object.keys(configurationDistrict.locations).length === 0) {
      addNewLocation()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  return (
    <>
      <Head>
        <title>Aggiungi turni</title>
      </Head>
      <Grid container
        display="flex"
        direction="column"
        alignItems="start"
        justifyContent="center"
        sx = {{ pb: 5, mt: 2, ml: 3 }}
      >
        <TitleSection title="Crea le sedi" description='Puoi impostare i medici per ogni sede'/> 
        <Grid container
          display="flex"
          direction="row"
          alignItems="center"
          justifyContent="center"
          sx={{mb: 3}}
        >  
        {
          Object.values(configurationDistrict.locations).map((val) => {
            return (
              <SingleLocation key={"single_location_" + val.id} location={val}/>
            )
          })
        }
          <Grid item>
              <IconButton onClick={addNewLocation}>
                  <AddIcon/>
              </IconButton>
          </Grid>
        </Grid>
        <Divider flexItem />
        <TitleSection title="Imposta i turni" description='Inserisci i turni del tuo distretto (saranno comuni fra tutte le sedi)'/> 
        <List>
          {
            shifts.map((infoShift, index) => (
              <ListItem key={index} alignItems="center" sx={{my: 2}}>
                <IconButton onClick={() => deleteTurno(index)}>
                  <DeleteIcon />
                </IconButton>
                <ToggleButtonGroup
                  sx={{mx: 1}}
                  value={infoShift.daysOfWeek.map(val => days[val])}
                  onChange={(event, newDays: string[]) => changeDaysTurno(event, newDays, index)}
                >
                  {
                    days.map((day) => <ToggleButton key={day} value={day}>{day}</ToggleButton>)
                  }
                </ToggleButtonGroup>
                <br/>
                <FloatLabel>
                  <Dropdown
                    className='mr-3'
                    placeholder='Dalle'  // FIXME: Fix bug when you remove placeholder
                    value={infoShift.from}
                    options={turni_disp}
                    onChange={(event) => changeFasciaTurno(event.target.value, index, 'from')}
                    inputId={"dropdown_from_" + index}
                  />
                  <label htmlFor={"dropdown_from_" + index}>Dalle</label>
                </FloatLabel>
                <FloatLabel>
                  <Dropdown
                    placeholder='Alle'
                    value={infoShift.to}
                    options={turni_disp}
                    onChange={(event) => changeFasciaTurno(event.target.value, index, 'to')}
                    inputId={"dropdown_to_" + index}
                  />
                  <label htmlFor={"dropdown_to_" + index}>Alle</label>
                </FloatLabel>
              </ListItem>
            ))
          }
        </List>
        <Button className='mb-2' icon={<AddIcon/>} iconPos='left' onClick={() => addNewTurno()} >
          Aggiungi un turno
        </Button>
        <Divider flexItem />
        <TitleSection title="Modifiche ai turni" description='Qui puoi inserire degli specifici turni extra dovuti a vari eventi in quella zona (non preoccuparti se ti dimentichi qualcosa, potrai aggiungerli o rimuoverli in futuro)'/>
        <Grid item sx={{ py: 2 }}>
          <HandlerSpecialTurni specialShifts={[]} />
        </Grid>
        <Grid item width="100%" display="flex" justifyContent="flex-end">
            <Button
              className="mr-20"
              onClick={goToNextPage}
              loading={loading}
            >
              Continua
            </Button>
        </Grid>
        <MessageSnackbar isOpen={isOpenSnackbar} handleClose={() => setIsOpenSnackbar(false)} message={messageSnackbar}/>
      </Grid>
    </>
  )
}