import { useState } from 'react'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import GruppoTurni from './gruppo_turni';
import { useAppSelector } from '../../logic/redux/store'
import MessageSnackbar from '../snackbar/message_snackbar'

export interface PropsDisponibilita {
    changeMod: Function
}

export default function ModuleDisponibilita(props: PropsDisponibilita) {
    const generalState = useAppSelector((state) => state.turni)
    const distretto = useAppSelector(state => state.settings.distretto)
    const [messageSnackbar, setMessageSnackbar] = useState("");

    const handleSubmit = () => {
        if (generalState.sedi.length === 0) {
            setMessageSnackbar('Devi selezionare almeno una sede');
        } else if (Object.values(generalState.disponibilita).length === 0) {
            setMessageSnackbar('Devi selezionare almeno una disponibilità');
        } else if (generalState.oreMassime <= 0) {
            setMessageSnackbar('Inserisci un numero valido per i turni massimi');
        } else {
            props.changeMod()
        }
    }

    return (
        <Grid container direction="column" alignItems="center" justifyContent="center" minHeight="calc(100vh - 225px)" sx={{px: 3}}>
            <Grid item>
                <Grid container spacing={2} sx={{ pt: 3 }}
                    direction="column"
                    alignItems={{ xs: "center", lg: "start"}}
                    //alignItems="start"
                >
                    <Grid item>
                        <Typography variant="h3" component="h3" style={{ fontWeight: 900 }} sx={{ textAlign: { xs: "center", lg: "left" } }}>
                            Raccolta disponibilità
                        </Typography>
                        <Typography variant="h6" component="h6" sx={{ textAlign: { xs: "center", lg: "left" } }}>
                            {"DISTRETTO: " + (distretto.toUpperCase())}
                        </Typography>

                    </Grid>
                    <Grid item>
                        <GruppoTurni distretto={distretto} />
                    </Grid>
                    <Grid item>
                        <Button variant="contained" onClick={handleSubmit} style={{ width: '100px' }}>
                            Invia
                        </Button>
                    </Grid>
                </Grid>
                {
                    /**
                     <Image src="./grafiche/bg2.svg" alt="" width="500" height="270" 
                    style={{
                        position: 'absolute', 
                        right: 0, 
                        bottom: 0
                    }}/>
                    * 
                    */
                }
                <MessageSnackbar isOpen={messageSnackbar !== ""} handleClose={() => setMessageSnackbar("")} message={messageSnackbar}/>

            </Grid>
        </Grid>
            
    )
}
