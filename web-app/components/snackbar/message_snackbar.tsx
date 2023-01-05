import Snackbar from "@mui/material/Snackbar"
import Alert from '@mui/material/Alert'

interface PropsMessageSnackbar {
    isOpen: boolean
    handleClose: Function
    title?: string
    message: string
    duration?: number | null
    severity?: "success" | "error"
}

export default function MessageSnackbar(props: PropsMessageSnackbar) {
    const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason !== 'clickaway') props.handleClose();
    };

    return (
        <Snackbar open={props.isOpen} autoHideDuration={props.duration === undefined ? 3000 : props.duration} onClose={handleCloseSnackbar}>
            <Alert onClose={handleCloseSnackbar} severity={props.severity ? props.severity : "error"} sx={{ minWidth: 200, maxWidth: 650 }}>
                {props.message}
            </Alert>
        </Snackbar>
    )
}