import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import AddIcon from '@mui/icons-material/Add';
import SingleSede from '../components/single_sede_admin';
import { MenuAppBar } from '../components/app_bar';
import MessageSnackbar from '../components/message_snackbar';
import Greetings from '../components/greetings';
import { setConfigurationDistrettoMese } from '../logic/server/firestore'
import { useState, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../logic/redux/store'
import { addSede, Turno } from '../logic/redux/configuration_distretto_slice'
import Head from 'next/head';

export default function Raccolta() {
  const configurationDistrState = useAppSelector(state => state.configurationDistr)
  const dispatch = useAppDispatch()
  const [ loading, setLoading ] = useState(false)
  const [ infoSent, setInfoSent ] = useState(false)
  const [ isOpenSnackbar, setIsOpenSnackbar ] = useState(false)
  const [ messageSnackbar, setMessageSnackbar ] = useState("")
  /**
   * 1. Admin inserisce una o più sedi (a cui da un nome), poi per ogni sede:
   * 1a. Numero di medici per turno
   * 1b. Definire turni
   * 1c. I giorni coperti da questi turni (per una settimana)
   * 2. Bisogna poter fare modifiche puntuali a specifici giorni //!
   */

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
      showError(e.toString())
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
      <MenuAppBar />
      <Grid container
        display="flex"
        direction="column"
        alignItems="center"
        justifyContent="center"
        sx = {{ pb: 5 }}
        //sx={{minWidth: "200px"}}
      >
        <Typography variant="h3" component="h3" sx={{py: 5}}>Pagina admin!</Typography>
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