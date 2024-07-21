import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box';
import { useAppSelector } from '../../logic/redux/store';
import Grid from '@mui/material/Grid';
import { InfoPricingPlan } from '../../logic/redux/configuration_district_slice';

export default function PayPage() {
    const info = useAppSelector(state => state.configurationDistr)

    return (
        <PayPalScriptProvider options={{ 
            clientId: "AQaoOgbWf8AHUhXNuJrI1FFvKlLYGjfeKOYjBOHObYm9FD36N8ebG--d2cumIr6z1jUAzvxdGr_DPO8U", 
            currency: 'EUR', intent: 'subscription', vault: true
        }}>
            <Grid container direction="column" justifyContent="center" alignItems="center" sx={{pt: 3}}>

            <Grid item>
                <Typography variant="h3" style={{fontWeight: 900}} sx={{pb: 2}}>Riepilogo</Typography>
                <Box display="flex">
                    <Typography style={{fontWeight: 'bold'}} sx={{pr: 1}}>Distretto:</Typography>
                    <Typography>{info.name}</Typography>
                </Box>
                <Box display="flex">
                    <Typography style={{fontWeight: 'bold'}} sx={{pr: 1}}>Sedi (N° medici per turno): </Typography>
                    <Typography>{info.locations.map((s) => s.name + " (" + s.doctors_for_shift + ")").join(', ')}</Typography>
                </Box>
                {info.extraShifts && <>
                    <Typography>Giorni extra</Typography>
                </>}
                <Box display="flex" sx={{pb: 1}}>
                    <Typography style={{fontWeight: 'bold'}} sx={{pr: 1}}>Medici:</Typography>
                    <Typography>{Object.keys(info.locations).length}</Typography>
                </Box>
                <Box display="flex" sx={{pb: 1}}>
                    <Typography style={{fontWeight: 'bold'}} sx={{pr: 1}}>Piano:</Typography>
                    <Typography>{InfoPricingPlan[info.pricingPlan]['name']}</Typography>
                </Box>
                <Box display="flex" sx={{pb: 1}}>
                    <Typography style={{fontWeight: 'bold'}} sx={{pr: 1}}>Prezzo:</Typography>
                    <Typography>{InfoPricingPlan[info.pricingPlan]['price']}</Typography>
                </Box>
                <Box maxWidth={300}>
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
                        alert(data.subscriptionID);
                    }}
                    />
                </Box>
            </Grid>
            </Grid>
        </PayPalScriptProvider>
    )
}