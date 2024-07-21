import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Head from 'next/head';
import DecorationImage from '../components/general/decoration_image';
import React from 'react';
import Box from '@mui/material/Box';
import { useRef, useState } from "react";
import TextField from "@mui/material/TextField";
import { Toast } from "primereact/toast";
import { AppFirebaseError } from '../logic/server/firebase';
import { Button } from 'primereact/button';
import { useAppDispatch } from '../logic/redux/store';
import useUser from '../logic/hooks/use_user';
import { setNameAndSurnameAfterRegistration } from '../logic/server/firestore/doctors';
import { setNameUserLocal } from '../logic/redux/auth_slice';
import assert from 'assert';
import { useRouter } from 'next/router';
// TODO: Pagina pubblica per vedere tabella

export default function CompleteRegistration(props: any) {    
    return (
    <Grid 
        container
        display="flex"
        alignItems={{ xs: 'center', md: 'start' }}
        justifyContent={{ xs: 'center', md: 'start' }}
        minHeight="calc(100vh - 199px)"
      >
        <Head>
          <title>Completa informazioni</title>
        </Head>
        <Grid item
          sx={{ pl: { xs: 0, md: "23%", lg: "25%" }, pt: { xs: 0, md: 7, lg: 8 } }}
        >
          <Box>
            <Grid container direction='column'>
              <Typography style={{ fontWeight: 900 }} variant="h3" component="h3" sx={{ mb: '20px' }}>
                Finisci la tua registrazione
              </Typography>
              <DivLogin />
            </Grid>
          </Box>
          </Grid>
          <DecorationImage path="/grafiche/img_login.webp" width={1000} height={390.63} position="right" priority/>
        </Grid>
  )
}

function DivLogin() {
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [loading, setLoading] = useState(false);
    const toast = useRef<any>(null);
    const [user, district, logout, fbUser] = useUser();
    const router = useRouter();
    const dispatch = useAppDispatch();

    const handleSignError = (error: any) => {
        if (error instanceof AppFirebaseError) {
            setAndShowMessage("Errore", error.message, "danger")
        } else {
            setAndShowMessage("Errore", "Errore nell'invio dell'email, riprovare", "danger")
        }
    }

    const setAndShowMessage = (title: string, msg: string, severity: "success" | "danger") => {
        if (toast.current !== null) {
            toast.current.show({ severity: severity, summary: title, detail: msg, life: 3000 });
        }
    };
    const handleSubmit = async () => {
        const userEmail = fbUser?.email
        assert(userEmail !== null && fbUser !== undefined, "User or is null or undefined")
        const regexLetters = /^[a-zA-Z\s]+$/;

        if (!name || !name.match(regexLetters)) {
            setAndShowMessage("Errore", "Inserisci un nome valido", "danger")
            return;
        }
        if (!surname || !surname.match(regexLetters)) {
            setAndShowMessage("Errore", "Inserisci un cognome valido", "danger")
            return;
        }
        try {
            setLoading(true)
            await setNameAndSurnameAfterRegistration(userEmail as string, name, surname)
            dispatch(setNameUserLocal(name + " " + surname))
            setAndShowMessage("", "Registrazione completata!", "success")
            router.push('/')
        } catch(e: any) {
            handleSignError(e)
        } finally {
            setLoading(false)
        }
    }    

    return (
        <>
        <span className='py-1'>Mancano alcune informazioni sul tuo profilo:</span>
        <Grid item sx={{py: 1}}>
            <TextField 
                label="Nome"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
        </Grid>
        <Grid item sx={{pb: 1}}>
            <TextField 
                label="Cognome"
                fullWidth
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
            />
        </Grid>
        <Grid item>
            <Toast ref={toast} />
            <Button
                label="Continua"
                rounded
                loading={loading}
                onClick={handleSubmit}
                className='mt-2'
            />
        </Grid>
        </>
    )
}