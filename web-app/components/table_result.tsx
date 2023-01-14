import TableContainer from '@mui/material/TableContainer'
import Grid from '@mui/material/Grid'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableBody from '@mui/material/TableBody'
import Modal from '@mui/material/Modal'
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import CircleIcon from '@mui/icons-material/Circle';
import Button from '@mui/material/Button'
import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../logic/redux/store'
import { swapMediciInTurno } from '../logic/redux/scheduler_slice'
import { getGiornoSettimana } from '../logic/local_utilities'
import ListItemIcon from '@mui/material/ListItemIcon'
//import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

const getColorRole = (ruolo: string) => {
  const lower_ruolo = ruolo.toLowerCase()
  return lower_ruolo.startsWith("inc") ? "#ccff9b" : (lower_ruolo.startsWith("conven") || lower_ruolo.startsWith("titol")) ? "#b1f4ff" : "#ffd07d"
}

const getAllTurni = (formatted_data: any) => {
  const list_turni: string[] = []
  Object.keys(formatted_data['turni']).forEach((sede: string) => {
    Object.keys(formatted_data['turni'][sede]).forEach(turno => !list_turni.includes(turno) ? list_turni.push(turno) : null)
  })
  list_turni.sort()
  return list_turni
}

interface PropsTableResult {
  dettagli: boolean
}

interface PropsTableCellMedici {
  formatted_data: any,
  sede: string,
  turno: string,
  dettagli: boolean,
  onClick: (arg0: string, arg1: string, arg2: string | undefined) => void
}

function TableCellMedici(props: PropsTableCellMedici) {
  const getInfoTextMedico = (medico: any | undefined) => {
    if (medico === undefined) return ""
    let out = medico.nome
    if (props.dettagli) {
      out += "\nTurni rimanenti: " + medico.n_turni_per_soddisfatto
    }
    return out
  }

  return (
    <TableCell width="10%">
      <Grid container direction="column" sx={{maxWidth: 250}}>
      {Array.from(Array(props.formatted_data['med_per_turno'][props.sede])).map((x, index) => {
        const medici_in_turno: string[] = props.formatted_data['turni'][props.sede][props.turno] !== undefined ? props.formatted_data['turni'][props.sede][props.turno] : []
        let medico: any = undefined
        let id_medico: string | undefined
        if (index < medici_in_turno.length) {
          id_medico = medici_in_turno[index]
          medico = props.formatted_data['medici_mod'][id_medico]
        }

        return (
          <Button
            key={props.sede + index}
            sx={{
              pl: 2, py: 0.8, mb: 0.5, '&& .MuiTouchRipple-rippleVisible': {
                animationDuration: '600ms',
              },
            }}
            style={{
              borderRadius: 20,
              backgroundColor: "#EFEFEF",
              justifyContent: "flex-start",
              color: 'black',
              textTransform: 'none'
            }}
            onClick={() => props.onClick(props.sede, props.turno, id_medico)}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center'
            }}>
              {
                medico ?
                  <>
                    <Typography style={{ whiteSpace: "pre-line" }} align="left">{getInfoTextMedico(medico)}</Typography>
                    <CircleIcon fontSize="small" sx={{ ml: 1 }} style={{ color: getColorRole(medico.ruolo) }} />
                    {
                      /**
                        <WarningAmberRoundedIcon fontSize="small" sx={{ ml: 1 }} style={{ color: 'orange' }} />
                        TODO:  Aggiungere segnale di warning di fianco al medico se uno fa modifiche che modifiche sbagliate
                       */
                    }
                  </> :
                  <Typography style={{ whiteSpace: "pre-line", color: '#ACACAC' }}>(Vuoto)</Typography>
                }
            </div>
          </Button>
        )
      })}

      </Grid>
    </TableCell>
  )
}

const styleModal = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    borderRadius: 10,
    boxShadow: 24,
    p: 4,
};

