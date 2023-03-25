import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import { useAppSelector } from '../logic/redux/store'
import DecorationImage from '../components/general/decoration_image'

interface ChoiceParams {
  path: string
  label: string
}

/**
 * 
  sx={{py: 7, px: 5}}
  style={{background: 'linear-gradient(to right bottom, #1a77d1, #d9ebfc)'}}>
 */
function ChoiceButton(props: ChoiceParams) {
  return (
    <Grid item sx={{px: 1, py: 1}}>
      <Link href={{ pathname: props.path }}>
        <Button variant="contained" 
        style={{backgroundColor: '#1a77d1'}}>
          {props.label}
        </Button>
      </Link>
    </Grid>
  )
}

// #1a77d1
// #64b5f4
// #d9ebfc

export default function Home() {
  const adminState = useAppSelector(state => state.auth.admin)

  return (
    <>
    <Grid container 
      direction="column"
      alignItems="center"
      minHeight="calc(100vh - 199px)" //* Così è perfetto su Mac
    >
      <Typography style={{fontWeight: "bold", fontSize: 30 }} sx={{py: 5}}>
        Scegli cosa fare
      </Typography>
      {
        !adminState &&
        <Grid item>
          <Grid container direction="row" justifyContent="center">
            <ChoiceButton label="Raccolta disponibilità" path='/raccolta_disponibilita' data-cy="racc_disp_index" />
            {
              //<ChoiceButton label="Cambio turno" path='/cambio_turno' distretto={distretto} />
            }
          </Grid>
        </Grid>
      }
      {
        //*distrettiAdmin.indexOf(distretto) >= 0
        adminState &&
        <Grid item>
          <Grid container direction="row" justifyContent="center">
            <ChoiceButton label="Aggiungi turni speciali" path='/configuration_turni_admin' />
            <ChoiceButton label="Pianifica turni per mese" path='/pianificazione_turni_admin' />
            <ChoiceButton label="Modifica medici distretto" path='/modify_doctors_admin' />
          </Grid>
        </Grid>
        //* Capire questione immagini Dropdown
      }
      <Grid item>
        <DecorationImage path="/grafiche/img_index.webp" width={800} height={312.29} position="center"/>
      </Grid>
    </Grid>
    </>
  )
}
