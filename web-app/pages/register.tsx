import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Step from '@mui/material/Step'
import StepButton from '@mui/material/StepButton'
import Stepper from '@mui/material/Stepper'
import { useState } from 'react'
import EnhancedTable from '../components/table_doctors'
import ConfigurationAdmin from '../components/admin_pages/create_configuration_admin'
import { PagePlans } from '../components/registration/plans'
import { RegisterDistrettoSection } from '../components/registration/register_section'
import { useAppDispatch, useAppSelector } from '../logic/redux/store'
import { setMessageError } from '../logic/redux/settings_slice'
import { addBatchMedici } from '../logic/server/firestore/doctors'
import { AppFirebaseError } from '../logic/server/firebase'
import PayPage from '../components/registration/payment_page'
import { Chips } from "primereact/chips";
import { setRolesDistrictSlice } from '../logic/redux/configuration_district_slice'
import { generateColorRole } from '../logic/local_utilities'

// #1a77d1
// #64b5f4
// #d9ebfc

//TODO: Visualizzazione turni su pagina online -> come tabella solita ma senza avere la possibilità di modificare? O forse in una tabella filtrabile, magari vedendo direttamente i propri turni

const AddDoctorsPage = (props: PropsPageStepper) => {
    const config_district = useAppSelector(state => state.configurationDistr)
    const district = useAppSelector(state => state.auth.selectedDistrict)
    const dispatch = useAppDispatch()

    const handleContinua = async () => {
        if(!config_district.doctors) {
            return dispatch(setMessageError("Inserisci almeno un medico"))
        }
        try {
            await addBatchMedici(config_district.doctors, district!)
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

    const customChip = (item: string) => {
        const index = config_district.roles.indexOf(item)
        return (
            <div color={generateColorRole(index)}>
                <span>{item} ({index+1})</span>
            </div>
        );
    };

    return (
        <Box>
            {
                //TODO: Probably questo chips da cambiare con https://primereact.org/orderlist/#dragdrop
            }
            <Chips value={config_district.roles} onChange={(e) => e.value && setRolesDistrictSlice(e.value)} allowDuplicate={false} 
                itemTemplate={customChip} placeholder="Ruoli" 
                tooltip="Da questa barra è possibile creare i ruoli ordinati in base alla priorità.\nQuando sarà poi calcolata la pianificazione si darà priorità alle persone con ruoli più alti" />
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
    const steps = ['Seleziona il piano', 'Registra il distretto', 'Pianifica i turni', 'Inserisci i medici', 'Paga']
    const [step, setStep] = useState(0)
    const nextPage = () => {
        if(step < steps.length - 1) {
            setStep(old => old + 1)
        }
    }
    const pages = [
        <PagePlans key="Page_plans" nextPage={nextPage} />, 
        <RegisterDistrettoSection nextPage={nextPage} key="register_distretto_page" />, 
        <ConfigurationAdmin key="configuration_page" nextPage={nextPage} />, 
        <AddDoctorsPage nextPage={nextPage} key="med_page"/>, 
        <PayPage key="pay_page"/>
    ]

    return (
        <Box minHeight="calc(100vh - 199px)">
            <Box style={{backgroundColor: 'white'}}>
                <Stepper activeStep={step} alternativeLabel>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepButton>
                                {label}
                            </StepButton>
                        </Step>
                    ))}
                </Stepper>
                {pages[step]}
            </Box>
        </Box>
    )
}
