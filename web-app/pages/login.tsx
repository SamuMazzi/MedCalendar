import AdminLogin from '../components/login/admin_login';
import MedicoLogin from '../components/login/medico_login';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Head from 'next/head';
import DecorationImage from '../components/general/decoration_image';
import React from 'react';
import SelectDistretto from '../components/select_distretto';
import IconButton from '@mui/material/IconButton';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import Slide from '@mui/material/Slide';
import Box from '@mui/material/Box';
import { useAppDispatch, useAppSelector } from '../logic/redux/store';
import { setDistrettoSlice } from '../logic/redux/settings_slice';
import { setLocalActualDistretto } from '../logic/local_utilities';

export async function getStaticProps() {
  return {
    props: {
      secret: process.env.KEY_WEBSITE
    }
  }
}

export default function FormLogin(props: any) {
    const [ adminMode, setAdminMode ] = React.useState(false);
    const [ selectDistrettoMode, setSelectDistrettoMode ] = React.useState(true)
    const distretto = useAppSelector(state => state.settings.distretto)

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
          {
              selectDistrettoMode ?
              <Box sx={{ height: 180 }}>
                <Box sx={{ maxWidth: `3000` }}>
                  <Slide direction="right" in={selectDistrettoMode} mountOnEnter unmountOnExit>
                    <Box>
                      <SelectDistrettoLogin setSelectMode={setSelectDistrettoMode}/>
                    </Box>
                  </Slide>
                </Box>
              </Box> :
              <Box sx={{ height: 400 }}>
                <Slide direction="left" in={!selectDistrettoMode} mountOnEnter unmountOnExit>
                  <Box>
                    <Grid container direction='column'>
                      <Grid item>
                        <IconButton onClick={() => setSelectDistrettoMode(true)}>
                          <ArrowBackRoundedIcon />
                        </IconButton>
                      </Grid>
                      {adminMode &&
                        <Typography style={{ fontWeight: 300 }} variant="h5" component="h5" sx={{ mb: 1 }}>
                          Amministrazione
                        </Typography>
                      }
                      <Typography style={{ fontWeight: 900 }} variant="h3" component="h3" sx={{ mb: '20px' }}>
                        Accedi
                      </Typography>
                      <Typography variant="h6" component="h6" style={{whiteSpace: 'pre-line'}} sx={{mb: 2}}>
                        {"Distretto: " + distretto}
                      </Typography>
                      {adminMode ? <AdminLogin /> : <MedicoLogin server_psw={props.secret} />}
                    </Grid>
                    <Button onClick={() => setAdminMode(oldVal => !oldVal)} sx={{
                        "& .MuiTouchRipple-root span": {
                          backgroundColor: 'transparent',
                        },
                      }} data-cy="change_mod_login">
                        <Typography sx={{ pt: 1 }} style={{ textDecoration: 'underline', color: 'black', textTransform: 'none' }}>
                          {!adminMode ? "Sei un amministratore? Clicca qua" : "Sei un medico? Clicca qua"}
                        </Typography>
                    </Button>
                  </Box>
                </Slide>
              </Box> 
            }
          </Grid>
          <DecorationImage path="/grafiche/img_login.webp" width={1000} height={390.63} position="right" priority/>
        </Grid>
  )
}

interface PropsSelectDistrettoLogin {
  setSelectMode: (arg0: boolean) => void
}

function SelectDistrettoLogin(props: PropsSelectDistrettoLogin) {
  const distretto = useAppSelector(state => state.settings.distretto)
  const dispatch = useAppDispatch()

  const handleSetDistretto = (newDistretto: string) => {
    dispatch(setDistrettoSlice(newDistretto))
    setLocalActualDistretto(newDistretto)
    props.setSelectMode(false)
  }
  return (
    <>
      <Grid item>
        <Typography style={{ fontWeight: 700 }} variant="h4" component="h4" sx={{ mb: '20px' }}>
          Scegli il distretto
        </Typography>
      </Grid>
      <Grid item>
        <SelectDistretto distretto={distretto} setDistretto={handleSetDistretto}/>
        </Grid>
      <Grid item>
        <Button style={{textTransform: 'none'}} 
          sx={{mt: 1}} variant="contained" 
          onClick={() => props.setSelectMode(false)} 
          disabled={distretto === ''}
        >
          Continua
        </Button>
      </Grid>
    </>
  )
}