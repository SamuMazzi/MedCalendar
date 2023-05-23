import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box';
import { useAppSelector } from '../../logic/redux/store';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import { useState } from 'react';
import Grid from '@mui/material/Grid';
import { InfoPricingPlan } from '../../logic/redux/configuration_distretto_slice';

export default function PayPage() {
    const info = useAppSelector(state => state.configurationDistr)
    const [showPassword, setShowPassword] = useState(false)

    return (
        <PayPalScriptProvider options={{ 
            "client-id": "AQaoOgbWf8AHUhXNuJrI1FFvKlLYGjfeKOYjBOHObYm9FD36N8ebG--d2cumIr6z1jUAzvxdGr_DPO8U", 
            currency: 'EUR', intent: 'subscription', vault: true
        }}>
            <Grid container direction="column" justifyContent="center" alignItems="center" sx={{pt: 3}}>

            <Grid item>
                <Typography variant="h3" style={{fontWeight: 900}} sx={{pb: 2}}>Riepilogo</Typography>
                <Box display="flex">
                    <Typography style={{fontWeight: 'bold'}} sx={{pr: 1}}>Distretto:</Typography>
                    <Typography>{info.name}</Typography>
                </Box>
                <Box display="flex" alignItems="center">
                    <Typography style={{fontWeight: 'bold'}} sx={{pr: 1}}>Password:</Typography>
                    <Typography>{(showPassword ? info.password : '*********')} </Typography>
                    <IconButton onClick={() => setShowPassword((val) => !val)}>
                        {showPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                    </IconButton>
                </Box>
                <Box display="flex">
                    <Typography style={{fontWeight: 'bold'}} sx={{pr: 1}}>Sedi (N° medici per turno): </Typography>
                    <Typography>{info.sedi.map((s) => s.nome + " (" + s.medici_per_turno + ")").join(', ')}</Typography>
                </Box>
                {info.extraTurni && <>
                    <Typography>Giorni extra</Typography>
                </>}
                <Box display="flex" sx={{pb: 1}}>
                    <Typography style={{fontWeight: 'bold'}} sx={{pr: 1}}>Medici:</Typography>
                    <Typography>{Object.keys(info.medici).length}</Typography>
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