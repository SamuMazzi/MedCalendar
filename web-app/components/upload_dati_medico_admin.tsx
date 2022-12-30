import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import { useState } from "react";
import Button from "@mui/material/Button";
import { ImportFileExcel } from "./excel_export";
import { setDataMedici } from "../logic/server/firestore";

export default function UploadDatiMedico() {
    const [data, setData] = useState("")
    const [loading, setLoading] = useState(false)
    const [done, setDone] = useState(false)

    const sendInfo = async () => {
        if (data.length === 0) return
        setLoading(true)
        setDone(false)
        try {
            await setDataMedici(data)
            setDone(true)
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
            <Grid item>
                <Typography>Oppure carica il file</Typography>
            </Grid>
            <ImportFileExcel />
        </Grid>
    )
}