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
import DeleteIcon from '@mui/icons-material/DeleteForeverRounded';
import { fromTurnoToDate, parseDateToTurno } from '../../logic/local_utilities';
import { addSpecialTurnoServer, getSpecialTurniServer, removeSpecialTurnoServer } from '../../logic/server/firestore/distretti';
import List from '@mui/material/List';
import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';

const turni_disp = [
  '8:00-20:00',
  '20:00-8:00',
  '8:00-14:00',
  '14:00-20:00'
]

/*
  '00', '00:30', '01', '01:30', '02', '02:30', '03', '03:30', 
  '04', '04:30', '05', '05:30', '06', '06:30', '07', '07:30', '08', '08:30', 
  '09', '09:30', '10', '10:30', '11', '11:30', '12', '12:30', '13', '13:30', 
  '14', '14:30', '15', '15:30', '16', '16:30', '17', '17:30', '18', '18:30', 
  '19', '19:30', '20', '20:30', '21', '21:30', '22', '22:30', '23', '23:30'*/

interface PropsHandlerSpecialTurni {
  specialTurni?: Date[]
}

export default function HandlerSpecialTurni(props: PropsHandlerSpecialTurni) {
  const distretto = 'Sassuolo'
  const [messageSnackbar, setMessageSnackbar] = useState("")
  const [loading, setLoading] = useState(false)
  const [daySelected, setDaySelected] = useState(dayjs())
  const [turno, setTurno] = useState(turni_disp[0])
  const [specialTurni, setSpecialTurni] = useState<Date[] | undefined>()

  useEffect(() => {
    if (props.specialTurni === undefined) {
      getSpecialTurniServer(distretto).then((res) => setSpecialTurni(res))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const changeFasciaTurno = (val: string) => {
    setTurno(val)
  }
  const showError = (msg: string) => {
    setMessageSnackbar(msg)
  }

  const removeSpecialTurno = async (index: number) => {
    setMessageError("")
    setLoading(true)
    try {
        removeSpecialTurnoServer(specialTurni![index], distretto)
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
      const dateTurno = fromTurnoToDate(daySelected.toDate(), turno)
      addSpecialTurnoServer(dateTurno, distretto)
      setSpecialTurni(old => old ? [...old, dateTurno] : [dateTurno])
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
      <Box display="flex" justifyContent="center">
        <Box sx={{mr: 4}}>
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
        </Box>
        <Box>
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
              label="Turno"
              value={turno}
              inputList={turni_disp}
              onChangeFn={(event) => changeFasciaTurno(event.target.value)}
          />
          <Button variant="contained" onClick={() => addSpecialTurno()} disabled={loading}>
            Aggiungi turno
          </Button>
        </Box>
        <MessageSnackbar isOpen={messageSnackbar !== ''} handleClose={() => setMessageError("")} message={messageSnackbar}/>
      </Box>
    </>
  )
}