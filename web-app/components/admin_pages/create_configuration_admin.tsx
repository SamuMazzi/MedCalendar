import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import AddIcon from '@mui/icons-material/AddRounded';
import SingleSede from './single_sede';
import MessageSnackbar from '../snackbar/message_snackbar';
import Greetings from '../general/greetings';
import { setConfigurationDistrettoMese } from '../../logic/server/firestore/distretti'
import { useState, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../../logic/redux/store'
import { addSede } from '../../logic/redux/configuration_distretto_slice'
import Head from 'next/head';
import { AppFirebaseError } from '../../logic/server/firebase';
import { setMessageError } from '../../logic/redux/settings_slice';
import HandlerSpecialTurni from './change_single_turno';
import { FormTextField } from '../login/form_components';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';

interface PropsTitleSection {
    title: string
    description?: string
}

const TitleSection = (props: PropsTitleSection) => {
    return (
        <>
            <Grid item sx={{mt: 2}}>
                <Typography variant="h5">
                    {props.title}
                </Typography>
            </Grid>
            <Grid item sx={{mb: 2}}>
                <Typography style={{fontWeight: 300}}>
                    {props.description}
                </Typography>
            </Grid>
        </>
    )
}

export default function ConfigurationAdmin() {
    //TODO: Numero massimo di turni notturni per mese
    //TODO: distanza temporale minima fra turni (diurni/notturni)
  const configurationDistrState = useAppSelector(state => state.configurationDistr)
  const dispatch = useAppDispatch()
  const [ loading, setLoading ] = useState(false)
  const [ infoSent, setInfoSent ] = useState(false)
  const [ isOpenSnackbar, setIsOpenSnackbar ] = useState(false)
  const [messageSnackbar, setMessageSnackbar] = useState("")
  const [nomeDistretto, setNomeDistretto] = useState("")
  const [helperNomeDistretto, setHelperNomeDistretto] = useState("")

  const showError = (msg: string) => {
    setMessageSnackbar(msg)
    setIsOpenSnackbar(true)
  }
  const validateConfiguration = () => {
    for(let sede of configurationDistrState.sedi) {
      if(!sede.nome) {
        showError("Il nome di una sede non può essere vuoto")
        return false
      }
    }
    if (nomeDistretto.length === 0) {
        setHelperNomeDistretto("Inserisci un nome")
        return false
    } else if (nomeDistretto.length > 15) {
        setHelperNomeDistretto("Lunghezza massima di 15 caratteri")
        return false
    } 
    return true
  }

  const creaConfiguration = async () => {
    setLoading(true)
    try {
      if(validateConfiguration()) {
        //new Date() dovrebbe essere del mese dopo
        await setConfigurationDistrettoMese(new Date(), "distretto", configurationDistrState.sedi)
        setInfoSent(true)
      }
    } catch (e: any) {
      if (e instanceof AppFirebaseError) {
        dispatch(setMessageError(e.message))
      } else {
        showError(e.toString())
      }
    } finally {
      setLoading(false)
    }
  }
  
  const addNewSede = async () => {
    //* Crea std sede
    const newIndex = configurationDistrState.sedi.length
    dispatch(addSede({
      index: newIndex,
      nome: "Sede "+newIndex.toString(),
      medici_per_turno: 1,
      mode_turno: 'Interi'
    }))
  }

  useEffect(() => {
    if(configurationDistrState.sedi.length === 0) {
      addNewSede()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  return (
    <>
      <Head>
        <title>Aggiungi turni</title>
      </Head>
      <Grid container
        display="flex"
        direction="column"
        alignItems="start"
        justifyContent="center"
        sx = {{ pb: 5, mt: 2, ml: 3 }}
      >
        <TitleSection title="Inserisci il nome del distretto" description='Attento, non potrai cambiarlo dopo!'/>
        <Grid item sx={{mb: 3}}>
            <FormTextField 
                value={nomeDistretto}
                helperText={helperNomeDistretto}
                onChangeFn={(newVal) => setNomeDistretto(newVal)}
                placeholder='Nome distretto'
            />
        </Grid>
        <Divider flexItem />
        <TitleSection title="Crea le sedi" description='Puoi impostare i medici per ogni sede'/> 
        <Grid container
          display="flex"
          direction="row"
          alignItems="center"
          justifyContent="center"
          sx={{mb: 3}}
        >  
        {
          configurationDistrState.sedi.map((val, index) => {
            return (
              <SingleSede key={index} index={index}/>
            )
          })
        }
            <Grid item>
                <IconButton onClick={addNewSede}>
                    <AddIcon/>
                </IconButton>
            </Grid>
        </Grid>
        <Divider flexItem />
        <TitleSection title="Modifiche ai turni" description='Qui puoi inserire degli specifici turni extra dovuti a vari eventi in quella zona (non preoccuparti se ti dimentichi qualcosa, potrai aggiungerli o rimuoverli in futuro'/>
        <Grid item sx={{ py: 2 }}>
          <HandlerSpecialTurni />
        </Grid>
        {
          !infoSent ? <Button
            variant="contained"
            component="label"
            onClick={creaConfiguration}
          >
            Invia
          </Button>
          :
          <Greetings />
        }
        {
          loading && <CircularProgress />
        }
        <MessageSnackbar isOpen={isOpenSnackbar} handleClose={() => setIsOpenSnackbar(false)} message={messageSnackbar}/>
      </Grid>
    </>
  )
}