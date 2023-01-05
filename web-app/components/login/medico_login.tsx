import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAppDispatch } from "../../logic/redux/store";
//import { getAllMedici } from '../../logic/server/firestore';
import { setAdmin, setUser } from '../../logic/redux/auth_slice';
import { saveToStorage, getFromStorage, getAllLocalMedici } from '../../logic/local_utilities';
import { SearchableDropdownMap } from '../form_dropdown';
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import { FormButtonSubmit, FormTextField } from "./form_components";

const calculateHashText = async (text: string) => {
    if(!window) return
    const textAsBuffer = new TextEncoder().encode(text);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', textAsBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const digest = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return digest
}

const checkPassword = async (pass: string, real_pass: string) => {
    const hashPassword = await calculateHashText(pass)
    return real_pass === hashPassword
}

interface PropsMedicoLogin {
    server_psw: string
}

export default function MedicoLogin(props: PropsMedicoLogin) {
    const [allMedici, setAllMedici] = useState<Record<string, Record<any, any>>>({});
    const [medicoSelected, setMedico] = useState<string | null>();
    const [helperText, setHelperText] = useState("");
    const [helperPassword, setHelperPassword] = useState("")
    const [loadingMedici, setLoadingMedici] = useState(false);
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
            if (await checkPassword(password, props.server_psw)) {
                if (returnUrl && !returnUrl.includes('login')) {
                    //TODO Salvare HASH in storage
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
        setLoadingMedici(true)
        let docs = getFromStorage("all_medici")
        if (docs !== undefined) { //* Si potrà poi togliere getFromStorage
            docs = getAllLocalMedici()//await getAllMedici()
            saveToStorage("all_medici", docs)
        }
        setAllMedici(docs)
        setLoadingMedici(false)
    }

    useEffect(() => {
        retrieveMedici();
    }, [])

    return (
        <>
        {
            loadingMedici &&
            <Grid item>
                <CircularProgress />
            </Grid>
        }
        {
            !loadingMedici &&
            <>
                <Grid item sx={{pb: 1}}>
                    <SearchableDropdownMap
                        label="Seleziona il medico"
                        value={medicoSelected ? medicoSelected : null}
                        onChangeFn={(newMed) => setMedico(newMed)}
                        inputMap={allMedici}
                        helperText={helperText}
                        extraFieldMenuItem={'nome'}
                    />
                </Grid>
                <Grid item sx={{ mb: 2 }}>
                    <FormTextField 
                        value={password} 
                        helperText={helperPassword} 
                        onChangeFn={(newVal) => setPassword(newVal)} 
                        placeholder="Inserisci la password" 
                        password
                    />
                </Grid>
            </>
        }
        <Grid item>
            <FormButtonSubmit 
                loading={loadingMedici || loadingLogin}
                onClick={handleSubmit}
            />
        </Grid>
        </>
    )
}