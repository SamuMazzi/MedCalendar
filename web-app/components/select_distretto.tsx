import Grid from '@mui/material/Grid'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react';
import { useAppSelector } from '../logic/redux/store';
import { getDistrettiForMedico } from '../logic/server/firestore'
import { getLocalDistretti, saveToStorage } from '../logic/local_storage'
import { NewListDropdown } from './form_dropdown';

interface ParamSelectDistretto {
    distretto: string,
    setDistretto: (arg0: string) => void
}

export default function SelectDistretto(props: ParamSelectDistretto) {
    const authState = useAppSelector(state => state.auth);
    const [ distrettiMedico, setDistrettiMedico ] = useState<string[]>([]);
    const [ distrettiAdmin, setDistrettiAdmin ] = useState<string[]>([]);
    const [ allDistretti, setAllDistretti ] = useState<string[]>([]);
    const [ loading, setLoading ] = useState(false);

    const getDistretti = async () => {
        setLoading(true)
        let distretti = getLocalDistretti()
        let distretti_admin = getLocalDistretti(true)
        if(!distretti || distretti.length === 0 || !distretti_admin || distretti_admin.length === 0) {
          if(!distretti || distretti.length === 0) {
            distretti = ['Sassuolo', 'Modena']
            //distretti = await getDistrettiForMedico(authState.id);
            //saveToStorage('distretti', distretti)
          }
          if(authState.admin && (!distretti_admin || distretti_admin.length === 0)) {
            distretti_admin = ['Sassuolo', 'Modena']
            //distretti_admin = await getDistrettiForAdmin(authState.id)
            //saveToStorage('distretti_admin', distretti_admin)
          }
        }
        setDistrettiMedico(distretti) 
        setDistrettiAdmin(distretti_admin)
        const outAllDistretti = [...distretti, ...distretti_admin].map(val => distretti.includes(val) !== distretti_admin.includes(val) ? val : "").filter((v) => v !== "")
        setAllDistretti(outAllDistretti)
        setLoading(false)
    }
    
    useEffect(() => {
        getDistretti();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const renderDistretti = () => {
        if(loading) return <CircularProgress />
        if(!loading && !allDistretti) {
            return (
            <Typography>
              Nessun distretto associato a questo utente
            </Typography>)

        } 
        return (
            <NewListDropdown
                label="Distretto"
                onChangeFn={(event) => props.setDistretto(event.target.value)}
                value={props.distretto}
                inputList={allDistretti}
            />
        )
    }

    return (
        <Grid item>
            {renderDistretti()}
        </Grid>
    )
}