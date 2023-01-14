import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import { addSingleMedico, MedicoRemote } from "../logic/server/firestore";
import { NewListDropdown, NewMapDropdown } from "../components/form_dropdown";
import Grid from "@mui/material/Grid";
import { CircularProgress } from "@mui/material";
import { useRouter } from "next/router";

export default function FormUploadSingleMedico() {
    const [nome, setNome] = useState("")
    const [cognome, setCognome] = useState("")
    const [email, setEmail] = useState("")
    const [ruolo, setRuolo] = useState("")
    const [sedi, setSedi] = useState<string[]>([])
    const ruoli = {
        'Sostituto': 'Sostituto',
        'Incaricato24': 'Incaricato 24',
        'Incaricato12': 'Incaricato 12',
        'Titolare24': 'Titolare'
    }
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")
    const router = useRouter()
    const [distretto, setDistretto] = useState("")

    useEffect(() => {
        if (router.isReady) {
            const defDistretto = router.query.distretto !== undefined ? (Array.isArray(router.query.distretto) ? router.query.distretto.at(0) : router.query.distretto)! : ""
            setDistretto(defDistretto)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router.isReady, router.query]);

    const uploadMedico = async () => {
        setMessage("")
        if (!nome || !cognome || !ruolo || !email || sedi.length === 0) {
            setMessage("Riempi tutti i campi")
            return
        }
        const medico: MedicoRemote = {
            "Nome": nome,
            "Cognome": cognome,
            "ruolo": ruolo,
            "sedi": sedi,
            "Email": email
        }
        setLoading(true)
        try {
            await addSingleMedico(medico, distretto)
            setMessage("Fatto!")
        } catch (e: any) {
            setMessage(e.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
        <Grid container spacing={2} alignItems="center" direction="column">
            <Grid item>
                <Typography variant="h3" component="h3">Aggiungi un medico</Typography>
            </Grid>
            <Grid item>
                <TextField
                    value={nome}
                    onChange={(event) => setNome(event.target.value)}
                    label=""
                    placeholder="Nome"
                />
            </Grid>
            <Grid item>
                <TextField
                    value={cognome}
                    onChange={(event) => setCognome(event.target.value)}
                    label=""
                    placeholder="Cognome"
                />
            </Grid>
            <Grid item>
                <TextField
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    label=""
                    placeholder="Email"
                />
            </Grid>
            <Grid item>
                <NewMapDropdown
                    label="Ruolo"
                    inputMap={ruoli}
                    value={ruolo}
                    onChangeFn={(event) => setRuolo(event.target.value)}
                />
            </Grid>
            <Grid item>
                <NewListDropdown
                    label="Sedi"
                    value={sedi}
                    inputList={['Sassuolo', 'Formigine']}
                    multiple
                    onChangeFn={(event) => setSedi(event.target.value)}
                />
            </Grid>
            <Grid item>
                <Typography>{message}</Typography>
            </Grid>
                {
                    loading && <Grid item>
                        <CircularProgress />
                    </Grid>
                }
            <Grid item>
                <Button onClick={uploadMedico}>Carica medico</Button>
            </Grid>
        </Grid>
        </>
    )
}