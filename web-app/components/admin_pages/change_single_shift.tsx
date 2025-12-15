import Typography from '@mui/material/Typography'
import { useEffect, useRef, useState } from 'react'
import dayjs from 'dayjs';
import Container from '@mui/material/Container';
import { setMessageError } from '../../logic/redux/settings_slice';
import { AppFirebaseError } from '../../logic/server/firebase';
import { CalendarSelectSingleDay } from '../calendar';
import DeleteIcon from '@mui/icons-material/DeleteForeverRounded';
import { fromTurnoToDate, parseDateToTurno } from '../../logic/local_utilities';
import { addSpecialTurnoServer, getSpecialTurniServer, removeSpecialTurnoServer } from '../../logic/server/firestore/districts';
import List from '@mui/material/List';
import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { turni_disp } from './create_configuration_admin';
import useUser from '../../logic/hooks/use_user';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';

interface PropsHandlerSpecialShifts {
  specialShifts?: Date[]
}

//TODO: Gestire special turni -> creare callback per registrarli su configurationDistretto (o farlo direttamente da qua, ma si rischia)


export default function HandlerSpecialTurni(props: PropsHandlerSpecialShifts) {
  const [_, distretto] = useUser()
  const tmpMode = props.specialShifts !== undefined
  const [loading, setLoading] = useState(false)
  const [daySelected, setDaySelected] = useState(new Date())
  const [turnoFrom, setTurnoFrom] = useState<string | null>(null)
  const [turnoTo, setTurnoTo] = useState<string | null>(null)
  const [specialTurni, setSpecialTurni] = useState<Date[] | undefined>()
  const toast = useRef<any>(null);

  useEffect(() => {
    if (!tmpMode) {
      getSpecialTurniServer(distretto!).then((res) => {
        setSpecialTurni(res)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const showError = (msg: string) => {
    if (toast.current !== null) {
      toast.current.show({ severity: 'error', summary: 'Errore', detail: msg, life: 3000 });
    }
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
      if (turnoFrom === null || turnoTo === null) {
        throw new Error("Seleziona un turno valido")
      }
      const dateTurno = fromTurnoToDate(daySelected, turnoFrom + '-' + turnoTo)
      if(!tmpMode) {
        addSpecialTurnoServer(dateTurno, distretto!)
      }
      setSpecialTurni(old => old ? [...old, dateTurno] : [dateTurno])
    } catch (e: any) {
      if (e instanceof AppFirebaseError) {
        showError(e.message)
      } else {
        showError(e.toString().split("Error: ")[1])
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
            <CalendarSelectSingleDay daySelected={daySelected} onChangeDate={setDaySelected}/>
          </Box>
          <Container sx={{py: 1}}/>
          <Dropdown value={turnoFrom} onChange={(e) => setTurnoFrom(e.value)} 
              options={turni_disp}
              placeholder="Dalle" className="mr-2" />
          <Dropdown value={turnoTo} onChange={(e) => setTurnoTo(e.value)} 
              options={turni_disp}
              placeholder="Alle" className="ml-2" />
          <br />
          <Button className="mt-3" onClick={() => addSpecialTurno()} loading={loading}>
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
                        // FIXME: Fix this
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
        <Toast ref={toast} />
      </Box>
    </>
  )
}