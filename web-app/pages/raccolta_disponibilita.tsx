import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { Grid, Button, Dialog, Container, Alert, Snackbar, Typography } from '@mui/material'
import ConfermaDialog from '../components/conferma_selezione'
import GruppoTurni from '../components/gruppo_turni';
import { RootState, useAppSelector }  from '../logic/redux/store'

export default function PageRaccolta() {
  const [ isOpenSnackBar, setIsOpenSnackbar ] = useState(false);
  const generalState = useAppSelector((state: RootState) => state.turni)
  //const authState = useAppSelector((state: RootState) => state.auth)
  const [ messageSnackbar, setMessageSnackbar ] = useState("");
  const [ openDialogConferma, setOpenDialogConferma ] = useState(false);
  const router = useRouter()
  const { distretto } = router.query

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setIsOpenSnackbar(false);
  };

  const handleSubmit = () => {
    console.log(Object.values(generalState.disponibilita));
    if(generalState.sedi.length === 0) {
        setIsOpenSnackbar(true);
        setMessageSnackbar('Devi selezionare almeno una sede');
      } else if (Object.values(generalState.disponibilita).length === 0) {
        setIsOpenSnackbar(true);
        setMessageSnackbar('Devi selezionare almeno una disponibilità');
      } else if (generalState.value <= 0) {
        setIsOpenSnackbar(true);
        setMessageSnackbar('Inserisci un numero valido per le ore massime');
      } else {
        setOpenDialogConferma(true)
      }
      //dispatch(setMese(event.target.value))
  }

  return (
    <Container>
      <Head>
        <title>Raccolta disponibilita</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
        
        <Grid container spacing={2} sx={{p: 8}} 
          direction="column"
          alignItems="center"
          justifyContent="center"
          style={{ minHeight: '100vh', minWidth: '100vh' }}
        >
          <Typography fontWeight="fontWeightBold" variant="h3" component="h3" textAlign="center">
            Raccolta disponibilità
          </Typography>
          <Typography variant="h5" component="h5" textAlign="center">
            {"Distretto: " + distretto}
          </Typography>
          <GruppoTurni distretto={Array.isArray(distretto) ? distretto.at(0) : distretto}/>
          <Button variant="outlined" onClick={handleSubmit} style={{ width: '100px'}}>
              Invia
          </Button>
          <Dialog
              open={openDialogConferma}
              onClose={() => setOpenDialogConferma(false)}
          >
              <ConfermaDialog onCloseFn={() => setOpenDialogConferma(false)}/>
          </Dialog>
        </Grid>
        <Snackbar open={isOpenSnackBar} autoHideDuration={3000} onClose={handleCloseSnackbar}>
            <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
                {messageSnackbar}
            </Alert>
        </Snackbar>
    </Container>
  )
}
