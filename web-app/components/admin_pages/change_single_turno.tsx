import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'
import dayjs from 'dayjs';
import Container from '@mui/material/Container';
import { setMessageError } from '../../logic/redux/settings_slice';
import { AppFirebaseError } from '../../logic/server/firebase';
import { CalendarSelectSingleDay } from '../calendar';
import { NewListDropdown } from '../general/form_dropdown';
import MessageSnackbar from '../snackbar/message_snackbar';
import { turni_disp } from './single_sede';
import DeleteIcon from '@mui/icons-material/DeleteForeverRounded';
import { fromTurnoToDate, parseDateToTurno } from '../../logic/local_utilities';
import { addSpecialTurnoServer, getSpecialTurniServer, removeSpecialTurnoServer } from '../../logic/server/firestore/distretti';
import List from '@mui/material/List';
import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';

export default function HandlerSpecialTurni() {
  const [messageSnackbar, setMessageSnackbar] = useState("")
  const [loading, setLoading] = useState(false)
  const [daySelected, setDaySelected] = useState(dayjs())
  const [turno, setTurno] = useState(turni_disp[0] + "-" + turni_disp[1])
  const [specialTurni, setSpecialTurni] = useState<Date[] | undefined>()

  useEffect(() => {
    getSpecialTurniServer('Sassuolo').then((res) => setSpecialTurni(res))
  }, [])

  const changeFasciaTurno = (val: string, mode: string) => {
    let newFascia = ''
    if(mode === 'inizio') {
        newFascia = val + '-' + turno.split('-')[1]
    } else if (mode === 'fine') {
        newFascia = turno.split('-')[0] + '-' + val
    } else {
        throw "Nessuna modalità con questo nome: " + mode 
    }
    setTurno(newFascia)
  }
  const showError = (msg: string) => {
    setMessageSnackbar(msg)
  }

  const validateTurni = () => {
    if(turno === '') {
        showError("Inserisci turni")
        return false
    }
    if(turno.split('-')[0] === turno.split('-')[1]) {
        showError("Un orario non può iniziare e finire nello stesso momento")
        return false
    }
    return true
  }

  const removeSpecialTurno = async (index: number) => {
    setMessageError("")
    setLoading(true)
    try {
        removeSpecialTurnoServer(specialTurni![index], 'Sassuolo')
        setSpecialTurni(old => old!.splice(index, 1))
    } catch (e: any) {
      if (e instanceof AppFirebaseError) {
        showError(e.message)
      } else {
        showError(e.toString())
      }
    } finally {
      setLoading(false)
    }
  }

  const addSpecialTurno = async () => {
    setMessageError("")
    setLoading(true)
    try {
      if(validateTurni()) {
        const dateTurno = fromTurnoToDate(daySelected.toDate(), turno)
        addSpecialTurnoServer(dateTurno, 'Sassuolo')
        setSpecialTurni(old => old ? [...old, dateTurno] : [dateTurno])
      }
    } catch (e: any) {
      if (e instanceof AppFirebaseError) {
        showError(e.message)
      } else {
        showError(e.toString())
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Container>
        <Typography fontWeight="fontWeightBold" variant="h6" component="h6" sx={{ py: 2 }}>
            Modifiche attuali ai turni
        </Typography>
        <Card sx={{borderRadius: 8, maxWidth: 350, mb: 2}}>
            <List>
                {
                    specialTurni?.map((dateTurno, index) => {
                        const out = parseDateToTurno(dateTurno)
                        return (
                            <ListItem key={dateTurno.toISOString()} secondaryAction={
                                <IconButton edge="end" aria-label="delete" onClick={() => removeSpecialTurno(index)} disabled={loading}>
                                <DeleteIcon />
                                </IconButton>
                            }>
                                <ListItemText primary={dayjs(out[0]).format('DD/MM/YYYY') + ' ' + out[1]}/>
                            </ListItem>
                        )
                    })
                }
            </List>
        </Card>
        <Typography fontWeight="fontWeightBold" variant="h6" component="h6" sx={{ py: 2 }}>
            Aggiungi turno specifico
        </Typography>
        <Box display='flex' alignItems="center">
          <Typography textAlign='center' sx={{pr: 2}}>
            {'Giorno: ' + daySelected.format('DD/MM/YYYY')}
          </Typography>
          <CalendarSelectSingleDay daySelected={daySelected} onChangeDate={setDaySelected}/>
        </Box>
          <Container sx={{py: 1}}/>
          <NewListDropdown
              label="Dalle"
              value={turno.split('-')[0].padStart(2, '0')}
              inputList={turni_disp}
              onChangeFn={(event) => changeFasciaTurno(event.target.value, 'inizio')}
          />
          <NewListDropdown
              label="Alle"
              value={turno.split('-')[1].padStart(2, '0')}
              inputList={turni_disp}
              onChangeFn={(event) => changeFasciaTurno(event.target.value, 'fine')}
          />
          <Button variant="contained" onClick={() => addSpecialTurno()} disabled={loading}>
            Aggiungi turno
          </Button>
        <MessageSnackbar isOpen={messageSnackbar !== ''} handleClose={() => setMessageError("")} message={messageSnackbar}/>
      </Container>
    </>
  )
}