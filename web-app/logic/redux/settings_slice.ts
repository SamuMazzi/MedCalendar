import { createSlice } from '@reduxjs/toolkit'

interface SettingsState {
    messageError: string
}

const initialState: SettingsState = {
    messageError: ""
}

export const settingsSlice = createSlice({
    name: 'settings',
    initialState: initialState,
    reducers: {
        setMessageError: (state, action) => {
            state.messageError = action.payload
        },
    }
})

// Action creators are generated for each case reducer function
export const { setMessageError } = settingsSlice.actions

export default settingsSlice.reducer