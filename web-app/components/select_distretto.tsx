import Grid from '@mui/material/Grid'
import { useAppSelector } from '../logic/redux/store';
import { Dropdown } from 'primereact/dropdown';

interface ParamSelectDistrict {
    district: string | undefined,
    setDistrict: (arg0: string) => void
}

export default function SelectDistrict(props: ParamSelectDistrict) {
    const authState = useAppSelector(state => state.auth);

    const userDistricts = authState.districts.map((district) => ({ label: district, value: district }))
    const ownedDistricts = authState.ownedDistricts.map((district) => ({ label: district, value: district }))

    const options = []
    if (userDistricts.length > 0) {
        options.push({label: "Utente", items: userDistricts})
    }
    if (ownedDistricts.length > 0) {
        options.push({label: "Amministratore", items: ownedDistricts})
    }

    return (
        <Grid item>
            <Dropdown value={props.district} onChange={(e) => props.setDistrict(e.value)} options={options} optionLabel="label" 
                optionGroupLabel="label" optionGroupChildren="items"  // optionGroupTemplate={groupedItemTemplate} 
                className="w-full md:w-14rem" placeholder="Distretto" emptyFilterMessage={<span>Nessun risultato</span>}
                emptyMessage={<span>Nessun risultato</span>} />
        </Grid>
    )
}
