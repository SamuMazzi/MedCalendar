import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { MedicoImported } from '../server/firestore/firestore'

interface Sede {
    nome: string,
    medici_per_turno: number,
}

export type PricingPlan = 'GM_Base' | 'Contattaci'

interface HoursTurno {
    from: string
    to: string
}

export interface TurnoDistretto extends HoursTurno {
    daysOfWeek: number[]
}

export interface SingleTurnoDistretto extends HoursTurno {
    date_millis: number //* Milliseconds since epoch of day
}

export interface StateDistretto {
    name: string,
    sedi: Sede[],
    turni: TurnoDistretto[],
    password: string, //?
    medici: Record<string, MedicoImported> //?
    extraTurni?: SingleTurnoDistretto[]
    pricingPlan: PricingPlan
    // modifiche?: Record<string, string> //* Ancora da definire
}

export interface ParamSede {
    index: number,
    nome: string,
    medici_per_turno: number,
}

interface ParamSetExtraTurno {
    turno: SingleTurnoDistretto
    index?: number
}

const initialState: StateDistretto = {
    name: '',
    sedi: [],
    password: "",
    medici: {},
    turni: [],
    pricingPlan: 'Contattaci'
}

const checkIndex = (lenSedi: number, index: number) => {
    if(lenSedi - 1 < index) {
        throw "Errore nel trovare la sede"
    }
}

export const configuration_distretti_slice = createSlice({
    name: 'configuration_distretti',
    initialState: initialState,
    reducers: {
        addSede: (state, action: PayloadAction<ParamSede>) => {
            if(state.sedi.some(sede => sede.nome === action.payload.nome)) {
                throw "Nome già utilizzato" //TODO: Creare custom exception
            }
            const newSede: Sede = {
                nome: action.payload.nome,
                medici_per_turno: action.payload.medici_per_turno,
            }
            state.sedi = [...state.sedi, newSede]
        },
        deleteSede: (state, action: PayloadAction<number>) => {
            const index = action.payload
            state.sedi = state.sedi!.filter((v, i) => i !== index)
        },
        changeNomeSede: (state, action) => {
            const index = action.payload.index
            const data = action.payload
            checkIndex(state.sedi.length, index)
            state.sedi[index].nome = data.nome
        },
        changeNumMediciPerTurnoSede: (state, action) => {
            const index = action.payload.index
            const data = action.payload
            checkIndex(state.sedi.length, index)
            state.sedi[index].medici_per_turno = data.medici_per_turno
        },
        changeFasciaTurnoDistretto: (state, action) => {
            //const index = action.payload.index
            const newTurni = action.payload
            //checkIndex(state.sedi.length, index)
            state.turni = [...newTurni]
        },
        setExtraTurno: (state, action: PayloadAction<ParamSetExtraTurno>) => {
            const turno = action.payload.turno
            const index = action.payload.index
            if (index) {
                const newExtraTurni = [...state.extraTurni!]
                newExtraTurni[index] = turno
                state.extraTurni = [...newExtraTurni]
            }
            if (state.extraTurni) {
                state.extraTurni = [...state.extraTurni, turno]
            } else {
                state.extraTurni = [turno]
            }
        },
        removeExtraTurno: (state, action: PayloadAction<number>) => {
            const index = action.payload
            state.extraTurni = state.extraTurni!.filter((v, i) => i !== index)
        },
        setPasswordDistrettoSlice: (state, action: PayloadAction<string>) => {
            state.password = action.payload
        },
        setNameDistrettoSlice: (state, action: PayloadAction<string>) => {
            state.name = action.payload
        },
        setMedicoDistrettoSlice: (state, action: PayloadAction<MedicoImported>) => {
            const medico = action.payload
            const id_doc = medico.email
            state.medici = {...state.medici, [id_doc]: medico}
        },
        removeMedicoDistrettoSlice: (state, action: PayloadAction<string>) => {
            const id_doc = action.payload
            const { [id_doc]: _, ...others} = state.medici
            state.medici = others
        },
        setPricingPlan: (state, action: PayloadAction<PricingPlan>) => {
            state.pricingPlan = action.payload
        }
    }
})

// Action creators are generated for each case reducer function
export const { addSede, deleteSede, changeNumMediciPerTurnoSede, changeNomeSede, 
    changeFasciaTurnoDistretto, setPasswordDistrettoSlice, setMedicoDistrettoSlice, 
    removeMedicoDistrettoSlice, setPricingPlan, setNameDistrettoSlice } = configuration_distretti_slice.actions

export default configuration_distretti_slice.reducer