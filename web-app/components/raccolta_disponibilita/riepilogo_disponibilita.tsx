import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAppSelector, useAppDispatch } from '../../logic/redux/store'
import { clearState } from '../../logic/redux/turni_slice';
import { getGiornoSettimana, mesi } from '../../logic/local_utilities'
import { PropsAvailability } from './module_disponibilita'
import { useState } from 'react'
import { setAvailabilityMonthDoctor } from '../../logic/server/firestore/districts';
import Greetings from '../general/greetings';
import CircularProgress from '@mui/material/CircularProgress'
import { AppFirebaseError } from '../../logic/server/firebase'
import { setMessageError } from '../../logic/redux/settings_slice'
import { getGoodRole } from '../../logic/redux/auth_slice'

interface PropsTitleAndDescription {
    title: string,
    description: string,
    pb: number | undefined
}

function TitleAndDescription(props: PropsTitleAndDescription) {
    return (
    <Grid item sx={{pb: 2}}>
            <Typography style={{ fontWeight: "normal" }} sx={{pb: props.pb ? props.pb : 0}}>
            {props.title.toUpperCase()}        
        </Typography>
            <Typography style={{ fontWeight: "bold", whiteSpace: 'pre-line' }}>
            {props.description}
        </Typography>
    </Grid>
    )
}
const titles = ['Medico', 'Ruolo', 'Sedi', 'Mese', 'Turni massimi']

export default function SummaryAvailability(props: PropsAvailability) {
    const [ done, setDone ] = useState(false)
    const stateTurni = useAppSelector(state => state.turni)
    const stateAuth = useAppSelector(state => state.auth)
    const textMese = mesi[new Date(stateTurni.timestamp_month!).getMonth()]
    const descriptions = [(stateAuth ? stateAuth.name : "")!, getGoodRole(stateAuth), stateTurni.locations.join(', '), textMese, stateTurni.max_hours.toString()]
    const generalState = useAppSelector((state) => state.turni)
    const [loading, setLoading] = useState(false)
    const dispatch = useAppDispatch()

    const onConfirm = async () => {
        setLoading(true)
        try {
            await setAvailabilityMonthDoctor(stateAuth.selectedDistrict, stateAuth.uid, generalState)
            dispatch(clearState())
            setDone(true)
        } catch(error: unknown) {
            if (error instanceof AppFirebaseError) {
                dispatch(setMessageError(error.message))
            } else {
                dispatch(setMessageError("Errore, riprovare!"))
            }
        } finally {
            setLoading(false)
        }
    }
    return (
        done ? <Greetings /> :
            <Grid container direction="column"
                alignItems="center"
                justifyContent="center"
                sx={{px: 5}}
                minHeight="calc(100vh - 225px)"
            >
                <Grid item>
                    <Grid container direction="column" alignItems="start" justifyContent="center"> 
                        <IconButton onClick={() => props.changeMod()}>
                            <ArrowBackIcon color='primary'/>
                        </IconButton>
                        <Grid item sx={{pb: 6, pt: 3}}>
                            <Typography variant="h3" component="h3" style={{fontWeight: 900}}>Riepilogo dei dati</Typography>
                            <Typography sx={{pt: 1}}>{"DISTRETTO: " + stateAuth.selectedDistrict.toUpperCase()}</Typography>
                        </Grid>
                        <Grid item>
                            <Grid key="containerSezioni" container direction={{ xs: "column", md: "row" }}>
                                <Grid item>
                                    <Grid key="contSingleSez" container direction="column">
                                        {
                                            titles.map((title, index) => (
                                                <TitleAndDescription key={title} title={title} description={descriptions[index]} pb={undefined} />
                                            ))
                                        }
                                    </Grid>
                                </Grid>
                                <Grid item sx={{px: 6, pb: 2}}>
                                    <Divider orientation='vertical'/>
                                </Grid>
                                {
                                    Object.keys(stateTurni.availability).sort().map((turno, index) =>
                                        <ElementSingleTurno key={turno} turno={turno} index={index} stateTurni={stateTurni} />)
                                }
                            </Grid>
                        </Grid>
                        <Grid item>
                            <Box sx={{ my: 2, position: 'relative' }}>
                                <Button
                                    variant="contained"
                                    disabled={loading}
                                    onClick={onConfirm}
                                >
                                    Conferma
                                </Button>
                                {loading &&
                                    (<CircularProgress
                                        size={24}
                                        sx={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            marginTop: '-12px',
                                            marginLeft: '-12px',
                                        }}
                                    />)
                                }
                            </Box>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
    )
}

interface PropsElementSingleTurno {
    turno: string,
    index: number
    stateTurni: any,
}

const ElementSingleTurno = (props: PropsElementSingleTurno) => {
    // availability holds timestamps: show day of month
    const disp_medico = props.stateTurni.availability[props.turno].map((t: number) => new Date(t).getDate()).sort((a: number, b: number) => a - b)
    const textDescription = disp_medico.map((disp: number) => getGiornoSettimana(props.stateTurni.timestamp_month!, disp) + ' ' + disp).join("\n")
    return (
        <>
            <Grid item>
                <TitleAndDescription title={"Turno " + props.turno} description={textDescription} pb={1} />
            </Grid>
            {
                (props.index !== Object.keys(props.stateTurni.availability).length - 1) &&
                <Grid item sx={{ px: 6, pb: 2 }} >
                    <Divider orientation='vertical' />
                </Grid>
            }
        </>
    )
}