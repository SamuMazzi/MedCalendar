import Grid from '@mui/material/Grid'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react';
import { useAppSelector } from '../logic/redux/store';
import { NewListDropdown } from './general/form_dropdown';
// import { getDistrettiForMedico } from '../logic/server/firestore'
// import { getLocalDistretti, saveToStorage } from '../logic/local_storage'

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
        let distretti = ['Sassuolo'] //getLocalDistretti()
        //let distretti_admin = ['Sassuolo'] //getLocalDistretti(true)
        if(!distretti || distretti.length === 0) { //|| !distretti_admin || distretti_admin.length === 0) {
          if(!distretti || distretti.length === 0) {
            //distretti = ['Sassuolo']
            //distretti = await getDistrettiForMedico(authState.id);
            //saveToStorage('distretti', distretti)
            setDistrettiMedico(distretti) 
            //setAllDistretti(distretti)
          }
            if(authState.admin) { //&& (!distretti_admin || distretti_admin.length === 0)) {
                //distretti = ['Sassuolo']
                //distretti_admin = await getDistrettiForAdmin(authState.id)
                //saveToStorage('distretti_admin', distretti_admin)
                setDistrettiAdmin(distretti)
            }
        }
        setAllDistretti(distretti)
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
                data-cy="select_distretto"
            />
        )
    }

    return (
        <Grid item>
            {renderDistretti()}
        </Grid>
    )
}