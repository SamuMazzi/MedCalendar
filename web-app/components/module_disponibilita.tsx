import { useState } from 'react'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import GruppoTurni from '../components/gruppo_turni';
import { RootState, useAppSelector } from '../logic/redux/store'
import MessageSnackbar from './message_snackbar'

export interface PropsDisponibilita {
    distretto: string | undefined,
    changeMod: Function
}

export default function ModuleDisponibilita(props: PropsDisponibilita) {
    const generalState = useAppSelector((state: RootState) => state.turni)
    const [messageSnackbar, setMessageSnackbar] = useState("");

    const handleSubmit = () => {
        if (generalState.sedi.length === 0) {
            setMessageSnackbar('Devi selezionare almeno una sede');
        } else if (Object.values(generalState.disponibilita).length === 0) {
            setMessageSnackbar('Devi selezionare almeno una disponibilità');
        } else if (generalState.oreMassime <= 0) {
            setMessageSnackbar('Inserisci un numero valido per le ore massime');
        } else {
            props.changeMod()
        }
    }

    return (
        <>
            <Grid container spacing={2} sx={{ pl: "23%", pt: "3%" }}
                direction="column"
                alignItems="start"
                style={{ minHeight: '100vh', minWidth: '100vh' }}
            >
                <Typography style={{ fontWeight: 900, fontSize: 52 }}>
                    Raccolta disponibilità
                </Typography>
                <Typography variant="h6" component="h6">
                    {"DISTRETTO: " + (props.distretto !== undefined ? props.distretto!.toUpperCase() : "")}
                </Typography>
                <GruppoTurni distretto={props.distretto} />
                <Button variant="contained" onClick={handleSubmit} style={{ width: '100px' }}>
                    Invia
                </Button>
            </Grid>
            <MessageSnackbar isOpen={messageSnackbar !== ""} handleClose={() => setMessageSnackbar("")} message={messageSnackbar}/>
        </>
    )
}
