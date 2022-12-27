import Snackbar from "@mui/material/Snackbar"
import Alert from '@mui/material/Alert'

interface PropsMessageSnackbar {
    isOpen: boolean
    handleClose: Function
    title?: string
    message: string
}

export default function MessageSnackbar(props: PropsMessageSnackbar) {
    const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason !== 'clickaway') props.handleClose();
    };

    return (
        <Snackbar open={props.isOpen} autoHideDuration={3000} onClose={handleCloseSnackbar}>
            <Alert onClose={handleCloseSnackbar} severity="error" sx={{ minWidth: 200, maxWidth: 650 }}>
                {props.message}
            </Alert>
        </Snackbar>
    )
}