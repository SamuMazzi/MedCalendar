import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type ModeTurni = 'Interi' | 'Mezzi'

interface Sede {
    nome: string,
    medici_per_turno: number,
}

interface StateDistretto {
    sedi: Sede[],
    mode_turno: ModeTurni,
    password: string, //?
    medici: string[] //?
    modifiche?: Record<string, string> //* Ancora da definire
}

export interface ParamSede {
    index: number,
    nome: string,
    medici_per_turno: number,
    mode_turno: ModeTurni,
}

const initialState: StateDistretto = {
  sedi: [],
  password: "",
  medici: [],
  mode_turno: 'Interi',
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
    }
})

// Action creators are generated for each case reducer function
export const { addSede, changeNumMediciPerTurnoSede, changeNomeSede } = configuration_distretti_slice.actions

export default configuration_distretti_slice.reducer