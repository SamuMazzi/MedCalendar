import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { useState } from 'react'
import EnhancedTable from '../components/table_doctors'
import ConfigurationAdmin from '../components/admin_pages/create_configuration_admin'
import { PagePlans } from '../components/registration/plans'
import { RegisterDistrictSection } from '../components/registration/register_section'
import { useAppDispatch, useAppSelector } from '../logic/redux/store'
import { setMessageError } from '../logic/redux/settings_slice'
import { AppFirebaseError } from '../logic/server/firebase'
import PayPage from '../components/registration/payment_page'
import { getFromStorage, saveToStorage } from '../logic/local_utilities'
import { Steps } from 'primereact/steps'

// #1a77d1
// #64b5f4
// #d9ebfc

//TODO: Visualizzazione turni su pagina online -> come tabella solita ma senza avere la possibilità di modificare? O forse in una tabella filtrabile, magari vedendo direttamente i propri turni

const AddDoctorsPage = (props: PropsPageStepper) => {
    const config_district = useAppSelector(state => state.configurationDistr)
    const dispatch = useAppDispatch()

    const handleContinua = async () => {
        if(!config_district.doctors) {
            return dispatch(setMessageError("Inserisci almeno un medico"))
        }
        try {
            props.nextPage()
        } catch (e) {
            console.log(e)
            if (e instanceof AppFirebaseError) {
                dispatch(setMessageError(e.message))
            } else {
                dispatch(setMessageError("C'è stato un errore nel caricamento"))
            }
        }
    }

    return (
        <Box>
            {
                //TODO: Probably questo chips da cambiare con https://primereact.org/orderlist/#dragdrop
            }
            <TableDoctors />
            <Button style={{position: 'absolute', right: 35}} variant="contained" onClick={handleContinua}>
                Continua
            </Button>
        </Box>
    )
}

const TableDoctors = () => {
    return (
        <Box sx={{px: 15, py: 5}}>
            <EnhancedTable />
        </Box>
    )
}

interface PropsPageStepper {
    nextPage: () => void
}

export default function PageCreaTurni() {
    //TODO: Create a reset button
    const [step, setStep] = useState<number>(getFromStorage("curr_page_registration") ?? 0)
    const nextPage = () => {
        if(step < items.length - 1) {
            setStep(old => old + 1)
        }
        saveToStorage("curr_page_registration", step+1)
    }

    const items = [
        {
            label: 'Seleziona il piano',
            // command: () => {}
        },
        {
            label: "Registra il distretto"
        },
        {
            label: "Pianifica i turni"
        },
        {
            label: "Inserisci i medici"
        },
        {
            label: "Paga"
        },
    ]
    const pages = [
        <PagePlans key="Page_plans" nextPage={nextPage} />, 
        <RegisterDistrictSection nextPage={nextPage} key="register_distretto_page" />, 
        <ConfigurationAdmin key="configuration_page" nextPage={nextPage} />, 
        <AddDoctorsPage nextPage={nextPage} key="med_page"/>, 
        <PayPage key="pay_page"/>
    ]

    return (
        <Box minHeight="calc(100vh - 199px)">
            <Box style={{backgroundColor: 'white'}}>
            <Steps model={items} readOnly activeIndex={step} onSelect={(e) => setStep(e.index)} />
                {pages[step]}
            </Box>
        </Box>
    )
}
