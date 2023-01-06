import { useState } from 'react'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import SelectDistretto from '../components/select_distretto'
import Link from 'next/link'
import { useAppSelector } from '../logic/redux/store'
import DecorationImage from '../components/decoration_image'

interface ChoiceParams {
  distretto: string,
  path: string,
  label: string
}

function ChoiceButton(props: ChoiceParams) {
  return (
    <Grid item sx={{px: 1, py: 1}}>
      <Link 
        style={{cursor: !props.distretto ? "default" : undefined}} 
        href={{ pathname: props.path, query: { distretto: props.distretto } }}
        onClick={!props.distretto ? (event) => event.preventDefault() : undefined}>
        <Button
          disabled={!props.distretto}
          variant="contained"
        >
          {props.label}
        </Button>
      </Link>
    </Grid>
  )
}

export default function Home() {
  const [ distretto, setDistretto ] = useState("");
  const adminState = useAppSelector(state => state.auth.admin)

  return (
    <>
    <Grid container 
      direction="column"
      alignItems="center"
      minHeight="calc(100vh - 225px)"
    >
      <Typography style={{fontWeight: "bold", fontSize: 30 }} sx={{py: 5, pl: 5}}>
        Per continuare seleziona un distretto
      </Typography>
      {
        <Grid item>
          <SelectDistretto distretto={distretto} setDistretto={setDistretto}/>
        </Grid>
      }
      {
        !adminState &&
        <Grid item>
          <Grid container direction="row" justifyContent="center">
            <ChoiceButton label="Raccolta disponibilità" path='/raccolta_disponibilita' distretto={distretto} />
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
            <ChoiceButton label="Aggiungi turni per un mese" path='/add_configuration_admin' distretto={distretto} />
            <ChoiceButton label="Pianifica turni per mese" path='/pianificazione_turni_admin' distretto={distretto} />
            <ChoiceButton label="Aggiungi medico al distretto" path='/upload_single_medico_admin' distretto={distretto} />
          </Grid>
        </Grid>
        //* Capire questione immagini Dropdown
      }
      <Grid item>
        <DecorationImage path="/grafiche/img_index.png" width={800} position="center"/>
      </Grid>
    </Grid>
    </>
  )
}
