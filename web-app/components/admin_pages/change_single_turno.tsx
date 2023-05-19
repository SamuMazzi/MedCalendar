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
import { turni_disp } from './create_configuration_admin';
import useUser from '../../logic/hooks/use_user';

interface PropsHandlerSpecialTurni {
  specialTurni?: Date[]
}

//TODO: Gestire special turni -> creare callback per registrarli su configurationDistretto (o farlo direttamente da qua, ma si rischia)


export default function HandlerSpecialTurni(props: PropsHandlerSpecialTurni) {
  const [_, distretto] = useUser()
  const tmpMode = props.specialTurni !== undefined
  const [messageSnackbar, setMessageSnackbar] = useState("")
  const [loading, setLoading] = useState(false)
  const [daySelected, setDaySelected] = useState(dayjs())
  const [turnoFrom, setTurnoFrom] = useState("")
  const [turnoTo, setTurnoTo] = useState("")
  const [specialTurni, setSpecialTurni] = useState<Date[] | undefined>()

  useEffect(() => {
    if (!tmpMode) {
      getSpecialTurniServer(distretto!).then((res) => setSpecialTurni(res))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const showError = (msg: string) => {
    setMessageSnackbar(msg)
  }

  const removeSpecialTurno = async (index: number) => {
    setMessageError("")
    setLoading(true)
    try {
      if(!tmpMode) {
        removeSpecialTurnoServer(specialTurni![index], distretto!)
      }
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
      const dateTurno = fromTurnoToDate(daySelected.toDate(), turnoFrom + '-' + turnoTo)
      if(!tmpMode) {
        addSpecialTurnoServer(dateTurno, distretto!)
      }
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
              label="Dalle"
              value={turnoFrom}
              inputList={turni_disp}
              onChangeFn={(event) => setTurnoFrom(event.target.value)}
          />
          <NewListDropdown
              label="Alle"
              value={turnoTo}
              inputList={turni_disp}
              onChangeFn={(event) => setTurnoTo(event.target.value)}
          />
          <Button variant="contained" onClick={() => addSpecialTurno()} disabled={loading}>
            Aggiungi turno
          </Button>
        </Box>
        <Box sx={{ml: 4}}>
          <Typography fontWeight="fontWeightBold" variant="h6" component="h6" sx={{ py: 2 }}>
              Modifiche attuali ai turni
          </Typography>
          {
            (specialTurni === undefined || specialTurni.length === 0) ? <Typography>
              Ancora nessuna modifica applicata ai turni
            </Typography> : 
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
          }
        </Box>
        <MessageSnackbar isOpen={messageSnackbar !== ''} handleClose={() => setMessageError("")} message={messageSnackbar}/>
      </Box>
    </>
  )
}