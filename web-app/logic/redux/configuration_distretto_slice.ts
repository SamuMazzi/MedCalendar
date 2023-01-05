import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Sede {
    nome: string,
    medici_per_turno: number,
    fasce_turno: Turno[],
    modifiche: Record<string, string> | undefined //* Ancora da definire
}

export interface Turno {
    fascia: string,
    giorni_settimana: number[]
}

interface StateCreateSediType {
    sedi: Sede[],
    password: string, //?
    medici: string[] //?
}

export interface ParamSede {
    index: number,
    nome: string,
    medici_per_turno: number,
    fasce_turno: Turno[] | undefined,
}

type TypeModifica = "add_turno" | "remove_turno" | "change_n_medici" | "unknown"

interface ModificheTurno {
    giorni: string[],
    type: TypeModifica,
    fascia_turno: string | undefined,
    n_medici: number | undefined
}

interface ParamsModificheTurno {
    index: number,
    modifiche: ModificheTurno
}

const initialState: StateCreateSediType = {
  sedi: [],
  password: "",
  medici: []
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
                fasce_turno: action.payload.fasce_turno !== undefined ? action.payload.fasce_turno : [],
                modifiche: undefined
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
        changeFasceTurnoSede: (state, action) => {
            const index = action.payload.index
            const data = action.payload
            checkIndex(state.sedi.length, index)
            state.sedi[index].fasce_turno = data.fasce_turno
        },
        addModificheTurno: (state, action: PayloadAction<ParamsModificheTurno>) => {
            const index = action.payload.index
            const data = action.payload
            if(state.sedi.length - 1 < index) {
                throw "Errore nel trovare la sede"
            }
            //* Here
        },
    }
})

// Action creators are generated for each case reducer function
export const { addSede, changeFasceTurnoSede, changeNumMediciPerTurnoSede, changeNomeSede } = configuration_distretti_slice.actions

export default configuration_distretti_slice.reducer