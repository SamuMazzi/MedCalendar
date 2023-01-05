import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
//import { Slide, Box } from '@mui/material'
import RiepilogoDisponibilita from '../components/riepilogo_disponibilita'
import ModuleDisponibilita from '../components/module_disponibilita';
import { CircularProgress } from '@mui/material';
//import DecorationImage from '../components/decoration_image';
/**
 *  TODO: Implementa Slide
          <Slide direction="left" in={modeConferma} mountOnEnter unmountOnExit>
            <Slide direction="right" in={!modeConferma} mountOnEnter unmountOnExit>      <Box ref={containerRef}>

 */
export default function PageRaccolta() {
  const [modeConferma, setModeConferma] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const [distretto, setDistretto] = useState("")

  useEffect(() => {
    if (router.isReady) {
      const defDistretto = router.query.distretto !== undefined ? (Array.isArray(router.query.distretto) ? router.query.distretto.at(0) : router.query.distretto)! : ""
      setDistretto(defDistretto)
      setLoading(false)
    }
  }, [router.isReady, router.query]);
  //TODO: (Optional) Metti breakpoint per gestire meglio spazi

  return (
    <>
      <Head>
        <title>Raccolta disponibilità</title>
      </Head>
      {
        loading ? <CircularProgress /> : modeConferma ?
        <RiepilogoDisponibilita
          changeMod={() => setModeConferma(oldVal => !oldVal)}
          distretto={distretto}
        />
        : 
        <ModuleDisponibilita
          changeMod={() => setModeConferma(oldVal => !oldVal)}
          distretto={distretto}
        />
      }
      { //TODO Capire meglio questo
        //<DecorationImage path="/grafiche/img_raccolta.png" width={800} position="right" />
      }
    </>
  )
}
