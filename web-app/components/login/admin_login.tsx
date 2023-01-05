import { useState } from 'react'
import { useRouter } from 'next/router';
import { useAppDispatch } from '../../logic/redux/store';
import { signInAdminWithEmail, SignError } from '../../logic/server/auth';
import { setAdmin, setUser } from '../../logic/redux/auth_slice';
import Grid from '@mui/material/Grid';
import { FormButtonSubmit, FormTextField } from './form_components';
import { setMessageError } from '../../logic/redux/settings_slice';

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
            dispatch(setMessageError("Si è verificato un errore, riprovare"))
        }
    }

    const signIn = async () => {
        const user = await signInAdminWithEmail(email, password)
        dispatch(setAdmin(true))
        dispatch(setUser({
            uid: user.uid,
            data: {}
        }))
    }

    const onSubmit = async () => {
        if (password.length === 0) {
            setHelperPassword("Inserisci una password")
            setHelperMail("")
        } else if (email.length === 0) {
            setHelperMail("Inserisci una mail")
            setHelperPassword("")
        } else {
            setLoading(true)
            try {
                await signIn()
                router.push('/')
            } catch (error) {
                handleSignError(error)
            } finally {
                setLoading(false)
            }
        }
    }

    return (
        <>
            <Grid item sx={{ pb: 2 }}>
                <FormTextField 
                    value={email}
                    helperText={helperMail}
                    onChangeFn={(newVal) => setEmail(newVal)}
                    placeholder='Email'
                />
            </Grid>
            <Grid item sx={{ mb: 2 }}>
                <FormTextField
                    value={password}
                    helperText={helperPassword}
                    onChangeFn={(newVal) => setPassword(newVal)}
                    placeholder="Inserisci la password"
                    password
                />
            </Grid>
            <Grid item>
                <FormButtonSubmit
                    loading={loading}
                    onClick={onSubmit}
                />
            </Grid>
        </>
    )
}
