import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import AddIcon from '@mui/icons-material/AddRounded';
import DeleteIcon from '@mui/icons-material/DeleteRounded';
import SingleSede from './single_sede';
import MessageSnackbar from '../snackbar/message_snackbar';
import Greetings from '../general/greetings';
import { setConfigurationDistrettoMese } from '../../logic/server/firestore/distretti'
import { useState, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../../logic/redux/store'
import { addSede, changeFasciaTurnoDistretto, TurnoDistretto } from '../../logic/redux/configuration_distretto_slice'
import Head from 'next/head';
import { AppFirebaseError } from '../../logic/server/firebase';
import { setMessageError } from '../../logic/redux/settings_slice';
import HandlerSpecialTurni from './change_single_turno';
import { FormTextField } from '../login/form_components';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton'
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { NewListDropdown } from '../general/form_dropdown';
import Box from '@mui/material/Box';

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

export const turni_disp = [
  '00', '00:30', '01', '01:30', '02', '02:30', '03', '03:30', 
  '04', '04:30', '05', '05:30', '06', '06:30', '07', '07:30', '08', '08:30', 
  '09', '09:30', '10', '10:30', '11', '11:30', '12', '12:30', '13', '13:30', 
  '14', '14:30', '15', '15:30', '16', '16:30', '17', '17:30', '18', '18:30', 
  '19', '19:30', '20', '20:30', '21', '21:30', '22', '22:30', '23', '23:30']
export default function ConfigurationAdmin() {
  //TODO: Numero massimo di turni notturni per mese
  //TODO: distanza temporale minima fra turni (diurni/notturni)
  const configurationDistretto = useAppSelector(state => state.configurationDistr)
  const dispatch = useAppDispatch()
  const [ loading, setLoading ] = useState(false)
  const [ infoSent, setInfoSent ] = useState(false)
  const [ isOpenSnackbar, setIsOpenSnackbar ] = useState(false)
  const [messageSnackbar, setMessageSnackbar] = useState("")

  const _editTurno = (newTurno: TurnoDistretto, index?: number) => {
    const newSt = [...configurationDistretto.turni]
    if (index !== undefined) {
      newSt[index] = newTurno
    } else {
      newSt.push(newTurno)
    }
    dispatch(changeFasciaTurnoDistretto(newSt))
  }

  const changeDaysTurno = (
    event: React.MouseEvent<HTMLElement>,
    newDays: string[],
    index: number
  ) => {
      const newTurno: TurnoDistretto = {
          ...configurationDistretto.turni[index],
          daysOfWeek: newDays.map(val => days.indexOf(val))
      }
      _editTurno(newTurno, index)
  };

  const changeFasciaTurno = (val: string, index: number, mode: keyof TurnoDistretto) => {
    const newTurno: TurnoDistretto = {
      ...configurationDistretto.turni[index],
      [mode]: val
    }
    _editTurno(newTurno, index)
  }

  const deleteTurno = (index: number) => {
    dispatch(changeFasciaTurnoDistretto(configurationDistretto.turni.filter((val: any, i) => i !== index)))
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
    for(let sede of configurationDistretto.sedi) {
      if(!sede.nome) {
        showError("Il nome di una sede non può essere vuoto")
        return false
      }
    }
    return true
  }

  const creaConfiguration = async () => {
    setLoading(true)
    try {
      if(validateConfiguration()) {
        //new Date() dovrebbe essere del mese dopo
        await setConfigurationDistrettoMese(new Date(), "distretto", configurationDistretto.sedi)
        setInfoSent(true)
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
  
  const addNewSede = async () => {
    //* Crea std sede
    const newIndex = configurationDistretto.sedi.length
    dispatch(addSede({
      index: newIndex,
      nome: "Sede "+newIndex.toString(),
      medici_per_turno: 1,
    }))
  }

  useEffect(() => {
    if(configurationDistretto.sedi.length === 0) {
      addNewSede()
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
          configurationDistretto.sedi.map((val, index) => {
            return (
              <SingleSede key={index} index={index}/>
            )
          })
        }
          <Grid item>
              <IconButton onClick={addNewSede}>
                  <AddIcon/>
              </IconButton>
          </Grid>
        </Grid>
        <Divider flexItem />
        <TitleSection title="Imposta i turni" description='Inserisci i turni del tuo distretto (saranno comuni fra tutte le sedi)'/> 
        <List>
          {
            configurationDistretto.turni.map((infoTurno, index) => (
              <ListItem key={index} alignItems="center">
                <IconButton onClick={() => deleteTurno(index)}>
                  <DeleteIcon />
                </IconButton>
                <ToggleButtonGroup
                  sx={{mx: 1}}
                  value={infoTurno.daysOfWeek.map(val => days[val])}
                  onChange={(event, newDays: string[]) => changeDaysTurno(event, newDays, index)}
                >
                  {
                    days.map((day) => <ToggleButton key={day} value={day}>{day}</ToggleButton>)
                  }
                </ToggleButtonGroup>
                <Typography sx={{pr: 1}}>
                  Dalle
                </Typography>
                <NewListDropdown
                  label="Dalle"
                  width={100}
                  value={infoTurno.from}
                  inputList={turni_disp}
                  onChangeFn={(event) => changeFasciaTurno(event.target.value, index, 'from')}
                />
                <Typography sx={{px: 1}}>
                  Alle
                </Typography>
                <NewListDropdown
                  label="Alle"
                  width={100}
                  value={infoTurno.to}
                  inputList={turni_disp}
                  onChangeFn={(event) => changeFasciaTurno(event.target.value, index, 'to')}
                />
              </ListItem>
            ))
          }
        </List>
        <IconButton sx={{mb: 2}}>
          <AddIcon onClick={() => addNewTurno()} />
        </IconButton>
        <Divider flexItem />
        <TitleSection title="Modifiche ai turni" description='Qui puoi inserire degli specifici turni extra dovuti a vari eventi in quella zona (non preoccuparti se ti dimentichi qualcosa, potrai aggiungerli o rimuoverli in futuro)'/>
        <Grid item sx={{ py: 2 }}>
          <HandlerSpecialTurni specialTurni={[]} />
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