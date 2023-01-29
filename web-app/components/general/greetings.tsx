import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Link from 'next/link';

export default function Greetings() {
    return (
        <>
            <Grid container sx={{ p: 8 }}
                direction="column"
                alignItems="center"
                justifyContent="center"
                minHeight="calc(100vh - 225px)"
            >
                <Alert severity="success">
                    <AlertTitle>Operazione completata</AlertTitle>
                    Ora puoi tornare alla pagina iniziale.
                </Alert>
                <Link href="/">
                    <Button sx={{ my: 4 }}>Torna alla home</Button>
                </Link>
            </Grid>
        </>
    )
}