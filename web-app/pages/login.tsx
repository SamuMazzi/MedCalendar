import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Head from 'next/head';
import DecorationImage from '../components/general/decoration_image';
import React from 'react';
import Box from '@mui/material/Box';
import { useRef, useState } from "react";
import { sendSignInEmailWithLink, signInWithGoogle } from "../logic/server/auth";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import { Toast } from "primereact/toast";
import Avatar from "@mui/material/Avatar";
import { useRouter } from "next/router";
import { AppFirebaseError } from '../logic/server/firebase';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import { Button } from 'primereact/button';
// TODO: Pagina pubblica per vedere tabella

export default function FormLogin(props: any) {    
    return (
    <Grid 
        container
        display="flex"
        alignItems={{ xs: 'center', md: 'start' }}
        justifyContent={{ xs: 'center', md: 'start' }}
        minHeight="calc(100vh - 199px)"
      >
        <Head>
          <title>Accedi</title>
        </Head>
        <Grid item
          sx={{ pl: { xs: 0, md: "23%", lg: "25%" }, pt: { xs: 0, md: 7, lg: 8 } }}
        >
          <Box>
            <Grid container direction='column'>
              <Typography style={{ fontWeight: 900 }} variant="h3" component="h3" sx={{ mb: '20px' }}>
                Accedi
              </Typography>
              <DivLogin />
            </Grid>
          </Box>
          </Grid>
          {/*
            <Grid item
            style={{
                position: 'absolute',
                bottom: 55,
                left: 5,
            }}
          >
            <Typography component={Link} href={Routes.Register} sx={{fontSize: {xs: 12, md: 15}}}>Sei un amministratore e vuoi usufruire del servizio? Clicca qui</Typography>
          </Grid>
          */}
          <DecorationImage path="/grafiche/img_login.webp" width={1000} height={390.63} position="right" priority/>
        </Grid>
  )
}

function DivLogin() {
    const [email, setEmail] = useState<string>("");
    const [helperText, setHelperText] = useState("");
    const [loadingLogin, setLoadingLogin] = useState(false);
    const toast = useRef<any>(null);
    const router = useRouter();
    const { returnUrl } = router.query;

    const handleSignError = (error: any) => {
        if (error instanceof AppFirebaseError) {
            setHelperText(error.message);
        } else {
            setHelperText("Errore nell'invio dell'email, riprovare")
        }
    }

    const handleButtonGoogle = async () => {
        setLoadingLogin(true)
        try {
            await signInWithGoogle()
            if (returnUrl && !returnUrl.includes('login') && !returnUrl.includes('_admin')) {
                router.replace(Array.isArray(returnUrl) ? returnUrl.at(0)! : returnUrl)
            } else {
                router.replace('/')
            }
        } catch (error) {
            handleSignError(error)
        } finally {
            setLoadingLogin(false)
        }
    }

    const showMessageLinkSent = () => {
        if (toast.current !== null) {
            toast.current.show({ severity: 'success', summary: 'Email inviata!', detail: 'Controlla la tua mail e clicca sul link per accedere', life: 3000 });
        }
    };

    const handleSubmit = async () => {
        setHelperText("")

        if (!email || !email.includes('@')) {
            setHelperText("Inserisci una mail valida")
            return;
        }
        try {
            setLoadingLogin(true)
            await sendSignInEmailWithLink(email);
            showMessageLinkSent()
        } catch(e: any) {
            handleSignError(e)
        } finally {
            setLoadingLogin(false)
        }
    }    

    return (
        <>
        <Grid item sx={{pb: 1}}>
            <TextField 
                label="Email"
                fullWidth
                value={email}
                helperText={helperText}
                onChange={(e) => setEmail(e.target.value)}
            />
        </Grid>
        <Grid item>
            <Toast ref={toast} />
            <Button
                label="Accedi"
                rounded
                loading={loadingLogin}
                onClick={handleSubmit}
            />
        </Grid>
        <Grid item width={250} sx={{my: 1}}>
            <Divider>
                <Typography color="grey">
                    Oppure
                </Typography>
            </Divider>
        </Grid>
        <Grid item>
            <Button outlined onClick={handleButtonGoogle} disabled={loadingLogin}
                icon={<Avatar src="logoGoogle.png" sx={{height: 30, width: 30, mr: 1}} />} 
                className="h-11">
                Registrati con Google
            </Button>
        </Grid>
        </>
    )
}

interface PropsFormTextField {
  value: string,
  placeholder: string,
  onChangeFn: (arg0: string) => void,
  helperText: string,
  password?: boolean
}

export function FormTextField(props: PropsFormTextField) {
  return (
      <FormControl>
          <TextField
              value={props.value}
              label=""
              placeholder={props.placeholder}
              onChange={(event) => props.onChangeFn(event.target.value)}
              type={props.password ? "password" : undefined}
              variant='outlined'
              error={props.helperText !== ""}
              style={{ width: "230px" }}
          />
          <FormHelperText error>{props.helperText}</FormHelperText>
      </FormControl>
  )
}
