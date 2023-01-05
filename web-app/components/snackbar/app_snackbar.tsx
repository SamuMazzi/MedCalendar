import MessageSnackbar from "./message_snackbar"
import { useAppSelector, useAppDispatch } from "../../logic/redux/store"
import { setMessageError } from "../../logic/redux/settings_slice"

export default function AppSnackbar() {
    const messError = useAppSelector(state => state.settings.messageError)
    const dispatch = useAppDispatch()

    return (
        <MessageSnackbar isOpen={messError !== ""} 
            handleClose={() => dispatch(setMessageError(""))} 
            message={messError}    
        />
    )
}