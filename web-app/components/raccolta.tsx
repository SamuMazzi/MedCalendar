import Head from 'next/head'
import { useState, useEffect } from 'react'
import { Grid, Button, Dialog, Container, Alert, Snackbar, Typography } from '@mui/material'
import ConfermaDialog from './conferma_selezione'
import GruppoTurni from './gruppo_turni';
import { RootState, useAppDispatch,useAppSelector }  from '../logic/store'
import { setMese, setMedico } from '../logic/slice'
import MapDropdownForm from './form_dropdown';
import { getAllMedici } from '../logic/firestore';

export default function PageRaccolta() {
  const mesi = {
    1: 'Gennaio', 
    2: 'Febbraio', 
    3: 'Marzo', 
    4: 'Aprile', 
    5: 'Maggio', 
    6: 'Giugno', 
    7: 'Luglio', 
    8: 'Agosto', 
    9: 'Settembre', 
    10: 'Ottobre', 
    11: 'Novembre',
    12: 'Dicembre'
  }
  const [ listMedici, setListMedici ] = useState<Record<string, string>>({});
  const [ isOpenSnackBar, setIsOpenSnackbar ] = useState(false);
  const generalState = useAppSelector((state: RootState) => state.turni)
  const dispatch = useAppDispatch()
  const [ messageSnackbar, setMessageSnackbar ] = useState("");
  const [openDialogConferma, setOpenDialogConferma] = useState(false);

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setIsOpenSnackbar(false);
  };

  const retrieveDocs = async () => {
    const medici = await getAllMedici();
    setListMedici(medici);
  }

  const handleSubmit = () => {
    console.log(Object.values(generalState.disponibilita));
    if(generalState.sedi.length === 0) {
        setIsOpenSnackbar(true);
        setMessageSnackbar('Devi selezionare almeno una sede');
      } else if (Object.values(generalState.disponibilita).length === 0) {
        setIsOpenSnackbar(true);
        setMessageSnackbar('Devi selezionare almeno una disponibilità');
      } else if (generalState.value < 0) {
        setIsOpenSnackbar(true);
        setMessageSnackbar('Inserisci un numero valido per le ore massime');
      } else {
        setOpenDialogConferma(true)
      }
  }

  useEffect(() => {
    retrieveDocs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Container>
      <Head>
        <title>Raccolta disponibilita</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

        <Typography variant="h1" component="h1" textAlign="center" sx={{pt: 2}}>Raccolta disponibilità</Typography>
        
        <Grid container spacing={2} sx={{p:8}} 
          direction="column"
          //alignItems="center"
          justifyContent="center"
          style={{ minHeight: '100vh', minWidth: '100vh' }}
        >
            <MapDropdownForm 
                value={generalState.id_medico}
                label="Medico"
                inputMap={listMedici}
                onChangeFn={(event) => {
                    dispatch(
                        setMedico({
                            id: event.target.value, 
                            nome: listMedici[event.target.value]
                        })
                    )
                }}
            />
            <MapDropdownForm 
                value={generalState.mese}
                label="Mese"
                inputMap={mesi}
                onChangeFn={(event) => dispatch(setMese(event.target.value))}
            />
            {
                generalState.id_medico !== "" && generalState.mese !== 0 && 
                <div>
                    <GruppoTurni />
                    <Button variant="outlined" onClick={handleSubmit}>
                        Invia
                    </Button>
                    <Dialog
                        open={openDialogConferma}
                        onClose={() => setOpenDialogConferma(false)}
                    >
                        <ConfermaDialog onCloseFn={() => setOpenDialogConferma(false)}/>
                    </Dialog>
                </div>
            }
        </Grid>
        <Snackbar open={isOpenSnackBar} autoHideDuration={3000} onClose={handleCloseSnackbar}>
            <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
                {messageSnackbar}
            </Alert>
        </Snackbar>
    </Container>
  )
}
