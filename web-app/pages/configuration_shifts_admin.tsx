import Grid from '@mui/material/Grid'
import Head from 'next/head';
import HandlerSpecialTurni from '../components/admin_pages/change_single_shift';

export default function ConfigurationAdminPage() {

  return (
    <>
      <Head>
        <title>Modifica turni</title>
      </Head>
      <Grid container
        display="flex"
        direction="column"
        alignItems="center"
        justifyContent="center"
        minHeight="calc(100vh - 207px)" //* Così è perfetto su Mac
        sx = {{ pb: 5 }}
      >
        <Grid item>
          <HandlerSpecialTurni />
        </Grid>
      </Grid>
    </>
  )
}