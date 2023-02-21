import AdminLogin from '../components/login/admin_login';
import MedicoLogin from '../components/login/medico_login';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Head from 'next/head';
import DecorationImage from '../components/general/decoration_image';
import React from 'react';
/**
 *  TODO: Implementa Slide
      <Slide direction="left" in={modeConferma} mountOnEnter unmountOnExit>
      <Slide direction="right" in={!modeConferma} mountOnEnter unmountOnExit>      
      <Box ref={containerRef}>
    //https://mui.com/material-ui/transitions/#slide-relative-to-a-container
 */
export async function getStaticProps() {
  return {
    props: {
      secret: process.env.KEY_WEBSITE
    }
  }
}

export default function FormLogin(props: any) {
    const [ adminMode, setAdminMode ] = React.useState(false);

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
              <Grid container direction='column'>
                {
                  adminMode && 
                  <Typography style={{ fontWeight: 300 }} variant="h5" component="h5" sx={{ mb: 1 }}>
                    Amministrazione
                  </Typography>
                }
                <Typography style={{fontWeight: 900}} variant="h3" component="h3" sx={{mb: '20px'}}>
                  Accedi
                </Typography>
                {
                  adminMode && <AdminLogin />
                }
                {
                  !adminMode && <MedicoLogin server_psw={props.secret}/>
                }
              </Grid>
                <Button onClick={() => setAdminMode(oldVal => !oldVal)} sx={{
                  "& .MuiTouchRipple-root span": {
                    backgroundColor: 'transparent',
                  },
                }} data-cy="change_mod_login">
                  <Typography sx={{pt: 1}} style={{ textDecoration: 'underline', color: 'black', textTransform: 'none' }}>
                    {!adminMode ? "Sei un amministratore? Clicca qua" : "Sei un medico? Clicca qua"}
                  </Typography>
                </Button>
          </Grid>
          <DecorationImage path="/grafiche/img_login.webp" width={1000} height={390.63} position="right" priority/>
        </Grid>
  )
}