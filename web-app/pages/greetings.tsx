import { Grid, Alert, AlertTitle, Button } from '@mui/material';

export default function Raccolta() {
  return (
    <Grid container spacing={2} sx={{p:8}} 
        direction="column"
        alignItems="center"
        justifyContent="center"
        style={{ minHeight: '100vh', minWidth: '100vh' }}
    >
        <Alert severity="success">
            <AlertTitle>Operazione completata</AlertTitle>
            Ora puoi tornare alla pagina iniziale.
        </Alert>
        <Button href="/" sx={{my: 4}}>Torna alla home</Button>

    </Grid>
  )
}
