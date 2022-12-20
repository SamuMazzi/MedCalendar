import { Grid, TextField, Button, Card, Container, Typography, FormControl, InputLabel, Select, MenuItem, CircularProgress, FormHelperText } from '@mui/material'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { signInAdminWithEmail, SignError } from '../logic/server/auth';
import { getAllMedici } from '../logic/server/firestore';
import { setAdmin, setUser } from '../logic/redux/auth_slice';
import { useAppDispatch } from '../logic/redux/store';
import { saveToStorage, getFromStorage } from '../logic/local_storage';

const AdminLogin = () => {
  const [ email, setEmail ] = useState("");
  const [ password, setPassword ] = useState("");
  const [ helperMail, setHelperMail ] = useState("");
  const [ helperPassword, setHelperPassword ] = useState("");
  const [ loading, setLoading ] = useState(false);
  const router = useRouter()
  const dispatch = useAppDispatch()

  const handleSignError = (error: any) => {
    if (error instanceof SignError) {
      if(error.type === 'email') {
        setHelperMail(error.message);
      } else if (error.type === 'password') {
        setHelperPassword(error.message);
      }
    } else {
      console.log('Generic error: ' + error);
    }
  }
    
  const signIn = async () => {
    const user = await signInAdminWithEmail(email, password)
    dispatch(setAdmin(true))
    dispatch(setUser({
      id: user.uid, 
      data: {}
    }))
  }
    
  const onSubmit = async () => {
    if (password.length === 0) {
      setHelperPassword("Inserisci una password")
      setHelperMail("")
    } else if (email.length) {
      setHelperMail("Inserisci una mail")
      setHelperPassword("")
    } else {
      setLoading(true)
      try {
        await signIn()
        router.push('/admin_page')
      } catch (error) {
        handleSignError(error)
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <Container>
      <Typography
        fontWeight="fontWeightBold"
        style={{fontSize: 24}}
        sx={{
          as: 'center',
          mb: '20px',
        }}
      >
        Amministrazione
      </Typography>
      <Grid item>
        <TextField
            helperText={helperMail}
            error={helperMail.length !== 0}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            label={"Email"}
        />
      </Grid>
        <br />
      <Grid>
        <TextField 
            type="password"
            helperText={helperPassword}
            error={helperPassword.length !== 0}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            label={"Password"}
        />
      </Grid>
        <br/>
        <Button onClick={onSubmit} disabled={loading}>
            Accedi
        </Button>
      </Container>
  )
}

const MedicoLogin = () => {
    const [ allMedici, setAllMedici ] = useState<Record<string, Record<any, any>>>({});
    const [ medicoSelected, setMedico ] = useState("");
    const [ helperText, setHelperText ] = useState("");
    const [ loading, setLoading ] = useState(false);
    const router = useRouter()
    const dispatch = useAppDispatch()

    const onSubmit = () => {
      if (!medicoSelected) {
        setHelperText("Seleziona un medico")
        return;
      }
      console.log(allMedici[medicoSelected]);
      dispatch(setUser({id: medicoSelected, data: allMedici[medicoSelected]}))
      dispatch(setAdmin(false))
      router.push("/")
    }

    const retrieveMedici = async () => {
      setLoading(true)
      let docs = getFromStorage("all_medici")
      if (docs !== undefined) {
        docs = await getAllMedici()
        saveToStorage("all_medici", docs)
      }
      console.log(docs);
      setAllMedici(docs)
      setLoading(false)
    }

    useEffect(() => {
      retrieveMedici();
    }, [])

    return (
        <Container>
          <Typography
            fontWeight="fontWeightBold"
            style={{fontSize: 24}}
            sx={{
              as: 'center',
              mb: '20px',
            }}
          >
            Accedi
          </Typography>
          {
            loading && <CircularProgress />
          }
          {
            !loading &&
            <FormControl fullWidth>
                <InputLabel>Medici</InputLabel>
                <Select
                  value={medicoSelected}
                  label="Medici"
                  onChange={(event) => setMedico(event.target.value)}
                  style={{borderColor: helperText ? "red" : undefined}}
                >
                  {Object.keys(allMedici).map((id_medico) => {
                    return (
                      <MenuItem value={id_medico} key={id_medico}>
                        {allMedici[id_medico].nome}
                      </MenuItem>)
                    })
                  }
                </Select>
                <FormHelperText error>
                  {helperText}
                </FormHelperText>
              </FormControl>
          }
            <Button onClick={onSubmit} disabled={loading}>
                Continua
            </Button>
        </Container>
  )
}

export default function FormLogin() {
    const [ adminMode, setAdminMode ] = useState(false);
    //Guarda qua per transizione https://mui.com/material-ui/transitions/#slide-relative-to-a-container
    return (
    <Grid 
        container
        display="flex"
        alignItems="center"
        justifyContent="center"
        sx={{ minHeight: '100vh' }}
      >
        <Card sx={{ mw: '420px', p: '20px' }} variant="outlined">
            {
              adminMode && <AdminLogin />
            }
            {
              !adminMode && <MedicoLogin />
            }
            <Button onClick={() => setAdminMode(oldVal => !oldVal)}>
              {!adminMode && "Sei un amministratore? Clicca qua"}
              {adminMode && "Sei un medico? Clicca qua"}
            </Button>
        </Card>
      </Grid>
  )
}