import { Box, Grid, Typography, ToggleButtonGroup, ToggleButton, TextField, Button, Grow, Divider } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from '../logic/redux/store'
import { changeFasceTurnoSede, changeNumMediciPerTurnoSede, changeNomeSede } from '../logic/redux/configuration_distretto_slice'
import DeleteIcon from '@mui/icons-material/Delete';
import { ListDropdownForm } from "./form_dropdown";

interface SingleSedeProps {
    index: number
}
/**
 * <Grid item>
            <PersonalCalendar fasciaTurno={"111"}/>
          </Grid>
 */
//TODO: Devi poter aggiungere giorni speciali

const turni_disp = [
'00', '00:30', '01', '01:30', '02', '02:30', '03', '03:30', 
'04', '04:30', '05', '05:30', '06', '06:30', '07', '07:30', '08', '08:30', 
'09', '09:30', '10', '10:30', '11', '11:30', '12', '12:30', '13', '13:30', 
'14', '14:30', '15', '15:30', '16', '16:30', '17', '17:30', '18', '18:30', 
'19', '19:30', '20', '20:30', '21', '21:30', '22', '22:30', '23', '23:30']
const days = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

export default function SingleSede(props: SingleSedeProps) {
    const configurationDistrettoState = useAppSelector(state => state.configurationDistr)
    const dispatch = useAppDispatch()
    const stateTurni = configurationDistrettoState.sedi[props.index].fasce_turno
    const mediciPerTurno = configurationDistrettoState.sedi[props.index].medici_per_turno

    useEffect(() => {
        addNewTurno();
    }, []);
  
    const changeDaysTurno = (
      event: React.MouseEvent<HTMLElement>,
      newDays: string[],
      index: number
    ) => {
        const newTurno = {
            fascia: stateTurni[index].fascia,
            giorni_settimana: newDays.map(val => days.indexOf(val))
        }
        const newSt = [...stateTurni]
        newSt[index] = newTurno
        dispatch(
            changeFasceTurnoSede({
                index: props.index,
                fasce_turno: newSt
            })
        )
    };
  
    const addNewTurno = () => {
        const newTurno = {
            fascia: "8-20",
            giorni_settimana: []
        }
        dispatch(
            changeFasceTurnoSede({
                index: props.index,
                fasce_turno: [...stateTurni, newTurno]
            })
        )
    }

    const changeNome = (val: string) => {
        dispatch(
            changeNomeSede({
                index: props.index,
                nome: val
            })
        )
    }

    const changeFasciaTurno = (val: string, index: number, mode: string) => {
        let newFascia = ''
        if(mode === 'inizio') {
            newFascia = val + stateTurni[index].fascia.split('-')[1]
        } else if (mode === 'fine') {
            newFascia = stateTurni[index].fascia.split('-')[0] + val
        } else {
            throw "Nessuna modalita con questo nome: " + mode 
        }
        const newTurno = {
            fascia: newFascia,
            giorni_settimana: stateTurni[index].giorni_settimana
        }
        const newSt = [...stateTurni]
        newSt[index] = newTurno
        dispatch(
            changeFasceTurnoSede({
                index: props.index,
                fasce_turno: newSt
            })
        )
    }

    const setMedPerTurno = (num: number) => {
        dispatch(
            changeNumMediciPerTurnoSede({
                index: props.index,
                medici_per_turno: num
            })
        )
    }

    const deleteTurno = (index: number) => {
        dispatch(
            changeFasceTurnoSede({
                index: props.index,
                fasce_turno: stateTurni.filter((val: any, i) => i !== index)
            })
        )
    }
  
    return (
    <Grow
        in={true}
        style={{ transformOrigin: '100% 50% 0' }}
        {...(true ? { timeout: 800 } : {})}
    >
      <Box sx={{ borderRadius: '16px', backgroundColor: '#EFEFEF', m: 2, py: 3}}>
        <Grid container
            display="flex"
            direction="column"
            alignItems="center"
            justifyContent="center"
            sx={{minWidth: "200px"}}
          >
          <Grid item>
            <TextField 
                style={{display: 'inline-block'}} 
                value={configurationDistrettoState.sedi[props.index].nome}
                inputProps={{min: 0, style: { textAlign: 'center', fontWeight: "bold" }}}
                variant="standard"
                onChange={(event) => changeNome(event.target.value)}
            />
            {/**fontWeight="fontWeightBold" */}
          </Grid>
          
          <Grid item sx={{py: 2}}>
            <Grid container alignItems="center" justifyContent="center" >
                <Button onClick={() => setMedPerTurno(mediciPerTurno - 1)}><RemoveIcon fontSize="small"/></Button>
                    <Typography>
                        {
                            mediciPerTurno + " medici per turno"
                        }
                    </Typography>
                <Button onClick={() => setMedPerTurno(mediciPerTurno + 1)}><AddIcon fontSize="small"/></Button>
            </Grid>
          </Grid>
          <Grid container
            display="flex"
            direction="column"
            alignItems="center"
            justifyContent="center">
            <Grid item>
                <Typography>Turni:</Typography>
            </Grid>
          {
            stateTurni.map((val, index) => {
                return (
                <Grid key={index} container 
                display="flex"
                direction="column"
                alignItems="center"
                justifyContent="center">
                    <Grid item>
                        <ListDropdownForm 
                            label="Dalle"
                            value={stateTurni[index].fascia.split('-')[0]}
                            inputList={turni_disp}
                            onChangeFn={(event) => changeFasciaTurno(event.target.value, index, 'inizio')}
                        />
                        <ListDropdownForm
                            label="Alle"
                            value={stateTurni[index].fascia.split('-')[1]}
                            inputList={turni_disp}
                            onChangeFn={(event) => changeFasciaTurno(event.target.value, index, 'fine')}
                        />
                    </Grid>
                    <Grid item>
                        <Button onClick={() => deleteTurno(index)}>
                            <DeleteIcon />
                        </Button>
                    </Grid>
                    <Grid item sx={{p: 2}}>
                        <ToggleButtonGroup
                            value={val.giorni_settimana.map(val => days[val])}
                            onChange={(event, newDays: string[]) => changeDaysTurno(event, newDays, index)}
                            aria-label="Days selected"
                            >
                            {
                                days.map((day) => <ToggleButton key={day} value={day} aria-label={day}>{day}</ToggleButton>)
                            }
                        </ToggleButtonGroup>
                    </Grid>
                    { //Non so perchè non funziona
                        index !== stateTurni.length - 1 && <Divider /> 
                    }
                </Grid>
                )
            })
          }          
          </Grid>
          <Grid item>
              <Button>
                <Button onClick={addNewTurno} sx={{ borderRadius: 50, py: 1 }} variant='outlined'>
                  <AddIcon fontSize="small"/>
                </Button>
              </Button>
          </Grid>
        </Grid>
      </Box>
    </Grow>
    );
  }