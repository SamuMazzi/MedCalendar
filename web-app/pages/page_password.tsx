import { Grid, Button, TextField } from '@mui/material';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { saveToStorage } from '../logic/local_storage';

export default function Greetings() {
    const [ password, setPassword ] = useState("")
    const [ error, setError ] = useState(false)
    const router = useRouter()
    const { returnUrl } = router.query

    const handleSubmit = () => {
        setError(false)
        if(password === process.env.REACT_APP_KEY_DISTRETTO_SASSUOLO) {
            saveToStorage('password_inserted', true);
            if (returnUrl) {
                router.push(Array.isArray(returnUrl) ? returnUrl.at(0)! : returnUrl)
            } else {
                router.push('/')
            }
        } else {
            setError(true)
        }
    }

    return (
        <Grid container spacing={2} sx={{p:8}} 
            direction="column"
            alignItems="center"
            justifyContent="center"
            style={{ minHeight: '100vh', minWidth: '100vh' }}
        >
            <TextField 
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                variant='outlined'
                helperText={error ? 'Password sbagliata' : undefined}
                error={error}
            />
            <Button onClick={handleSubmit} sx={{my: 4}}>Accedi</Button>
        </Grid>
    )
}
