import Grid from '@mui/material/Grid'
import Head from 'next/head';
import HandlerSpecialTurni from '../components/admin_pages/change_single_turno';

export default function ConfigurationAdmin() {

  return (
    <>
      <Head>
        <title>Modifica turni</title>
      </Head>
      <Grid container
        display="flex"
        direction="column"
        alignItems="center"
        justifyContent="center"
        minHeight="calc(100vh - 207px)" //* Così è perfetto su Mac
        sx = {{ pb: 5 }}
      >
        <Grid item>
          <HandlerSpecialTurni />
        </Grid>
      </Grid>
    </>
  )
}

/**
 * import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import AddIcon from '@mui/icons-material/Add';
import SingleSede from '../components/admin_pages/single_sede';
import MessageSnackbar from '../components/snackbar/message_snackbar';
import Greetings from '../components/general/greetings';
import { setConfigurationDistrettoMese } from '../logic/server/firestore'
import { useState, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../logic/redux/store'
import { addSede, Turno } from '../logic/redux/configuration_distretto_slice'
import Head from 'next/head';
import { AppFirebaseError } from '../logic/server/firebase';
import { setMessageError } from '../logic/redux/settings_slice';
import { SelectMeseCalendar } from '../components/calendar';
import HandlerSpecialTurni from '../components/admin_pages/change_single_turno';

export default function ConfigurationAdmin() {
  const configurationDistrState = useAppSelector(state => state.configurationDistr)
  const dispatch = useAppDispatch()
  const [ loading, setLoading ] = useState(false)
  const [ infoSent, setInfoSent ] = useState(false)
  const [ isOpenSnackbar, setIsOpenSnackbar ] = useState(false)
  const [messageSnackbar, setMessageSnackbar] = useState("")
  const [timestampMese, setTimestampMese] = useState(Date.now())
  //TODO: Aggiungere scelta del mese

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
      if(!validateTurni(sede.fasce_turno)) return false
    }
    return true
  }

  const validateTurni = (fasce_turno: Turno[]) => {
    const regex = /^[0-9]{1,2}[-][0-9]{1,2}$/
    for(let i = 0; i < fasce_turno.length; i++) {
        if(!regex.test(fasce_turno[i].fascia)) {
          showError("Gli orari dei turni devono rispettare il formato 'orario'-'orario'")
          return false
        }
    }
    const listFascie = fasce_turno.map(val => val.fascia)
    if(new Set(listFascie).size !== listFascie.length) {
      showError("Nella stessa sede non ci possono essere più turni con lo stesso orario")
      return false
    }
    for(let fascia of fasce_turno) {
      if(fascia.fascia.split('-')[0] === fascia.fascia.split('-')[1]) {
        showError("Un orario non può iniziare e finire nello stesso momento")
        return false
      }
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
      fasce_turno: undefined
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
        alignItems="center"
        justifyContent="center"
        sx = {{ pb: 5 }}
      >
        <Grid item sx={{ py: 2 }}>
          <HandlerSpecialTurni />
        </Grid>
        <Grid item sx={{ py: 2 }}>
          <Typography fontWeight="fontWeightBold" variant="h6" component="h6" sx={{ py: 2 }}>
            Scegli il mese
          </Typography>
          <SelectMeseCalendar timestamp_mese={timestampMese} onChange={(newValue) => {
            if (newValue !== null) {
              setTimestampMese(newValue.toDate().getTime())
            }
          }} />
        </Grid>
        <Grid container
          display="flex"
          direction="row"
          alignItems="center"
          justifyContent="center"
        >  
        {
          configurationDistrState.sedi.map((val, index) => {
            return (
              <SingleSede key={index} index={index}/>
            )
          })
        }
        <Grid item>
          <Button onClick={addNewSede} sx={{ borderRadius: 50, py: 1.8 }} variant='outlined'>
            <AddIcon fontSize="large"/>
          </Button>
        </Grid>
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
 */