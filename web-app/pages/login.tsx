import { useState } from 'react';
import { MenuAppBar } from '../components/app_bar';
import AdminLogin from '..//components/login/admin_login';
import MedicoLogin from '../components/login/medico_login';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Head from 'next/head';
//import { Slide, Box } from '@mui/material'
/**
 *  TODO: Implementa Slide
          <Slide direction="left" in={modeConferma} mountOnEnter unmountOnExit>
            <Slide direction="right" in={!modeConferma} mountOnEnter unmountOnExit>      <Box ref={containerRef}>

 */
export default function FormLogin() {
    const [ adminMode, setAdminMode ] = useState(false);
    //Guarda qua per transizione https://mui.com/material-ui/transitions/#slide-relative-to-a-container

    return (
    <Grid 
        container
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Head>
          <title>Login</title>
        </Head>
        <MenuAppBar />
        <Grid item sx={{pt: 15}}>
              <Grid container direction='column'>
                <Typography
                  fontFamily="Public+Sans"
                  fontWeight="fontWeightBold"
                  variant="h3"
                  component="h3"
                  sx={{
                    as: 'center',
                    mb: '20px',
                  }}
                >
                  {adminMode ? "Amministrazione" : "Accedi"}
                </Typography>
                {
                  adminMode && <AdminLogin />
                }
                {
                  !adminMode && <MedicoLogin />
                }
              </Grid>
                <Button onClick={() => setAdminMode(oldVal => !oldVal)} sx={{
                  "& .MuiTouchRipple-root span": {
                    backgroundColor: 'transparent',
                  },
                }}>
                  <Typography style={{ textDecoration: 'underline', color: 'black', textTransform: 'none' }}>
                    {!adminMode ? "Sei un amministratore? Clicca qua" : "Sei un medico? Clicca qua"}
                  </Typography>
                </Button>
          </Grid>
        </Grid>
  )
}