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
import { MedicoImported, MedicoRemote } from "../logic/server/firestore/firestore";
import { addSingleMedico, deleteSingleMedicoServer, fromRemoteToImportedMedico, updateSingleMedico } from "../logic/server/firestore/medici";
import { NewListDropdown, NewMapDropdown } from "../components/general/form_dropdown";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { getMedici, validateEmail } from "../logic/local_utilities";
import ConfirmAlertDialog from "../components/general/alert_dialog";
import { useAppDispatch, useAppSelector } from "../logic/redux/store";
import { setDoctorsAndDistretto, setMedicoLocal, deleteMedicoLocal } from "../logic/redux/medici_admin";
import List from "@mui/material/List";
import assert from 'assert'

const ruoli: Record<string, string> = {
    'Sostituto': 'Sostituto',
    'Incaricato24': 'Incaricato 24',
    'Incaricato12': 'Incaricato 12',
    'Titolare24': 'Titolare 24',
    'Titolare36': 'Titolare 36'
}

interface PropsDoctorItem {
    doc?: MedicoImported
}

function DoctorItem(props: PropsDoctorItem) {
    const [open, setOpen] = useState(false);
    const distretto = useAppSelector(state => state.mediciAdmin.distretto)
    const dispatch = useAppDispatch()

    const setMedico = async (med: MedicoRemote) => {
        if(props.doc) {
            await updateSingleMedico(med, distretto)
        } else {
            await addSingleMedico(med, distretto)
        }
        dispatch(setMedicoLocal(fromRemoteToImportedMedico(med)))
    }

    const deleteMedico = async (id_doc: string) => {
        await deleteSingleMedicoServer(id_doc, distretto)
        dispatch(deleteMedicoLocal(id_doc))
    }

    const handleClick = () => {
      setOpen(!open);
    };
    
    return (
        <Card elevation={5} sx={{my: 1, borderRadius: 6}}>
            <ListItemButton onClick={handleClick}>
                <ListItemText 
                    primary={props.doc ? props.doc.nome : "Nuovo medico"} 
                    secondary={props.doc ? ruoli[props.doc.ruolo] : "Clicca per aggiungere"}
                    />
                {open ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={open} timeout="auto" unmountOnExit>
                <FormSingleMedico medico={props.doc} onDelete={deleteMedico} onSetMedico={setMedico}/>  
            </Collapse>
        </Card>
    );
}

export default function ContainerEditDoctors() {
    const doctors = useAppSelector(state => state.mediciAdmin.doctors)
    const distretto = useAppSelector(state => state.settings.distretto)
    const dispatch = useAppDispatch()

    const setState = async () => {
        const docs = await getMedici()
        dispatch(setDoctorsAndDistretto({
            distretto: distretto,
            doctors: docs
        }))
    }

    useEffect(() => {
        setState()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        doctors && <List
        sx={{ bgcolor: 'background.paper', px: "15%" }}
      >

        {
            Object.keys(doctors).map(doc_id => <DoctorItem key={doc_id} doc={doctors[doc_id]}/>)
        }
        <DoctorItem />
      </List>
    )
}

interface PropsFormSingleMedico {
    medico?: MedicoImported
    onDelete?: (arg0: string) => Promise<void>
    onSetMedico: (arg0: MedicoRemote) => Promise<void>
}

export function FormSingleMedico(props: PropsFormSingleMedico) {
    assert(props.medico === undefined && props.onDelete === undefined || props.medico !== undefined && props.onDelete !== undefined)
    const [medico, setMedico] = useState<MedicoImported>(props.medico || {nome: "", email: "", ruolo: "", sedi: []})
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(false)
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false)

    const _deleteMedico = async () => {
        setLoading(true)
        try {
            await props.onDelete!(props.medico!.email)
        } finally {
            setLoading(false)
        }
    }

    const uploadMedico = async () => {
        setMessage("")
        if (!medico.nome || !medico.ruolo || !medico.email || medico.sedi.length === 0) {
            setMessage("Riempi tutti i campi")
            return
        } else if (!validateEmail(medico.email)) {
            setMessage('Inserisci una mail valida')
            return
        }
        setLoading(true)
        const dataMedico = {
            Nome: medico.nome,
            Cognome: "",
            Email: medico.email,
            sedi: medico.sedi,
            ruolo: medico.ruolo
        }
        try {
            await props.onSetMedico(dataMedico)
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
                    props.medico ? "" : "Aggiungi un medico"
                }</Typography>
            </Grid>
            <Grid item>
                <Grid container direction="row" spacing={2}>
                    <Grid item>
                        <TextField
                            value={medico.nome}
                            onChange={(event) => setMedico({
                                ...medico,
                                nome: event.target.value
                            })}
                            label=""
                            placeholder="Nome"
                        />
                    </Grid>
                    <Grid item>
                        <TextField
                            value={medico.email}
                            onChange={(event) => setMedico({
                                ...medico,
                                email: event.target.value
                            })}
                            label=""
                            placeholder="Email"
                            disabled={props.medico !== undefined}
                        />
                    </Grid>
                </Grid>
            </Grid>
            <Grid item>
                <Grid container direction="row" spacing={2}>
                    <Grid item>
                        <NewMapDropdown
                            label="Ruolo"
                            inputMap={ruoli}
                            value={medico.ruolo}
                            onChangeFn={(event) => setMedico({
                                ...medico,
                                ruolo: event.target.value
                            })}
                        />
                    </Grid>
                    <Grid item>
                        <NewListDropdown
                            label="Sedi"
                            value={medico.sedi}
                            inputList={['Sassuolo', 'Formigine']}
                            multiple
                            onChangeFn={(event) => setMedico({
                                ...medico,
                                sedi: event.target.value
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
                    {props.medico ? "Modifica medico" : "Carica medico"}
                </Button>
                {
                    props.medico && 
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