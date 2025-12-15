import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Head from 'next/head';
import React, { useEffect } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { setUser } from '../logic/redux/auth_slice';
import { signInUserWithEmailLink } from '../logic/server/auth';
import { useRouter } from 'next/router';
import { fetchUserOnLogin } from '../logic/server/firestore/doctors';
import { useDispatch } from 'react-redux';
import { AppFirebaseError } from '../logic/server/firebase';

export default function SignInConfirmation() {
    const [ errorText, setErrorText ] = React.useState("")
    const [ loading, setLoading ] = React.useState(true)
    const dispatch = useDispatch()
    const router = useRouter()
    const { returnUrl } = router.query


    const handleSignError = (error: any) => {
      if (error instanceof AppFirebaseError) {
          setErrorText(error.message)
      } else {
          console.error(error)
          setErrorText("Si è verificato un errore, riprovare")
      }
    }

    const handleValidation = async () => {
      let email = window.localStorage.getItem('emailForSignIn');
      while (email === "" || email === null) {
          // User opened the link on a different device. To prevent session fixation
          // attacks, ask the user to provide the associated email again. For example:
          email = window.prompt('Scrivi la tua mail per confermare l\'accesso');
      }
      try {
        await signInUserWithEmailLink(email, window.location.href)
        const dataDoctor = await fetchUserOnLogin(email)
        dispatch(setUser({ uid: email, data: dataDoctor}))
        /* if (returnUrl && !returnUrl.includes('login') && !returnUrl.includes('_admin')) {
            router.replace(Array.isArray(returnUrl) ? returnUrl.at(0)! : returnUrl)
        } else {
            router.replace(Routes.CompleteRegistration)
        } */
      } catch (error: unknown) {
        handleSignError(error)
      } finally {
        setLoading(false)
      }
    }

    useEffect(() => {
      handleValidation()
    }, [])

    return (
    <Grid 
        container
        display="flex"
        alignItems={{ xs: 'center', md: 'start' }}
        justifyContent={{ xs: 'center', md: 'start' }}
        minHeight="calc(100vh - 199px)"
      >
        <Head>
          <title>Conferma account</title>
        </Head>
        <Grid item
          sx={{ pl: { xs: 0, md: "23%", lg: "25%" }, pt: { xs: 0, md: 7, lg: 8 } }}
        >
          {
              <Box sx={{ height: 400 }}>
                  <Box>
                    <Grid container direction='column'>
                        <Typography style={{ fontWeight: 300 }} variant="h5" component="h5" sx={{ mb: 1 }}>
                            {loading ? "Accesso in corso..." : errorText ? "Errore" : "Accesso confermato"}
                        </Typography>
                      {
                        loading && <Grid item>
                          <CircularProgress />
                        </Grid>
                      }
                      {
                            errorText &&
                            <Grid item>
                                <Typography variant="body1" sx={{ color: 'red' }}>
                                    {errorText}
                                </Typography>
                            </Grid>
                      }
                    </Grid>
                  </Box>
              </Box> 
            }
          </Grid>
        </Grid>
  )
}
