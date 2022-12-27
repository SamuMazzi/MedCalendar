import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAppSelector, useAppDispatch } from '../logic/redux/store'
import { clearState } from '../logic/redux/turni_slice';
import { getGiornoSettimana, mesi } from '../logic/local_storage'
import { PropsDisponibilita } from './module_disponibilita'
import { useState } from 'react'
import { setMeseMedico } from '../logic/server/firestore';
import Greetings from './greetings';
import CircularProgress from '@mui/material/CircularProgress'

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

export default function RiepilogoDisponibilita(props: PropsDisponibilita) {
    const [ done, setDone ] = useState(false)
    const stateTurni = useAppSelector(state => state.turni)
    const stateAuth = useAppSelector(state => state.auth)
    const textMese = mesi[new Date(stateTurni.mese!).getMonth() + 1]
    const titles = ['Medico', 'Ruolo', 'Sedi', 'Mese', 'Ore massime']
    const descriptions = [(stateAuth ? stateAuth.nome : "")!, 'Mock', stateTurni.sedi.join(', '), textMese, stateTurni.oreMassime.toString()]
    const generalState = useAppSelector((state) => state.turni)
    const [loading, setLoading] = useState(false)
    const dispatch = useAppDispatch()

    const onConfirm = async () => {
        setLoading(true)
        try {
            console.log('Setting mese...')
            await setMeseMedico(props.distretto!, stateAuth.id, generalState)
            dispatch(clearState())
            setDone(true)
        } catch(e: any) {
            console.log('error ' + e.toString())
        } finally {
            setLoading(false)
        }
    }

    return (
        done ? <Greetings /> :
            <Grid container direction="column" alignItems="start" sx={{ pl: "22%"}}> 
                <IconButton onClick={() => props.changeMod()}>
                    <ArrowBackIcon color='primary'/>
                </IconButton>
                <Grid item sx={{pb: 6, pt: 3}}>
                    <Typography variant="h3" component="h3" style={{fontWeight: 900}}>Riepilogo dei dati</Typography>
                    <Typography sx={{pt: 1}}>{"DISTRETTO: " + (props.distretto !== undefined ? props.distretto!.toUpperCase() : "")}</Typography>
                </Grid>
                <Grid item>
                    <Grid container direction="row">
                        <Grid item>
                            <Grid container direction="column">
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
                            Object.keys(stateTurni.disponibilita).map((turno, index) => {
                                const disp_medico = [...stateTurni.disponibilita[turno]].sort()
                                const textDescription = disp_medico.map(disp => getGiornoSettimana(stateTurni.mese!, disp) + ' ' + disp).join("\n")
                                return (
                                    <>
                                        <Grid key={turno+index} item>
                                            <TitleAndDescription title={"Turno " + turno} description={textDescription} pb={1} />
                                        </Grid>
                                        {
                                            (index !== Object.keys(stateTurni.disponibilita).length - 1) &&
                                            <Grid item sx={{ px: 6, pb: 2 }}>
                                                <Divider orientation='vertical' />
                                            </Grid>
                                        }
                                    </>
                                )
                            })
                        }
                    </Grid>
                </Grid>
                <Grid item>
                    <Box sx={{ m: 1, position: 'relative' }}>
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
    )
}