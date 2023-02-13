import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { MedicoImported } from '../server/firestore/firestore'

interface ListMediciState {
    distretto: string
    doctors: Record<string, MedicoImported>
}

const initialState: ListMediciState = {
    distretto: '',
    doctors: {} 
}

export const medici_admin_slice = createSlice({
    name: 'medici_admin_slice',
    initialState: initialState,
    reducers: {
        setDoctorsAndDistretto: (state, action) => {
            state.distretto = action.payload['distretto']
            state.doctors = action.payload['doctors']
        },
        setMedicoLocal: (state, action: PayloadAction<MedicoImported>) => {
            const id_med = action.payload.email
            state.doctors[id_med] = action.payload
        },
        deleteMedicoLocal: (state, action) => {
            /*const out: Record<string, MedicoImported> = {}
            for (const id_med of Object.keys(doctors!)) {
                if (id_med !== id_med_deleted) {
                    out[id_med] = doctors[id_med]
                }
            }
            */
            delete state.doctors[action.payload]
        },
    }
})

// Action creators are generated for each case reducer function
export const { setDoctorsAndDistretto, setMedicoLocal, deleteMedicoLocal } = medici_admin_slice.actions

export default medici_admin_slice.reducer