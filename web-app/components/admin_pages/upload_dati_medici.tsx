import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import { useState } from "react";
import Button from "@mui/material/Button";
import { setDataMedici } from "../../logic/server/firestore/medici";
import { useAppDispatch } from "../../logic/redux/store";
import { setMessageError } from "../../logic/redux/settings_slice";
import { AppFirebaseError } from "../../logic/server/firebase";
import React from "react";
import useUser from "../../logic/hooks/use_user";

//! Da fare refactor
export default function UploadDatiMedico() {
    const [data, setData] = useState("")
    const [loading, setLoading] = useState(false)
    const [done, setDone] = useState(false)
    const [___, distretto, _, __] = useUser()
    const dispatch = useAppDispatch()

    const sendInfo = async () => {
        if (data.length === 0) return
        setLoading(true)
        setDone(false)
        try {
            await setDataMedici(data, distretto!)
            setDone(true)
        } catch(error: unknown) {
            if (error instanceof AppFirebaseError) {
                dispatch(setMessageError(error.message))
            } else {
                dispatch(setMessageError("Errore, riprovare!"))
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <Grid container spacing={2} direction="column" justifyContent="center" alignItems="center" sx={{px:"11%"}}>
            <Grid item>
                <Typography variant="h1" component="h1">Upload dati</Typography>
            </Grid>
            {
                loading && <p>Invio in corso</p>
            }
            {
                done && <p>Dati inviati!</p>
            }
            <Grid item>
                <TextField
                    label=""
                    placeholder="Dati medici"
                    multiline
                    value={data}
                    onChange={(event) => setData(event.target.value)}
                    style={{width: 1100}}
                />
            </Grid>
            <Grid item>
                <Button variant="contained" onClick={sendInfo}>
                    Invia i dati
                </Button>
            </Grid>
        </Grid>
    )
}