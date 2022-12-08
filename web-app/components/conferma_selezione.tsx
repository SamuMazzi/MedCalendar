import { useState } from 'react';
import { Button, Box, CircularProgress } from '@mui/material';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useRouter } from 'next/router'

import { RootState, useAppSelector }  from '../logic/store'
import { setMeseMedico } from '../logic/firestore';

export interface PropsAlert {
    onCloseFn: Function
}

export default function AlertDialog(props: PropsAlert) {
  const generalState = useAppSelector((state: RootState) => state.turni)
  const [ loading, setLoading ] = useState(false)
  const router = useRouter()


  const getTextRiassunto = () => {
    const sedi = generalState.sedi;
    const disponibilita = generalState.disponibilita
    const medico = generalState.medico
    const mese = generalState.mese
    const nOre = generalState.value
    const premessa = "Medico: "+ medico +"\nSedi: " + sedi.join(', ') + "\nMese: " + mese.toString() + "\nOre massime: " + nOre.toString()
    let riassuntoDisponibilita = "\n\nLe disponibilità sono:\n"
    for(let turno of Object.keys(disponibilita)){
        riassuntoDisponibilita += "Turno: " + turno
        riassuntoDisponibilita += "\n\tGiorni: " + disponibilita[turno].join(', ') + "\n"
    }
    return premessa + riassuntoDisponibilita
  }

  const onConfirm = async () => {
    setLoading(true)
    try {
        await setMeseMedico(generalState.id_medico, generalState)
        //props.onCloseFn()
        router.push("/greetings")
    } finally {
        setLoading(false)
    }
  }

  return (
    <div>
        <DialogTitle>
          {"Inviare questi dati?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText style={{whiteSpace: 'pre', flexShrink: 1}}>
            {getTextRiassunto()}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => props.onCloseFn()}>Annulla</Button>
            <Box sx={{ m: 1, position: 'relative' }}>
                <Button
                    variant="contained"
                    disabled={loading}
                    onClick={onConfirm}
                >
                    Conferma
                </Button>
                {loading && 
                    (<CircularProgress
                        size={24}
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            marginTop: '-12px',
                            marginLeft: '-12px',
                        }}
                    />)
                }
            </Box>
        </DialogActions>
    </div>
  );
}