import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
//import { Slide, Box } from '@mui/material'
import RiepilogoDisponibilita from '../components/raccolta_disponibilita/riepilogo_disponibilita';
import ModuleDisponibilita from '../components/raccolta_disponibilita/module_disponibilita';
import { CircularProgress } from '@mui/material';
import DecorationImage from '../components/general/decoration_image';
//import DecorationImage from '../components/decoration_image';
/**
 *  TODO: Implementa Slide
          <Slide direction="left" in={modeConferma} mountOnEnter unmountOnExit>
            <Slide direction="right" in={!modeConferma} mountOnEnter unmountOnExit>      <Box ref={containerRef}>

 */

//      <DecorationImage path="/grafiche/img_raccolta.webp" width={800} position="right" />

export default function PageRaccolta() {
  const [modeConferma, setModeConferma] = useState(false)

  //TODO: (Optional) Metti breakpoint per gestire meglio spazi

  return (
    <>
      <Head>
        <title>Raccolta disponibilità</title>
      </Head>
      {
        modeConferma ?
        <RiepilogoDisponibilita
          changeMod={() => setModeConferma(oldVal => !oldVal)}
        />
        : 
        <ModuleDisponibilita
          changeMod={() => setModeConferma(oldVal => !oldVal)}
        />
      }
    </>
  )
}
