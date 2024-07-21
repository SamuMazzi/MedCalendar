// import Button from "@mui/material/Button"
import ListItem from "@mui/material/ListItem"
import Typography from "@mui/material/Typography"
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ListItemIcon from '@mui/material/ListItemIcon'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItemText from '@mui/material/ListItemText'
import { useAppDispatch } from '../../logic/redux/store'
import { PricingPlan, setPricingPlan } from '../../logic/redux/configuration_district_slice'
import Box from "@mui/material/Box";
import { Button } from "primereact/button";

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

const PrimePlans = () => {

<div className="surface-ground px-4 py-8 md:px-6 lg:px-8">
    <div className="text-900 font-bold text-6xl mb-4 text-center">Pricing Plans</div>
    <div className="text-700 text-xl mb-6 text-center line-height-3">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Velit numquam eligendi quos.</div>

    <div className="grid">
        <div className="col-12 lg:col-4">
            <div className="p-3 h-full">
                <div className="shadow-2 p-3 h-full flex flex-column surface-card" style={{ borderRadius: '6px' }}>
                    <div className="text-900 font-medium text-xl mb-2">Basic</div>
                    <div className="text-600">Plan description</div>
                    <hr className="my-3 mx-0 border-top-1 border-none surface-border" />
                    <div className="flex align-items-center">
                        <span className="font-bold text-2xl text-900">$9</span>
                        <span className="ml-2 font-medium text-600">per month</span>
                    </div>
                    <hr className="my-3 mx-0 border-top-1 border-none surface-border" />
                    <ul className="list-none p-0 m-0 flex-grow-1">
                        <li className="flex align-items-center mb-3">
                            <i className="pi pi-check-circle text-green-500 mr-2"></i>
                            <span className="text-900">Arcu vitae elementum</span>
                        </li>
                        <li className="flex align-items-center mb-3">
                            <i className="pi pi-check-circle text-green-500 mr-2"></i>
                            <span className="text-900">Dui faucibus in ornare</span>
                        </li>
                        <li className="flex align-items-center mb-3">
                            <i className="pi pi-check-circle text-green-500 mr-2"></i>
                            <span className="text-900">Morbi tincidunt augue</span>
                        </li>
                    </ul>
                    <hr className="mb-3 mx-0 border-top-1 border-none surface-border mt-auto" />
                    <Button label="Buy Now" className="p-3 w-full mt-auto" />
                </div>
            </div>
        </div>

        <div className="col-12 lg:col-4">
            <div className="p-3 h-full">
                <div className="shadow-2 p-3 h-full flex flex-column surface-card" style={{ borderRadius: '6px' }}>
                    <div className="text-900 font-medium text-xl mb-2">Premium</div>
                    <div className="text-600">Plan description</div>
                    <hr className="my-3 mx-0 border-top-1 border-none surface-border" />
                    <div className="flex align-items-center">
                        <span className="font-bold text-2xl text-900">$29</span>
                        <span className="ml-2 font-medium text-600">per month</span>
                    </div>
                    <hr className="my-3 mx-0 border-top-1 border-none surface-border" />
                    <ul className="list-none p-0 m-0 flex-grow-1">
                        <li className="flex align-items-center mb-3">
                            <i className="pi pi-check-circle text-green-500 mr-2"></i>
                            <span className="text-900">Arcu vitae elementum</span>
                        </li>
                        <li className="flex align-items-center mb-3">
                            <i className="pi pi-check-circle text-green-500 mr-2"></i>
                            <span className="text-900">Dui faucibus in ornare</span>
                        </li>
                        <li className="flex align-items-center mb-3">
                            <i className="pi pi-check-circle text-green-500 mr-2"></i>
                            <span className="text-900">Morbi tincidunt augue</span>
                        </li>
                        <li className="flex align-items-center mb-3">
                            <i className="pi pi-check-circle text-green-500 mr-2"></i>
                            <span className="text-900">Duis ultricies lacus sed</span>
                        </li>
                    </ul>
                    <hr className="mb-3 mx-0 border-top-1 border-none surface-border" />
                    <Button label="Buy Now" className="p-3 w-full" />
                </div>
            </div>
        </div>

        <div className="col-12 lg:col-4">
            <div className="p-3 h-full">
                <div className="shadow-2 p-3 flex flex-column surface-card" style={{ borderRadius: '6px' }}>
                    <div className="text-900 font-medium text-xl mb-2">Enterprise</div>
                    <div className="text-600">Plan description</div>
                    <hr className="my-3 mx-0 border-top-1 border-none surface-border" />
                    <div className="flex align-items-center">
                        <span className="font-bold text-2xl text-900">$49</span>
                        <span className="ml-2 font-medium text-600">per month</span>
                    </div>
                    <hr className="my-3 mx-0 border-top-1 border-none surface-border" />
                    <ul className="list-none p-0 m-0 flex-grow-1">
                        <li className="flex align-items-center mb-3">
                            <i className="pi pi-check-circle text-green-500 mr-2"></i>
                            <span className="text-900">Arcu vitae elementum</span>
                        </li>
                        <li className="flex align-items-center mb-3">
                            <i className="pi pi-check-circle text-green-500 mr-2"></i>
                            <span className="text-900">Dui faucibus in ornare</span>
                        </li>
                        <li className="flex align-items-center mb-3">
                            <i className="pi pi-check-circle text-green-500 mr-2"></i>
                            <span className="text-900">Morbi tincidunt augue</span>
                        </li>
                        <li className="flex align-items-center mb-3">
                            <i className="pi pi-check-circle text-green-500 mr-2"></i>
                            <span className="text-900">Duis ultricies lacus sed</span>
                        </li>
                        <li className="flex align-items-center mb-3">
                            <i className="pi pi-check-circle text-green-500 mr-2"></i>
                            <span className="text-900">Imperdiet proin</span>
                        </li>
                        <li className="flex align-items-center mb-3">
                            <i className="pi pi-check-circle text-green-500 mr-2"></i>
                            <span className="text-900">Nisi scelerisque</span>
                        </li>
                    </ul>
                    <hr className="mb-3 mx-0 border-top-1 border-none surface-border" />
                    <Button label="Buy Now" className="p-3 w-full p-button-outlined" />
                </div>
            </div>
        </div>
    </div>
</div>
    
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
                <Button // variant="contained" 
                    onClick={() => handleSelectPiano('GM_Base')} 
                    style={{textAlign: 'center', color: '#1a77d1', backgroundColor: 'white'}} 
                    // sx={{mt: 2}}
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