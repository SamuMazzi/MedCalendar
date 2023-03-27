import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Grow from '@mui/material/Grow'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useAppSelector, useAppDispatch } from '../../logic/redux/store'
import { changeNumMediciPerTurnoSede, changeNomeSede } from '../../logic/redux/configuration_distretto_slice'
import IconButton from '@mui/material/IconButton'

interface SingleSedeProps {
    index: number
}

export default function SingleSede(props: SingleSedeProps) {
    const configurationDistrettoState = useAppSelector(state => state.configurationDistr)
    const dispatch = useAppDispatch()
    const mediciPerTurno = configurationDistrettoState.sedi[props.index].medici_per_turno

    const changeNome = (val: string) => {
        dispatch(
            changeNomeSede({
                index: props.index,
                nome: val
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
          
          <Grid item sx={{pt: 2, px: 2}}>
            <Box display="flex" alignItems="center" justifyContent="center" >
                <Typography>
                    Medici per turno
                </Typography>
                <IconButton onClick={() => setMedPerTurno(mediciPerTurno - 1)}>
                    <RemoveIcon fontSize="small"/>
                </IconButton>
                    <Typography>{mediciPerTurno}</Typography>
                <IconButton onClick={() => setMedPerTurno(mediciPerTurno + 1)}>
                    <AddIcon fontSize="small"/>
                </IconButton>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Grow>
    );
  }