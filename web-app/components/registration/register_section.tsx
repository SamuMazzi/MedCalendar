import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import { useState } from 'react'
import { useAppDispatch } from '../../logic/redux/store'
import { AppFirebaseError } from '../../logic/server/firebase'
import { setMessageError } from '../../logic/redux/settings_slice'
import { setNameDistrictSlice } from '../../logic/redux/configuration_district_slice'
import { checkIfDistrettoExists } from '../../logic/server/firestore/districts'
import { setSelectedDistrict } from '../../logic/redux/auth_slice'

interface PropsPageStepper {
    nextPage: () => void
}

export const RegisterDistrettoSection = (props: PropsPageStepper) => {
    const [nomeDistretto, setNomeDistretto] = useState("")
    const [helperNomeDistretto, setHelperNomeDistretto] = useState("")
    const [loading, setLoading] = useState(false)
    const dispatch = useAppDispatch()

    const onSubmit = async () => {
        setHelperNomeDistretto("")
        if (nomeDistretto.length === 0) {
            setHelperNomeDistretto("Inserisci un nome")
        } else if (nomeDistretto.length > 15) {
            setHelperNomeDistretto("Lunghezza massima di 15 caratteri")
        } else {
            setLoading(true)
            try {
                if (await checkIfDistrettoExists(nomeDistretto)) {
                    setHelperNomeDistretto('Il nome del distretto esiste già, usane un altro')
                } else {
                    dispatch(setSelectedDistrict(nomeDistretto))
                    dispatch(setNameDistrictSlice(nomeDistretto))
                    props.nextPage()
                }
            } catch (error) {
                if (error instanceof AppFirebaseError) {
                    dispatch(setMessageError(error.message))
                } else {
                    dispatch(setMessageError("Si è verificato un errore, riprovare"))
                }
            } finally {
                setLoading(false)
            }
        }
    }
    return (
        <Grid container 
            sx={{py: 4}}
            direction="column"
            alignItems="center"
        >
            <Grid item>
                <Grid container gap={1} direction="column" sx={{borderRadius: 8, maxWidth: 350}} alignItems="center">
                    <Grid item sx={{mt: 4}}>
                        <Typography style={{fontWeight: 600}}>
                            Informazioni distretto
                        </Typography>
                        <Typography style={{fontWeight: 300}}>
                            Imposta il nome del distretto e la password che i medici dovranno inserire per segnare le loro disponibilità
                        </Typography>
                    </Grid>
                    <Grid item sx={{mt: 1}}>
                        <TextField 
                            value={nomeDistretto}
                            helperText={helperNomeDistretto}
                            style={{ width: "230px" }}
                            onChange={(e) => setNomeDistretto(e.target.value)}
                            placeholder='Nome distretto'
                        />
                    </Grid>
                    <Grid item>
                        <Button variant="contained" onClick={onSubmit} disabled={loading}>
                            Registra
                        </Button>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>

    )
}