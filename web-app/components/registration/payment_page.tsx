import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box';
import { useAppDispatch, useAppSelector } from '../../logic/redux/store';
import Grid from '@mui/material/Grid';
import { InfoPricingPlan, setIdDistrictSlice } from '../../logic/redux/configuration_district_slice';
import { uploadConfigurationDistrict } from '../../logic/server/firestore/firestore';
import { saveToStorage } from '../../logic/local_utilities';
import { setOwnedDistricts } from '../../logic/redux/auth_slice';
import { Button } from 'primereact/button';
import { useRouter } from 'next/router';
import { Routes } from '../../logic/Routes';

export default function PayPage() {
    const auth_user = useAppSelector(state => state.auth)
    const config_district = useAppSelector(state => state.configurationDistr)
    const dispatch = useAppDispatch()
    const router = useRouter()

    const onConfirmPayment = async () => {
        // TODO: Implement this
        const id_district = await uploadConfigurationDistrict(config_district, auth_user.uid)
        // TODO: Send invitation to users
        dispatch(setIdDistrictSlice(id_district))
        dispatch(setOwnedDistricts([...auth_user.ownedDistricts, id_district]))
        saveToStorage("curr_page_registration", null)
        router.push(Routes.Index)
    }

    return (
        <PayPalScriptProvider options={{ 
            clientId: "AQaoOgbWf8AHUhXNuJrI1FFvKlLYGjfeKOYjBOHObYm9FD36N8ebG--d2cumIr6z1jUAzvxdGr_DPO8U", 
            currency: 'EUR', intent: 'subscription', vault: true
        }}>
            <Grid container direction="column" justifyContent="center" alignItems="center" sx={{pt: 3}}>

            <Grid item>
                <Typography variant="h3" style={{fontWeight: 900}} sx={{pb: 2}}>Riepilogo</Typography>
                <div className="flex pb-1">
                    <p className='font-bold pr-1'>Distretto:</p>
                    <p>{config_district.name}</p>
                </div>
                <div className="flex pb-1">
                    <p className='font-bold pr-1'>Sedi (N° medici per turno): </p>
                    <p>{Object.values(config_district.locations).map((s) => s.name + " (" + s.doctors_for_shift + ")").join(', ')}</p>
                </div>
                <div className="flex pb-1">
                    <p className='font-bold pr-1'>Ruoli (in ordine di priorità): </p>
                    <p>{Object.values(config_district.roles).sort((a, b) => a.priority - b.priority).map((s) => s.label).join(', ')}</p>
                </div>
                {
                Object.values(config_district.locations).some(el => el.extra_shifts?.length) && <>
                    <Typography>Giorni extra</Typography>
                </>
                }
                <div className="flex pb-2">
                    <Typography style={{fontWeight: 'bold'}} sx={{pr: 1}}>Medici:</Typography>
                    <Typography>{Object.keys(config_district.doctors).length}</Typography>
                </div>
                <hr />
                <div className="flex pt-2 pb-1">
                    <Typography style={{fontWeight: 'bold'}} sx={{pr: 1}}>Piano:</Typography>
                    <Typography>{InfoPricingPlan[config_district.pricingPlan]['name']}</Typography>
                </div>
                <Box display="flex" sx={{pb: 1}}>
                    <Typography style={{fontWeight: 'bold'}} sx={{pr: 1}}>Prezzo:</Typography>
                    <Typography>{InfoPricingPlan[config_district.pricingPlan]['price']}</Typography>
                </Box>
                <div className="max-w-300">
                    <Button label='Finisci! (debug)' onClick={onConfirmPayment}/>
                    {
                        false &&
                        <PayPalButtons 
                            style={{ shape: 'pill',
                            color: 'gold',
                            layout: 'vertical',
                            label: 'subscribe'
                        }} 
                        createSubscription={(data, actions) => {
                            return actions.subscription.create({ plan_id: 'P-31P12773B8307930KMRVWHJI' });
                        }}
                        onApprove={async (data, actions) => {
                            await onConfirmPayment()
                            alert(data.subscriptionID);
                        }}/>
                    }
                </div>
            </Grid>
            </Grid>
        </PayPalScriptProvider>
    )
}