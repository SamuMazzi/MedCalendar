import { Button, Typography, Grid } from '@mui/material'
import { getDistrettiForAdmin, getDisponibilitaMeseDistretto, getInfoSediDistretto } from '../logic/server/firestore'
import { useState } from 'react'
import { useRouter } from 'next/router'

export default function Raccolta() {
  const [ distretti, setDistretti ] = useState<string[]>([])
  const [ distrettoSel, setDistrettoSel ] = useState("")
  const [ infoDistretto, setInfoDistretto ] = useState({})
  const [ disponibilitaDistretto, setDisponibilitaDistretto ] = useState({})
  const [ loading, setLoading ] = useState(false)
  const router = useRouter()

  const pushWithDistretto = (path: string) => {
    const { distretto } = router.query;
    router.push({
      pathname: path,
      query: { distretto: distretto },
    })
  }

  const getDistretti = async () => {
    const tmpDistretti = await getDistrettiForAdmin("id_admin")
    setDistretti(tmpDistretti)
  }

  const handleSelDistretto = async (distretto: string) => {
    setLoading(true);
    setDistrettoSel(distretto)
    const d = new Date();
    const year = d.getFullYear()
    const month = d.getMonth()
    const dispNextMonth = await getDisponibilitaMeseDistretto(distretto, year, month)
    if (dispNextMonth === undefined) {
      setLoading(false)
      return;
    }
    const info = await getInfoSediDistretto(distretto) //! Da cambiare!!
    setInfoDistretto(info!)
    setDisponibilitaDistretto(dispNextMonth)
  }

  return (
    <Grid container
      display="flex"
      direction="column"
      alignItems="center"
      justifyContent="center"
      //sx={{minWidth: "200px"}}
    >
      <Typography variant="h3" component="h3" sx={{py: 5}}>Pagina admin!</Typography>
      {
        distretti.map((distretto) => 
          <Button key={distretto} onClick={() => handleSelDistretto(distretto)}>
            {distretto}
          </Button>
        )
      }
      <Grid item xs={6} md={6}>
        <Button onClick={() => pushWithDistretto('/add_configuration_admin')}>Aggiungi turni per un mese</Button>
      </Grid>
      <Grid item xs={6} md={6}>
        <Button onClick={() => pushWithDistretto('/upload_turni_admin')}>Crea turni per un mese</Button>
      </Grid>
    </Grid>
  )
}