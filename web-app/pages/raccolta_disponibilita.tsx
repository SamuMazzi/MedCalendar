import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState } from 'react'
//import { Slide, Box } from '@mui/material'
import RiepilogoDisponibilita from '../components/riepilogo_disponibilita'
import ModuleDisponibilita from '../components/module_disponibilita';
import { MenuAppBar } from '../components/app_bar';
/**
 *  TODO: Implementa Slide
          <Slide direction="left" in={modeConferma} mountOnEnter unmountOnExit>
            <Slide direction="right" in={!modeConferma} mountOnEnter unmountOnExit>      <Box ref={containerRef}>

 */
export default function PageRaccolta() {
  const [ modeConferma, setModeConferma ] = useState(false)
  //const containerRef = useRef(null);
  const router = useRouter()
  const { distretto } = router.query

  return (
    <>
      <Head>
        <title>Raccolta disponibilità</title>
      </Head>
      <MenuAppBar />
      {
        modeConferma ?
        <RiepilogoDisponibilita
          changeMod={() => setModeConferma(oldVal => !oldVal)}
          distretto={distretto !== undefined ? (Array.isArray(distretto) ? distretto.at(0) : distretto) : ""}
        />
        : 
        <ModuleDisponibilita
          changeMod={() => setModeConferma(oldVal => !oldVal)}
          distretto={distretto !== undefined ? (Array.isArray(distretto) ? distretto.at(0) : distretto) : ""}
        />
      }
    </>
  )
}
