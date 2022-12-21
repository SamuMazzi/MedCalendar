import { Button, Typography, Grid, CircularProgress } from '@mui/material'
import AddIcon from '@mui/icons-material/Add';
import { getDisponibilitaMeseDistretto, getInfoSediDistretto, setConfigurationDistrettoMese } from '../logic/server/firestore'
import { useState, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../logic/redux/store'
import { addSede, Turno } from '../logic/redux/configuration_distretto_slice'
import SingleSede from '../components/single_sede_admin';
import { Alert, AlertTitle, Snackbar } from '@mui/material';

export default function Raccolta() {
  const [ distretti, setDistretti ] = useState<string[]>([])
  const [ distrettoSel, setDistrettoSel ] = useState("")
  const [ infoDistretto, setInfoDistretto ] = useState({})
  const [ disponibilitaDistretto, setDisponibilitaDistretto ] = useState({})
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

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setIsOpenSnackbar(false);
  };

  const showError = (msg: string) => {
    setMessageSnackbar(msg)
    setIsOpenSnackbar(true)
  }

  const validateConfiguration = () => {
    for(let sede of configurationDistrState.sedi) {
      if(sede.nome) {
        showError("Il nome di una sede non può essere vuoto")
        return
      }
      if(!validateTurni(sede.fasce_turno)) return
    }
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
      validateConfiguration()  
      //new Date() dovrebbe essere del mese dopo
      await setConfigurationDistrettoMese(new Date(), "distretto", configurationDistrState.sedi)
      setInfoSent(true)
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

  const handleSelDistretto = async (distretto: string) => {
    setLoading(true);
    setDistrettoSel(distretto)
    const d = new Date();
    const year = d.getFullYear()
    const month = d.getMonth()
    const dispNextMonth = await getDisponibilitaMeseDistretto(distretto, year, month)
    if (dispNextMonth === undefined) {
      setLoading(false)
      return;
    }
    const info = await getInfoSediDistretto(distretto) //! Da cambiare!!
    setInfoDistretto(info!)
    setDisponibilitaDistretto(dispNextMonth)
  }

  useEffect(() => {
    if(configurationDistrState.sedi.length === 0) {
      addNewSede()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Grid container
      display="flex"
      direction="column"
      alignItems="center"
      justifyContent="center"
      //sx={{minWidth: "200px"}}
    >
      <Typography variant="h3" component="h3" sx={{py: 5}}>Pagina admin!</Typography>
      {
        distretti.map((distretto) => 
          <Button key={distretto} onClick={() => handleSelDistretto(distretto)}>
            {distretto}
          </Button>
        )
      }
      <Grid container
        display="flex"
        direction="row"
        alignItems="center"
        justifyContent="center"
        //sx={{minWidth: "200px"}}
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
        <Alert severity="success" sx={{ width: '100%' }}>
            <AlertTitle>Operazione completata con successo!</AlertTitle>
            {"Abbiamo ricevuto le nuove informazioni, grazie mille!"}
        </Alert>

      }
      {
        loading && <CircularProgress />
      }
      <Snackbar open={isOpenSnackbar} autoHideDuration={3000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
              {messageSnackbar}
          </Alert>
      </Snackbar>
    </Grid>
  )
}