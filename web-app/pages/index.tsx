import Grid from '@mui/material/Grid'
import { Button } from 'primereact/button';
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import DecorationImage from '../components/general/decoration_image'
import SelectDistrict from '../components/select_distretto';
import { useAppDispatch, useAppSelector } from '../logic/redux/store';
import { setSelectedDistrict } from '../logic/redux/auth_slice';
import React from 'react';
import IconButton from '@mui/material/IconButton';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import Slide from '@mui/material/Slide';
import Box from '@mui/material/Box';
import { Routes } from '../logic/Routes';

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
        <Button style={{backgroundColor: '#1a77d1'}}>
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
  const [ selectDistrettoMode, setSelectDistrettoMode ] = React.useState(true)

  return (
    <Grid container 
      direction="column"
      alignItems="center"
      minHeight="calc(100vh - 199px)" //* Così è perfetto su Mac
    >
      {
        selectDistrettoMode ?
        <Box sx={{ height: 180 }}>
          <Box sx={{ maxWidth: `3000` }}>
            <Slide direction="right" in={selectDistrettoMode} mountOnEnter unmountOnExit>
              <div>
                <SelectDistrictLogin setSelectMode={setSelectDistrettoMode}/>
              </div>
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
              </Grid>
            </Box>
          </Slide>
        </Box>
      }
      
    </Grid>
  )
}

function ChoicesHomeDiv() {
  const adminState = useAppSelector(state => state.auth.ownedDistricts.length > 0)

  return (
    <>
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
    </>
  )
}

interface PropsSelectDistrettoLogin {
  setSelectMode: (arg0: boolean) => void
}

function SelectDistrictLogin(props: PropsSelectDistrettoLogin) {
  const infoAuth = useAppSelector(state => state.auth)
  const dispatch = useAppDispatch()

  const handleSetDistretto = (newDistrict: string) => {
    dispatch(setSelectedDistrict(newDistrict))
    props.setSelectMode(false)
  }

  if (infoAuth.districts.length === 0)
    return (
      <>
        <span>
          Sembra che tu non sia registrato in nessun distretto...  
          <br />
          Aspetta il link da un amministratore
          <br />
          O crea il tuo distretto se vuoi usufruire del servizio
        </span>
        <br />
        <a href={Routes.Register} target="_blank" rel="noopener noreferrer" className="p-button font-bold">
          Crea il distretto
        </a>
      </>
    )

  return (
    <>
      <Grid item>
        <Typography style={{ fontWeight: 700 }} variant="h4" component="h4" sx={{ mb: '20px' }}>
          Scegli il distretto
        </Typography>
      </Grid>
      <Grid item>
        <SelectDistrict district={infoAuth.selectedDistrict} setDistrict={handleSetDistretto}/>
      </Grid>
      <Grid item>
          <Button
            className='mt-10 bg-red' rounded 
            onClick={() => props.setSelectMode(false)} 
            disabled={infoAuth.selectedDistrict === ''}
          >
            Continua
          </Button>
      </Grid>
    </>
  )
}