export default function TableResult(props: PropsTableResult) {
    const formatted_data = useAppSelector(state => state.scheduler)
    const [ openModal, setOpenModal ] = useState(false)
    const [ filteredMedici, setFilteredMedici ] = useState<any[]>([])
    const [ idMedicoSel, setIdMedicoSel ] = useState<string | undefined>("")
    const [turnoSel, setTurnoSel] = useState<string | undefined>("")
    const [sedeSel, setSedeSel] = useState<string | undefined>("")
    const listTurni = getAllTurni(formatted_data)
    const dispatch = useAppDispatch()

    const swapMeds = (med_in: string | undefined) => {
        dispatch(swapMediciInTurno({
          med_in: med_in,
          med_out: idMedicoSel,
          turnoSel: turnoSel,
          sedeSel: sedeSel
        }))
    }

    const isMedicoInThisTurno = (id_med: string, turno: string) => {
      const turni_per_sede = formatted_data['turni']
      for (const sede of Object.keys(turni_per_sede)) {
        if (turni_per_sede[sede][turno] !== undefined && turni_per_sede[sede][turno].includes(id_med)) {
          return true
        } 
      }
      return false
    }

    const openModalMedico = (sede: string, turno: string, id_selected_medico: string | undefined) => {
        const medici = Object.keys(formatted_data['medici_orig']).filter((id_med: string) => {
            if (id_selected_medico !== undefined && id_selected_medico === id_med) return false
            const tmp_medico = formatted_data['medici_orig'][id_med]
            if (tmp_medico.disponibilita.includes(turno) && !isMedicoInThisTurno(id_med, turno)) return true
            return false
        })
        setIdMedicoSel(id_selected_medico)
        setTurnoSel(turno)
        setSedeSel(sede)
        setFilteredMedici(medici)
        setOpenModal(true)
    };

    const getTextTurno = (turno: string) => {
      const numberDay = parseInt(turno.split('T')[0])
      const ore_e_minuti = turno.split('T')[1].substring(0, 5).split(':')
      const inizioTurno = ore_e_minuti[0]
      const fineTurno = ore_e_minuti[1]
      let out = ""
      out += getGiornoSettimana((new Date(formatted_data.year, formatted_data.month)).getTime(), numberDay)
      out += ' ' + numberDay.toString()
      out += ', ' + inizioTurno + '-' + fineTurno
      return out
    }

    return (
        formatted_data.head.length === 0 ? <></> :
          <TableContainer sx={{pt:10}}>
          <Table>
            <TableHead>
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell width="10%" style={{ fontWeight: 'bold' }}>
                  TURNO
                </TableCell>
                {
                  formatted_data['head'].map((sede_key: string) => (
                    <TableCell key={sede_key} align="left" style={{ fontWeight: 'bold' }}>{sede_key.toUpperCase()}</TableCell>
                  ))
                }
              </TableRow>
            </TableHead>
            <TableBody>
              {listTurni.map((turno: string) => (
                <TableRow
                  key={turno}
                >
                  <TableCell key={turno} 
                    //#fb5959
                  >
                    {getTextTurno(turno)}
                  </TableCell>
                  {
                    Object.keys(formatted_data['turni']).map((sede: string) => 
                      <TableCellMedici key={sede} onClick={openModalMedico} formatted_data={formatted_data} sede={sede} turno={turno} dettagli={props.dettagli}/>
                    )
                  }
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Modal
              open={openModal}
              onClose={() => setOpenModal(false)}
              aria-labelledby="modal-modal-title"
              >
              <Box sx={styleModal}>
              <Typography variant="h6" component="h6" style={{fontWeight: 'bold'}}>
                  Cambio turno
              </Typography>
              <List>
                  {
                      filteredMedici.length === 0 ? <ListItemText>Nessun medico disponibile!</ListItemText> :
                      filteredMedici.map(id_med => 
                        <ListItem key={id_med} disablePadding>
                          <ListItemButton onClick={() => {
                            swapMeds(id_med)
                              setIdMedicoSel(undefined)
                              setTurnoSel(undefined)
                              setSedeSel(undefined)
                              setOpenModal(false)
                          }}>
                            <ListItemIcon><CircleIcon style={{ color: getColorRole(formatted_data['medici_mod'][id_med].ruolo)}}/></ListItemIcon>
                            <ListItemText primary={formatted_data['medici_mod'][id_med].nome} secondary={"Turni rimanenti: " + formatted_data['medici_mod'][id_med].n_turni_per_soddisfatto} />
                          </ListItemButton>
                          </ListItem>
                      )
                  }
                  {
                    idMedicoSel !== undefined && 
                      <ListItem key="rimuovi" disablePadding sx={{py: 2}}>
                        <ListItemButton onClick={() => {
                          swapMeds(undefined)
                          setIdMedicoSel(undefined)
                          setTurnoSel(undefined)
                          setSedeSel(undefined)
                          setOpenModal(false)
                        }}>
                          <ListItemText disableTypography primary="Rimuovi medico" style={{fontWeight:"bold"}}/>
                        </ListItemButton>
                      </ListItem>
                  }
              </List>
              </Box>
          </Modal>
        </TableContainer>
    )
}