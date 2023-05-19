import { useState } from "react";
import { useRouter } from "next/router";
import { useAppDispatch } from "../../logic/redux/store";
import { setAdmin, setUser } from '../../logic/redux/auth_slice';
import { SearchableDropdownMap } from '../general/form_dropdown';
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import { FormButtonSubmit, FormTextField } from "./form_components";
import useMedici from "../../logic/hooks/use_medici";
import { signInAnonym } from "../../logic/server/auth";

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
    const [allMedici, loadingMedici, errorMedici] = useMedici()
    const [medicoSelected, setMedico] = useState<string | null>();
    const [helperText, setHelperText] = useState("");
    const [helperPassword, setHelperPassword] = useState("")
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
                await signInAnonym()
                dispatch(setUser({ uid: medicoSelected, data: allMedici[medicoSelected] }))
                dispatch(setAdmin(false))
                if (returnUrl && !returnUrl.includes('login') && !returnUrl.includes('_admin')) {
                    //TODO Salvare HASH in storage
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
                        data-cy="password_login_med"
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