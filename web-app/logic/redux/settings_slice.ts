import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { getLocalActualDistretto } from '../local_utilities'

interface SettingsState {
    messageError: string
    distretto?: string
}

const initialState: SettingsState = {
    messageError: "",
    distretto: getLocalActualDistretto()
}

export const settingsSlice = createSlice({
    name: 'settings',
    initialState: initialState,
    reducers: {
        setMessageError: (state, action: PayloadAction<string>) => {
            state.messageError = action.payload
        },
        setDistrettoSlice: (state, action: PayloadAction<string>) => {
            state.distretto = action.payload
        }
    }
})

// Action creators are generated for each case reducer function
export const { setMessageError, setDistrettoSlice } = settingsSlice.actions

export default settingsSlice.reducer