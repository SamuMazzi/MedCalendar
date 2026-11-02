import { getAllDoctorsServer } from "../logic/server/firestore/firestore";
import React from "react";
import { useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import Collapse from "@mui/material/Collapse";
import ListItemText from "@mui/material/ListItemText";
import ListItemButton from "@mui/material/ListItemButton";
import { DoctorInterface } from "../logic/server/firestore/firestore";
import { addSingleMedico, deleteSingleMedicoServer, updateSingleMedico } from "../logic/server/firestore/doctors";
import { NewListDropdown, NewMapDropdown } from "../components/general/form_dropdown";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { validateEmail } from "../logic/local_utilities";
import ConfirmAlertDialog from "../components/general/alert_dialog";
import { useAppDispatch, useAppSelector } from "../logic/redux/store";
import List from "@mui/material/List";
import assert from 'assert'
import useInfoDistrict from "../logic/hooks/use_info_district";
import { removeDoctorFromDistrictSlice, setDoctorOfDistrictSlice } from "../logic/redux/configuration_district_slice";

/* const ruoli: Record<string, string> = {
    'Sostituto': 'Sostituto',
    'Incaricato24': 'Incaricato 24',
    'Incaricato12': 'Incaricato 12',
    'Titolare24': 'Titolare 24',
    'Titolare36': 'Titolare 36'
} */

interface PropsDoctorItem {
    doc?: DoctorInterface
}

function DoctorItem(props: PropsDoctorItem) {
    const [open, setOpen] = useState(false);
    const district = useAppSelector(state => state.auth.selectedDistrict)
    const [infoDistrict, error, loading] = useInfoDistrict(district)
    const dispatch = useAppDispatch()

    const setMedico = async (med: DoctorInterface) => {
        if(props.doc) {
            await updateSingleMedico(med, district)
        } else {
            await addSingleMedico(med, district)
        }
        dispatch(setDoctorOfDistrictSlice(med))
    }

    const deleteMedico = async (id_doc: string) => {
        await deleteSingleMedicoServer(id_doc, district)
        dispatch(removeDoctorFromDistrictSlice(id_doc))
    }

    const handleClick = () => {
      setOpen(!open);
    };

    if (loading) {
        return <CircularProgress />
    }

    if (error) {
        return <Typography color="error">{error}</Typography>
    }
    assert(infoDistrict !== undefined)
    
    return (
        <Card elevation={5} sx={{my: 1, borderRadius: 6}}>
            <ListItemButton onClick={handleClick}>
                <ListItemText 
                    primary={props.doc ? props.doc.name : "Nuovo medico"} 
                    secondary={props.doc && props.doc.role ? infoDistrict.roles[props.doc.role] : "Clicca per aggiungere"}
                    />
                {open ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={open} timeout="auto" unmountOnExit>
                <FormSingleDoctor doctor={props.doc} onDelete={deleteMedico} onSetDoctor={setMedico}/>  
            </Collapse>
        </Card>
    );
}

export default function ContainerEditDoctors() {
    const doctors = useAppSelector(state => state.configurationDistr.doctors)
    const district = useAppSelector(state => state.auth.selectedDistrict)
    const dispatch = useAppDispatch()

    useEffect(() => {
        if (!district) return
        getAllDoctorsServer(district).then(all =>
            Object.values(all).forEach(doc => dispatch(setDoctorOfDistrictSlice(doc)))
        )
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [district])

    return <List
        sx={{ bgcolor: 'background.paper', px: "15%" }}
      >

        {
            Object.keys(doctors).map(doc_id => <DoctorItem key={doc_id} doc={doctors[doc_id]}/>)
        }
        <DoctorItem />
    </List>
}

interface PropsFormSingleDoctor {
    doctor?: DoctorInterface
    onDelete?: (arg0: string) => Promise<void>
    onSetDoctor: (arg0: DoctorInterface) => Promise<void>
}

export function FormSingleDoctor(props: PropsFormSingleDoctor) {
    assert(props.doctor === undefined && props.onDelete === undefined || props.doctor !== undefined && props.onDelete !== undefined)
    const [doctor, setDoctor] = useState<DoctorInterface>(props.doctor || {name: "", email: "", role: "", locations: []})
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(false)
    const district = useAppSelector(state => state.auth.selectedDistrict)
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
    const locations = useAppSelector(state => state.configurationDistr.locations) //TODO: Da modificare per poter essere utilizzato anche solo nelle modifiche e non solo nella creazione
    const [infoDistrict, error, loadingDistrict] = useInfoDistrict(district)
    const roles = infoDistrict ? infoDistrict.roles : {}

    if (loadingDistrict) {
        return <CircularProgress />
    }

    if (error) {
        return <Typography color="error">{error}</Typography>
    }

    const _deleteMedico = async () => {
        assert(props.doctor !== undefined && props.onDelete !== undefined)
        setLoading(true)
        try {
            await props.onDelete(props.doctor.email)
        } finally {
            setLoading(false)
        }
    }

    const uploadMedico = async () => {
        setMessage("")
        if (!doctor.name || !doctor.role || !doctor.email || doctor.locations?.length === 0) {
            setMessage("Riempi tutti i campi")
            return
        } else if (!validateEmail(doctor.email)) {
            setMessage('Inserisci una mail valida')
            return
        }
        setLoading(true)
        try {
            await props.onSetDoctor(doctor)
        } catch (e: any) {
            setMessage(e.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
        <Grid container spacing={2} alignItems="center" direction="column" sx={{py: 2}}>
            <Grid item>
                <Typography variant="h6" component="h6">{
                    props.doctor ? "" : "Aggiungi un medico"
                }</Typography>
            </Grid>
            <Grid item>
                <Grid container direction="row" spacing={2}>
                    <Grid item>
                        <TextField
                            value={doctor.name}
                            onChange={(event) => setDoctor({
                                ...doctor,
                                name: event.target.value
                            })}
                            label=""
                            placeholder="Nome"
                        />
                    </Grid>
                    <Grid item>
                        <TextField
                            value={doctor.email}
                            onChange={(event) => setDoctor({
                                ...doctor,
                                email: event.target.value
                            })}
                            label=""
                            placeholder="Email"
                            disabled={props.doctor !== undefined}
                        />
                    </Grid>
                </Grid>
            </Grid>
            <Grid item>
                <Grid container direction="row" spacing={2}>
                    <Grid item>
                        <NewMapDropdown
                            label="Ruolo"
                            inputMap={roles}
                            value={doctor.role}
                            onChangeFn={(event) => setDoctor({
                                ...doctor,
                                role: event.target.value
                            })}
                        />
                    </Grid>
                    <Grid item>
                        <NewListDropdown
                            label="Sedi"
                            value={doctor.locations}
                            inputList={locations.map((s) => s.name)}
                            multiple
                            onChangeFn={(event) => setDoctor({
                                ...doctor,
                                locations: event.target.value
                            })}
                        />
                    </Grid>
                </Grid>
            </Grid>
                {
                    loading && <Grid item>
                        <CircularProgress />
                    </Grid>
                }
            <Grid item>
                <Button variant="contained" onClick={uploadMedico}>
                    {props.doctor ? "Modifica medico" : "Carica medico"}
                </Button>
                {
                    props.doctor && 
                    <Button variant="contained" 
                        sx={{ml: 2}}
                        color="warning"
                        onClick={() => setOpenDeleteDialog(true)}>
                        Elimina medico
                    </Button>
                }
            </Grid>
            <Grid item>
                <Typography color='error' style={{fontSize: 14}}>{message}</Typography>
            </Grid>
            <ConfirmAlertDialog 
            open={openDeleteDialog} 
            onClose={() => setOpenDeleteDialog(false)}
            onConfirm={_deleteMedico}
            title={"Elimina medico"}
            description={"Vuoi davver eliminare questo medico? Non potrai più recuperare i suoi dati in un secondo momento"}/>
        </Grid>
        </>
    )
}