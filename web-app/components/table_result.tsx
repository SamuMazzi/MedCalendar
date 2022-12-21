import { Paper, TableContainer, Grid, FormControlLabel, Checkbox, Table, TableHead, TableRow, TableCell, TableBody, Modal, Box, Typography, List, ListItem, ListItemButton, ListItemText } from '@mui/material'
import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../logic/redux/store'
import { swapMediciInTurno } from '../logic/redux/scheduler_slice'
import { mesi } from '../logic/local_storage'


const getAllTurni = (formatted_data: any) => {
  const list_turni: string[] = []
  Object.keys(formatted_data['turni']).forEach((sede: string) => {
    Object.keys(formatted_data['turni'][sede]).forEach(turno => !list_turni.includes(turno) ? list_turni.push(turno) : null)
  })
  list_turni.sort()
  return list_turni
}
// Anche i turni vuoti devono essere cliccabili
// Devo poter aggiungere medici ai turni vuoti
// Devo poter semplicemente togliere un medico se voglio
export default function TableResult() {
    const formatted_data = useAppSelector(state => state.scheduler)
    const [ openModal, setOpenModal ] = useState(false)
    const [ filteredMedici, setFilteredMedici ] = useState<any[]>([])
    const [ idMedicoSel, setIdMedicoSel ] = useState<string | undefined>("")
    const [turnoSel, setTurnoSel] = useState<string | undefined>("")
    const [sedeSel, setSedeSel] = useState<string | undefined>("")
    const [ details, setDetails] = useState(false)
    const listTurni = getAllTurni(formatted_data)
    const dispatch = useAppDispatch()

  
    const styleModal = {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    };

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

    const openModalMedico = (sede:string, turno: string, id_selected_medico: string | undefined) => {
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
    //TODO: Sistemare bug, Medico Demo ha settate 6 ore da fare, mentre dovrebbero essere 10 (stesso bug in molti altri)

    const getInfoTextMedico = (medico: any | undefined) => {
        if (medico === undefined) return ""
        let out = medico.nome 
        if (details) {
            out += "\nTurni rimanenti: " + medico.n_turni_per_soddisfatto + "\nRuolo: " + medico.ruolo
        }
        return out
    }

    return (
        formatted_data.head.length === 0 ? <Grid container /> :
        <Grid container
          alignItems="center"
          justifyContent="center"
        >
          <Grid item>
            <FormControlLabel
              control={<Checkbox
                value={details}
                onChange={(event) => setDetails(event.target.checked)}
              />}
              label="Dettagli" />
          </Grid>
          <Grid item>
            <Typography variant="h5" component="h5">{"Programmazione per: " + mesi[formatted_data['month']] + ' ' + formatted_data['year']}</Typography>
          </Grid>
          <TableContainer component={Paper} sx={{p:10}}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Turno</TableCell>
                {formatted_data['head'].map((sede_key: string) => (
                    <TableCell key={sede_key} align="right">{sede_key}</TableCell>
                  ))
                }
              </TableRow>
            </TableHead>
            <TableBody>
              {listTurni.map((turno: string) => (
                <TableRow
                  key={turno}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell key={turno} style={{
                        borderBottom:"none",
                        //color: "red",
                        background: new Date(formatted_data.year + '-' + formatted_data.month + '-' + turno).getHours() === 8 ? "#fb5959" : "white"
                      }}
                  >
                    {turno}
                  </TableCell>
                  {
                    Object.keys(formatted_data['turni']).map((sede: string) => 
                      Array.from(Array(formatted_data['med_per_turno'][sede])).map((x, index) => {
                        const medici_in_turno: string[] = formatted_data['turni'][sede][turno] !== undefined ? formatted_data['turni'][sede][turno] : []
                        let medico: any = undefined
                        let id_medico: string | undefined
                        if (index < medici_in_turno.length) {
                          id_medico = medici_in_turno[index]
                          medico = formatted_data['medici_mod'][id_medico]
                        }

                        return (
                          <TableCell style={{
                            borderBottom:"none",
                            margin: 0,
                            padding: 0
                          }} key={turno + index.toString()} align="center" onClick={() => openModalMedico(sede, turno, id_medico)}>
                            <Box sx={{px: 0, py: 1}} style={{
                            borderRadius: 12,
                            margin: 1,
                            background: medico === undefined ? "black" : medico.ruolo.startsWith("inc") ? "#ccff9b" : medico.ruolo.startsWith("conven") ? "#b1f4ff" : "#ffd07d"
                          }}>
                                <Typography style={{ whiteSpace: "pre-line" }}>{getInfoTextMedico(medico)}</Typography>
                            </Box>
                          </TableCell>
                        )
                      })
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
              <Typography variant="h6" component="h2">
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
                            <ListItemText primary={formatted_data['medici_mod'][id_med].nome} />
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
      </Grid>
    )
}