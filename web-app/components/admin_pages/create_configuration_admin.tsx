import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import AddIcon from '@mui/icons-material/AddRounded';
import DeleteIcon from '@mui/icons-material/DeleteRounded';
import SingleSede from './single_sede';
import MessageSnackbar from '../snackbar/message_snackbar';
import { useState, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../../logic/redux/store'
import { addLocationToDistrict, changeShiftDistrict, DistrictShift } from '../../logic/redux/configuration_district_slice'
import Head from 'next/head';
import { AppFirebaseError } from '../../logic/server/firebase';
import { setMessageError } from '../../logic/redux/settings_slice';
import HandlerSpecialTurni from './change_single_turno';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton'
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { NewListDropdown } from '../general/form_dropdown';
import { uploadConfigurationDistrict } from '../../logic/server/firestore/firestore';
import useUser from '../../logic/hooks/use_user';

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
  const [user] = useUser()

  const _editTurno = (newTurno: DistrictShift, index?: number) => {
    const newSt = [...configurationDistrict.shifts]
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
          ...configurationDistrict.shifts[index],
          daysOfWeek: newDays.map(val => days.indexOf(val))
      }
      _editTurno(newTurno, index)
  };

  const changeFasciaTurno = (val: string, index: number, mode: keyof DistrictShift) => {
    const newTurno: DistrictShift = {
      ...configurationDistrict.shifts[index],
      [mode]: val
    }
    _editTurno(newTurno, index)
  }

  const deleteTurno = (index: number) => {
    dispatch(changeShiftDistrict(configurationDistrict.shifts.filter((val: any, i) => i !== index)))
  }

  const addNewTurno = () => {
    const newTurno = {
      from: '08',
      to: '20',
      daysOfWeek: []
    }
    _editTurno(newTurno)
  }

  const showError = (msg: string) => {
    setMessageSnackbar(msg)
    setIsOpenSnackbar(true)
  }
  const validateConfiguration = () => {
    if(configurationDistrict.locations.length <= 0) {
      showError("Inserisci almeno una sede")
      return false
    }
    for(const sede of configurationDistrict.locations) {
      if(!sede.name) {
        showError("Il nome di una sede non può essere vuoto")
        return false
      }
      if(sede.doctors_for_shift <= 0) {
        showError("La sede " + sede.name + " deve avere almeno un medico per turno.")
        return false
      }
    }
    if(configurationDistrict.shifts.length <= 0) {
      showError("Inserisci almeno un turno")
      return false
    }
    for(const shift of configurationDistrict.shifts) {
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

  const creaConfiguration = async () => {
    setLoading(true)
    try {
      if(validateConfiguration()) {
        await uploadConfigurationDistrict(configurationDistrict, user.uid)
        //TODO: Save local
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
  const addNewLocation = async () => {
    const newIndex = configurationDistrict.locations.length
    dispatch(addLocationToDistrict({
      index: newIndex,
      name: "Sede " + newIndex.toString(),
      doctors_for_shift: 1,
    }))
  }

  useEffect(() => {
    if(configurationDistrict.locations.length === 0) {
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
          configurationDistrict.locations.map((val, index) => {
            return (
              <SingleSede key={index} index={index}/>
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
            configurationDistrict.shifts.map((infoShift, index) => (
              <ListItem key={index} alignItems="center">
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
                <Typography sx={{pr: 1, pl: 2}}>
                  Dalle
                </Typography>
                <NewListDropdown
                  label="Dalle"
                  width={100}
                  value={infoShift.from}
                  inputList={turni_disp}
                  onChangeFn={(event) => changeFasciaTurno(event.target.value, index, 'from')}
                />
                <Typography sx={{px: 1}}>
                  Alle
                </Typography>
                <NewListDropdown
                  label="Alle"
                  width={100}
                  value={infoShift.to}
                  inputList={turni_disp}
                  onChangeFn={(event) => changeFasciaTurno(event.target.value, index, 'to')}
                />
              </ListItem>
            ))
          }
        </List>
        <Button sx={{mb: 2}} startIcon={<AddIcon/>} onClick={() => addNewTurno()} >
          Aggiungi un turno
        </Button>
        <Divider flexItem />
        <TitleSection title="Modifiche ai turni" description='Qui puoi inserire degli specifici turni extra dovuti a vari eventi in quella zona (non preoccuparti se ti dimentichi qualcosa, potrai aggiungerli o rimuoverli in futuro)'/>
        <Grid item sx={{ py: 2 }}>
          <HandlerSpecialTurni specialShifts={[]} />
        </Grid>
        <Grid item width="100%" display="flex" justifyContent="flex-end">
            <Button
              sx={{mr: 20}}
              variant="contained"
              onClick={creaConfiguration}
            >
              Continua
            </Button>
        </Grid>
        {
          loading && <CircularProgress />
        }
        <MessageSnackbar isOpen={isOpenSnackbar} handleClose={() => setIsOpenSnackbar(false)} message={messageSnackbar}/>
      </Grid>
    </>
  )
}