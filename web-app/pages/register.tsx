import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Step from '@mui/material/Step'
import StepButton from '@mui/material/StepButton'
import Stepper from '@mui/material/Stepper'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ListItemIcon from '@mui/material/ListItemIcon'
import Divider from '@mui/material/Divider'
import { useAppDispatch, useAppSelector } from '../logic/redux/store'
import EnhancedTable from '../components/table_doctors'
import { startSubscription } from '../logic/server/firestore/stripe'
import { FormTextField } from '../components/login/form_components'
import { registerAdminWithEmail, SignError } from '../logic/server/auth'
import { AppFirebaseError } from '../logic/server/firebase'
import { setMessageError } from '../logic/redux/settings_slice'
import { setAdmin, setUser } from '../logic/redux/auth_slice'
import ConfigurationAdmin from '../components/admin_pages/create_configuration_admin'
import { setPasswordDistrettoSlice } from '../logic/redux/configuration_distretto_slice'

// #1a77d1
// #64b5f4
// #d9ebfc

function Register(props: PropsPageStepper) {
    const [email, setEmail] = useState("")
    const [passwordDistretto, setPasswordDistretto] = useState("")
    const [password, setPassword] = useState("")
    const [confermaPassword, setConfermaPassword] = useState("")
    const [helperMail, setHelperMail] = useState("")
    const [helperPasswordDistretto, setHelperPasswordDistretto] = useState("")
    const [helperPassword, setHelperPassword] = useState("")
    const [helperConfermaPassword, setHelperConfermaPassword] = useState("")
    const [nomeDistretto, setNomeDistretto] = useState("")
    const [helperNomeDistretto, setHelperNomeDistretto] = useState("")
    const [loading, setLoading] = useState(false)
    const dispatch = useAppDispatch()

    const handleSignError = (error: any) => {
        if (error instanceof SignError) {
            if (error.type === 'email') {
                setHelperMail(error.message);
            } else if (error.type === 'password') {
                setHelperPassword(error.message);
            }
        } else if (error instanceof AppFirebaseError) {
            dispatch(setMessageError(error.message))
        } else {
            //console.log(error)
            dispatch(setMessageError("Si è verificato un errore, riprovare"))
        }
    }
    
    const signIn = async () => {
        const user = await registerAdminWithEmail(email, password)
        dispatch(setAdmin(true))
        dispatch(setUser({
            uid: user.uid,
            data: {}
        }))
    }

    const onSubmit = async () => {
        setHelperMail("")
        setHelperPasswordDistretto("")
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
        } else if (passwordDistretto.length === 0) {
            setHelperPasswordDistretto("Inserisci una password per il distretto")
        } else if (nomeDistretto.length === 0) {
            setHelperNomeDistretto("Inserisci un nome")
            return false
        } else if (nomeDistretto.length > 15) {
            setHelperNomeDistretto("Lunghezza massima di 15 caratteri")
            return false
        } else {
            setLoading(true)
            try {
                await signIn()
                dispatch(setPasswordDistrettoSlice(password))
                props.nextPage()
            } catch (error) {
                console.log(error)
                handleSignError(error)
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
                <Grid item sx={{mb: 2}} textAlign="left">
                    <Typography style={{fontWeight: 600}}>
                        Account
                    </Typography>
                    <Typography style={{fontWeight: 300}}>
                        Inserisci i tuoi dati da amministratore. Tutte le modifiche verranno salvate su questo account.
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
                        Registrati
                    </Button>
                </Grid>
            </Grid>
        </Grid>
    </Grid>
  )
}

//TODO: Visualizzazione turni su pagina online -> come tabella solita ma senza avere la possibilità di modificare? O forse in una tabella filtrabile, magari vedendo direttamente i propri turni
//TODO: Fai settare al medico la password per i turni, oppure fai scegliere all'admin cosa fare, cioè se obbligare i medici ad iscriversi o accesso con password
//TODO: Modifica logica password... devono essere controllate sul server (GCF)

interface PropsProElementList {
    label: string
}

const ProElementList = (props: PropsProElementList) => {
    return (
        <ListItem>
            <ListItemIcon>
                <CheckRoundedIcon />
            </ListItemIcon>
            <ListItemText 
                primary={props.label}
            />
        </ListItem>
    )
}

const PagePlans = () => {
    return (
        <Box
            style={{backgroundColor: 'white'}}
            sx={{py: 2}}
            alignItems="center"
            justifyContent="center"
            display="flex"
        >
            <Box sx={{borderRadius: 8, mr: 4, p: 2, backgroundColor: '#1a77d1', maxWidth: 300}} 
                alignItems="center"
                style={{color: 'white'}}
            >
                <Typography variant="h4" textAlign="center">
                    Guardia medica
                </Typography>
                <List dense>
                    <ProElementList label="Configura liberamente la struttura dei turni"/>
                    <ProElementList label="Raccogli le disponibilità dai medici"/>
                    <ProElementList label="Lascia che il nostro servizio crei i turni"/>
                    <ProElementList label="Applica tutte le modifiche che vuoi"/>
                    <ProElementList label="Ottieni le info su un Excel"/>
                </List>
                <Divider />
                <List dense>
                    <ProElementList label="Massimo 90 medici"/>
                    <ProElementList label="Massimo 7 sedi"/>
                    <ProElementList label="Massimo 4 configurazioni regolari"/>
                </List>
                <Button variant="contained" style={{textAlign: 'center', color: '#1a77d1', backgroundColor: 'white'}} sx={{mt: 2}}>
                    Scegli questo piano!
                </Button>
            </Box>
            <Box sx={{borderRadius: 8, p: 2, backgroundColor: 'white', maxWidth: 300}} alignItems="center">
                <Typography variant="h4">
                    Personalizzato
                </Typography>
                <Typography>
                    - Hai esigenze maggiori?
                </Typography>
                <Button>
                    Contattaci
                </Button>
            </Box>
        </Box>
      )
}

const PayPage = () => {
    return (
        <Box>
            <Button onClick={() => startSubscription('price_1MlKoXLQn1xS5BAMTOjsk8kM')}>
                Paga
            </Button>
        </Box>
    )
}

//TODO: Metti SignInAnonymously per medici normali, cosi puoi modificare i settings di sicurezza
const AddDoctorsPage = (props: PropsPageStepper) => {

    return (
        <Box>
            <TableDoctors />
            <Button variant="contained" onClick={props.nextPage}>
                Continua
            </Button>
        </Box>
    )
}

const TableDoctors = () => {
    const doctors = useAppSelector(state => state.mediciAdmin.doctors)
    const dispatch = useAppDispatch()

    return (
        <Box sx={{px: 15, py: 5}}>
            <EnhancedTable />
        </Box>
    )
}

const ConfigurationTurniPage = () => {
    return (
        <ConfigurationAdmin />
    )
}

interface PropsPageStepper {
    nextPage: () => void
}

export default function PageCreaTurni() {
    const steps = ['Seleziona il piano', 'Registrati', 'Pianifica i turni', 'Inserisci i medici', 'Paga']
    const [step, setStep] = useState(0)
    const nextPage = () => {
        if(step < steps.length - 1) {
            setStep(old => old + 1)
        }
    }
    const pages = [
        <PagePlans key="Page_plans" />, 
        <Register nextPage={nextPage} key="register_page" />, 
        <ConfigurationTurniPage key="configuration_page" />, 
        <AddDoctorsPage nextPage={nextPage} key="med_page"/>, 
        <PayPage key="pay_page"/>
    ]

    return (
        <Box style={{backgroundColor: 'white'}}>
        <Stepper activeStep={step} alternativeLabel>
            {steps.map((label, index) => (
                <Step key={label}>
                    <StepButton onClick={() => setStep(index)}>
                        {label}
                    </StepButton>
                </Step>
            ))}
        </Stepper>
        {pages[step]}
        <Button onClick={() => setStep(old => old + 1 )} disabled={step >= steps.length - 1}>
            Continua
        </Button>
    </Box>
    )
}
