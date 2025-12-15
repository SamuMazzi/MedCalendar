import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../logic/redux/store'
import { AppFirebaseError } from '../../logic/server/firebase'
import { setMessageError } from '../../logic/redux/settings_slice'
import { setNameDistrictSlice, setRolesDistrictSlice } from '../../logic/redux/configuration_district_slice'
import { setSelectedDistrict } from '../../logic/redux/auth_slice'
import { getFromStorage } from '../../logic/local_utilities'
import { Chips } from 'primereact/chips'
import { Button } from 'primereact/button'

interface PropsPageStepper {
    nextPage: () => void
}

export const RegisterDistrictSection = (props: PropsPageStepper) => {
    const [nomeDistretto, setNomeDistretto] = useState(getFromStorage('district').name || "")
    const config_district = useAppSelector(state => state.configurationDistr)
    //TODO: Test this
    const [helperNomeDistretto, setHelperNomeDistretto] = useState("")
    const dispatch = useAppDispatch()
    const [tmpRoles, setTmpRoles] = useState<string[]>(Object.keys(config_district.roles))

    const onSubmit = async () => {
        setHelperNomeDistretto("")
        if (nomeDistretto.length === 0) {
            setHelperNomeDistretto("Inserisci un nome")
        } else if (nomeDistretto.length > 15) {
            setHelperNomeDistretto("Lunghezza massima di 15 caratteri")
        } else {
            try {
                set_definitive_roles()
                dispatch(setSelectedDistrict(nomeDistretto))
                dispatch(setNameDistrictSlice(nomeDistretto))
                props.nextPage()
            } catch (error) {
                if (error instanceof AppFirebaseError) {
                    dispatch(setMessageError(error.message))
                } else {
                    dispatch(setMessageError("Si è verificato un errore, riprovare"))
                }
            }
        }
    }

    const customChip = (item: string) => {
        const index = tmpRoles.indexOf(item)
        // const color = generateColorRole(index)
        return (
            <div>
                <span className='font-bold'>{index+1}: {item}</span>
            </div>
        );
    };

    const set_definitive_roles = () => {
        const out: Record<string, any> = {}
        for (let i = 0; i < tmpRoles.length; i++) {
            const newRole = {
                label: tmpRoles[i],
                priority: i
            }
            out[tmpRoles[i]] = newRole
        }
        dispatch(setRolesDistrictSlice(out))
    }

    const callback_modify_roles = (e: any) => {
        if (e.value) {
            setTmpRoles(e.value)
        }
    }

    return (
        <Grid container 
            sx={{py: 4}}
            direction="column"
            alignItems="center"
        >
            <Grid item>
                <Grid container gap={1} direction="column" sx={{borderRadius: 8, maxWidth: 350}} alignItems="center">
                    <Grid item sx={{mt: 4}}>
                        <Typography style={{fontWeight: 600}}>
                            Informazioni distretto
                        </Typography>
                        <Typography style={{fontWeight: 300}}>
                            Imposta il nome del distretto
                        </Typography>
                    </Grid>
                    <Grid item sx={{mt: 1}}>
                        <TextField 
                            value={nomeDistretto}
                            helperText={helperNomeDistretto}
                            style={{ width: "230px" }}
                            onChange={(e) => setNomeDistretto(e.target.value)}
                            placeholder='Nome distretto'
                        />
                    </Grid>
                    <Grid item>
                    <Chips value={tmpRoles} onChange={callback_modify_roles} allowDuplicate={false} 
                        itemTemplate={customChip} placeholder="Ruoli" 
                        className='mt-8 ml-4'
                        tooltip="Crea i ruoli ordinati in base alla priorità. Quando sarà calcolata la pianificazione dei turni si darà priorità alle persone con ruoli più alti." />
                    </Grid>
                    <Grid item>
                        <Button rounded onClick={onSubmit}>
                            Continua
                        </Button>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>

    )
}