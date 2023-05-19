import Button from "@mui/material/Button"
import ListItem from "@mui/material/ListItem"
import Typography from "@mui/material/Typography"
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ListItemIcon from '@mui/material/ListItemIcon'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItemText from '@mui/material/ListItemText'
import { useAppDispatch } from '../../logic/redux/store'
import { PricingPlan, setPricingPlan } from '../../logic/redux/configuration_distretto_slice'
import Box from "@mui/material/Box";

interface PropsPageStepper {
    nextPage: () => void
}

interface PropsProElementList {
    label: string
}

const ProElementList = (props: PropsProElementList) => {
    return (
        <ListItem>
            <ListItemIcon>
                <CheckRoundedIcon />
            </ListItemIcon>
            <ListItemText 
                primary={props.label}
            />
        </ListItem>
    )
}

export const PagePlans = (props: PropsPageStepper) => {
    const dispatch = useAppDispatch()

    const handleSelectPiano = (plan: PricingPlan) => {
        dispatch(setPricingPlan(plan))
        props.nextPage()
    }

    return (
        <Box
            style={{backgroundColor: 'white'}}
            sx={{py: 2}}
            alignItems="center"
            justifyContent="center"
            display="flex"
        >
            <Box sx={{borderRadius: 8, mr: 4, p: 2, backgroundColor: '#1a77d1', maxWidth: 300}} 
                alignItems="center"
                style={{color: 'white'}}
            >
                <Typography variant="h4" textAlign="center">
                    Guardia medica
                </Typography>
                <List dense>
                    <ProElementList label="Configura liberamente la struttura dei turni"/>
                    <ProElementList label="Raccogli le disponibilità dai medici"/>
                    <ProElementList label="Lascia che il nostro servizio crei i turni"/>
                    <ProElementList label="Applica tutte le modifiche che vuoi"/>
                    <ProElementList label="Ottieni le info su un Excel"/>
                </List>
                <Divider />
                <List dense>
                    <ProElementList label="Massimo 90 medici"/>
                    <ProElementList label="Massimo 7 sedi"/>
                    <ProElementList label="Massimo 4 configurazioni regolari"/>
                </List>
                <Button variant="contained" 
                    onClick={() => handleSelectPiano('GM_Base')} 
                    style={{textAlign: 'center', color: '#1a77d1', backgroundColor: 'white'}} 
                    sx={{mt: 2}}
                >
                    Scegli questo piano!
                </Button>
            </Box>
            <Box sx={{borderRadius: 8, p: 2, backgroundColor: 'white', maxWidth: 300}} alignItems="center">
                <Typography variant="h4">
                    Personalizzato
                </Typography>
                <Typography>
                    - Hai esigenze diverse?
                </Typography>
                <Button>
                    Contattaci
                </Button>
            </Box>
        </Box>
      )
}