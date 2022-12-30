import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAppDispatch } from "../../logic/redux/store";
import { getAllMedici, getGenericPassword } from '../../logic/server/firestore';
import { setAdmin, setUser } from '../../logic/redux/auth_slice';
import { saveToStorage, getFromStorage, getAllLocalMedici } from '../../logic/local_storage';
import { SearchableDropdownMap } from '../form_dropdown';
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";

export default function MedicoLogin() {
    const [allMedici, setAllMedici] = useState<Record<string, Record<any, any>>>({});
    const [medicoSelected, setMedico] = useState<string | null>();
    const [helperText, setHelperText] = useState("");
    const [helperPassword, setHelperPassword] = useState("")
    const [loading, setLoading] = useState(false);
    const [loadingLogin, setLoadingLogin] = useState(false);
    const [password, setPassword] = useState("")
    const router = useRouter()
    const { returnUrl } = router.query
    const dispatch = useAppDispatch()

    const handleSubmit = async () => {
        setHelperText("")
        setHelperPassword("")

        if (!medicoSelected) {
            setHelperText("Seleziona un medico")
            return;
        }
        try {
            setLoadingLogin(true)
            const serverPassw = await getGenericPassword()
            if (password === serverPassw) {
                if (returnUrl) {
                    dispatch(setUser({ uid: medicoSelected, data: allMedici[medicoSelected] }))
                    dispatch(setAdmin(false))
                    router.push(Array.isArray(returnUrl) ? returnUrl.at(0)! : returnUrl)
                } else {
                    router.push('/')
                }
            } else {
                setHelperPassword("Password sbagliata")
            }
        } finally {
            setLoadingLogin(false)
        }
    }

    const retrieveMedici = async () => {
        setLoading(true)
        let docs = getFromStorage("all_medici")
        if (docs !== undefined) { //! Se funziona cosi, togliere getFromStorage
            docs = getAllLocalMedici()//await getAllMedici()
            saveToStorage("all_medici", docs)
        }
        console.log(docs);
        setAllMedici(docs)
        setLoading(false)
    }

    useEffect(() => {
        retrieveMedici();
    }, [])

    return (
        <>
        {
            loading &&
            <Grid item>
                <CircularProgress />
            </Grid>
        }
        {
            !loading &&
            <SearchableDropdownMap
                label="Seleziona il medico"
                value={medicoSelected ? medicoSelected : null}
                onChangeFn={(newMed) => setMedico(newMed)}
                inputMap={allMedici}
                helperText={helperText}
                extraFieldMenuItem={'nome'}
            />
            /* <NewMapDropdown 
                label="Seleziona il medico"
                value={medicoSelected}
                onChangeFn={(event) => setMedico(event.target.value)}
                inputMap={allMedici}
                helperText={helperText}
                extraFieldMenuItem={'nome'}
            />  */
        }
        {
            !loading &&
            <Grid item>
                <TextField
                    value={password}
                    label=""
                    placeholder="Inserisci la password"
                    onChange={(event) => setPassword(event.target.value)}
                    type="password"
                    variant='outlined'
                    helperText={helperPassword}
                    error={helperPassword !== ""}
                    sx={{ mb: 2 }}
                    style={{ width: "230px" }}
                />
            </Grid>
        }
        <Grid item>
            {
                loadingLogin ? <CircularProgress /> :
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        variant="contained"
                    >
                        <Typography style={{ fontWeight: "bold", fontSize: 18 }}>
                            Accedi
                        </Typography>
                    </Button>
            }
        </Grid>
        </>
    )
}