import { useState } from 'react'
import { useRouter } from 'next/router';
import { useAppDispatch } from '../../logic/redux/store';
import { signInAdminWithEmail, SignError } from '../../logic/server/auth';
import { setAdmin, setUser } from '../../logic/redux/auth_slice';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [helperMail, setHelperMail] = useState("");
    const [helperPassword, setHelperPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter()
    const dispatch = useAppDispatch()

    const handleSignError = (error: any) => {
        if (error instanceof SignError) {
            if (error.type === 'email') {
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
        <>
            <Grid item>
                <TextField
                    helperText={helperMail}
                    error={helperMail.length !== 0}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    label="Email"
                    style={{ width: "230px" }}
                />
            </Grid>
            <br />
            <Grid item>
                <TextField
                    type="password"
                    helperText={helperPassword}
                    error={helperPassword.length !== 0}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    label="Inserisci la password"
                    sx={{ mb: 2 }}
                    style={{ width: "230px" }}
                />
            </Grid>
            <Grid item>
                <Button onClick={onSubmit} disabled={loading}
                    variant="contained">
                    <Typography style={{ fontWeight: "bold", fontSize: 18 }}>
                        Accedi
                    </Typography>
                </Button>
            </Grid>
        </>
    )
}
