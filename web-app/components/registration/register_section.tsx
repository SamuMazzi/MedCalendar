import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import { useEffect, useState } from 'react'
import { useAppDispatch } from '../../logic/redux/store'
import { FormTextField } from '../login/form_components'
import { registerAdminWithEmail, signInWithGoogle } from '../../logic/server/auth'
import { AppFirebaseError } from '../../logic/server/firebase'
import { setDistrettoSlice, setMessageError } from '../../logic/redux/settings_slice'
import { setAdmin, setUser } from '../../logic/redux/auth_slice'
import { setNameDistrettoSlice, setPasswordDistrettoSlice } from '../../logic/redux/configuration_distretto_slice'
import { checkIfDistrettoExists } from '../../logic/server/firestore/distretti'
import useUser from '../../logic/hooks/use_user'
import Divider from '@mui/material/Divider'

interface PropsPageStepper {
    nextPage: () => void
}
//TODO: Add conferma password distretto
//TODO: Add google sign in
export const RegisterAdminSection = (props: PropsPageStepper) => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confermaPassword, setConfermaPassword] = useState("")
    const [helperMail, setHelperMail] = useState("")
    const [helperConfermaPassword, setHelperConfermaPassword] = useState("")
    const [helperPassword, setHelperPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [user] = useUser()
    const dispatch = useAppDispatch()

    useEffect(() => {
        if (user.uid) { //Utente esiste già
            props.nextPage()
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleSignError = (error: any) => {
        if (error instanceof AppFirebaseError) {
            if (error.signinType === 'email') {
                setHelperMail(error.message);
            } else if (error.type === 'password') {
                setHelperPassword(error.message);
            } else {
                dispatch(setMessageError(error.message))
            }
        } else {
            dispatch(setMessageError("Si è verificato un errore, riprovare"))
        }
    }
    
    const signIn = async () => {
        const user = await registerAdminWithEmail(email, password)
        if (user.metadata.creationTime != user.metadata.lastSignInTime) { //* Which means that it's not the first time accessing and so he has some info saved in the cloud

        }
        dispatch(setAdmin(true))
        dispatch(setUser({
            uid: user.uid,
            data: {}
        }))
    }

    const onSubmit = async () => {
        setHelperMail("")
        setHelperPassword("")
        setHelperConfermaPassword("")
        if (password.length === 0) {
            setHelperPassword("Inserisci una password")
        } else if (email.length === 0) {
            setHelperMail("Inserisci una mail")
        } else if (confermaPassword.length === 0) {
            setHelperConfermaPassword("Inserisci di nuovo la password")
        } else if (confermaPassword !== password) {
            setHelperConfermaPassword("Le password devono combaciare")
        } else {
            setLoading(true)
            try {
                await signIn()
                props.nextPage()
            } catch (error) {
                handleSignError(error)
            } finally {
                setLoading(false)
            }
        }
    }

    const handleButtonGoogle = async () => {
        setLoading(true)
        try {
            await signInWithGoogle()
            props.nextPage()
        } catch (error) {
            handleSignError(error)
        } finally {
            setLoading(false)
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
                <Grid item sx={{mb: 2}} textAlign="left">
                    <Typography style={{fontWeight: 600}}>
                        Account
                    </Typography>
                    <Typography style={{fontWeight: 300}}>
                        Inserisci i tuoi dati da amministratore.
                    </Typography>
                </Grid>
                <Grid item>
                    <FormTextField 
                        value={email}
                        helperText={helperMail}
                        onChangeFn={(newVal) => setEmail(newVal)}
                        placeholder='Email'
                    />
                </Grid>
                <Grid item>
                    <FormTextField 
                        value={password}
                        helperText={helperPassword}
                        onChangeFn={(newVal) => setPassword(newVal)}
                        password
                        placeholder='Password'
                    />
                </Grid>
                <Grid item>
                    <FormTextField 
                        value={confermaPassword}
                        helperText={helperConfermaPassword}
                        onChangeFn={(newVal) => setConfermaPassword(newVal)}
                        password
                        placeholder='Conferma password'
                    />
                </Grid>
                <Grid item>
                    <Button variant="contained" onClick={onSubmit} disabled={loading} sx={{width: 250, mt: 2}}>
                        Registrati
                    </Button>
                </Grid>
                <Grid item width={250}>
                    <Divider>
                        <Typography color="grey">
                            Oppure
                        </Typography>
                    </Divider>
                </Grid>
                <Grid item>
                    <Button variant="outlined" onClick={handleButtonGoogle} disabled={loading}
                        startIcon={<Avatar src="logoGoogle.png" sx={{height: 30, width: 30}} />} 
                        sx={{height: 40}}>
                        Registrati con Google
                    </Button>
                </Grid>
            </Grid>
        </Grid>
    </Grid>
  )
}

export const RegisterDistrettoSection = (props: PropsPageStepper) => {
    const [passwordDistretto, setPasswordDistretto] = useState("")
    const [helperPasswordDistretto, setHelperPasswordDistretto] = useState("")
    const [nomeDistretto, setNomeDistretto] = useState("")
    const [helperNomeDistretto, setHelperNomeDistretto] = useState("")
    const [loading, setLoading] = useState(false)
    const dispatch = useAppDispatch()

    const onSubmit = async () => {
        setHelperNomeDistretto("")
        setHelperPasswordDistretto("")
        if (passwordDistretto.length === 0) {
            setHelperPasswordDistretto("Inserisci una password per il distretto")
        } else if (nomeDistretto.length === 0) {
            setHelperNomeDistretto("Inserisci un nome")
        } else if (nomeDistretto.length > 15) {
            setHelperNomeDistretto("Lunghezza massima di 15 caratteri")
        } else {
            setLoading(true)
            try {
                if (await checkIfDistrettoExists(nomeDistretto)) {
                    setHelperNomeDistretto('Il nome del distretto esiste già, usane un altro')
                } else {
                    dispatch(setDistrettoSlice(nomeDistretto))
                    dispatch(setNameDistrettoSlice(nomeDistretto))
                    dispatch(setPasswordDistrettoSlice(passwordDistretto))
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
                        <FormTextField 
                            value={nomeDistretto}
                            helperText={helperNomeDistretto}
                            onChangeFn={(newVal) => setNomeDistretto(newVal)}
                            placeholder='Nome distretto'
                        />
                    </Grid>
                    <Grid item>
                        <FormTextField 
                            value={passwordDistretto}
                            helperText={helperPasswordDistretto}
                            onChangeFn={(newVal) => setPasswordDistretto(newVal)}
                            placeholder='Password distretto'
                            password
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