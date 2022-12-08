import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from './store'

export type SediType = Record<string, Record<string, number[]>>;

interface StateType {
  sedi: string[],
  disponibilita: Record<string, number[]>,
  value: number
  mese: number
  medico: string
  id_medico: string
}

interface ParamDisponibilita {
  fasciaTurno: string,
  giorno: number
}

interface ParamMedico {
  nome: string,
  id: string
}

const initialState: StateType = {
  sedi: [],
  disponibilita: <Record<string, number[]>>{},
  value: 0,
  mese: 0,
  medico: "",
  id_medico: ""
}

export const turnoSlice = createSlice({
  name: 'turno', 
  initialState: initialState,
  /**
   * sedi:{
   *    'Formigine': {
   *        "8-20": [],
   *        "20-8": []
   *    }
   * }
   */
  reducers: {
    setValue: (state, action) => {
      state.value = action.payload
    },
    setMese: (state, action) => {
      state.mese = action.payload
    },
    setMedico: (state, action: PayloadAction<ParamMedico>) => {
      state.id_medico = action.payload.id
      state.medico = action.payload.nome
    },
    handleDisponibilita: (state, action: PayloadAction<ParamDisponibilita>) => {
        //action.payload -> sedi, fasciaTurno, giorno
        const giorno = action.payload.giorno;
        const fasciaTurno = action.payload.fasciaTurno;
        const oldDisponibilita = state.disponibilita[fasciaTurno] !== undefined ? state.disponibilita[fasciaTurno] : []
        if(oldDisponibilita.includes(giorno)) {
            state.disponibilita[fasciaTurno] = oldDisponibilita.filter((a) => a !== giorno)
        } else {
            state.disponibilita[fasciaTurno] = [...oldDisponibilita, giorno]
        }
    },
    handleSede: (state: any, action: PayloadAction<string[]>) => {
        /* if(Object.keys(state.sedi).includes(action.payload)) {
          delete state.sedi[action.payload]
        } else {
          state.sedi = {
            [action.payload]: <Record<string, number[]>>{}
          }
        } */
        state.sedi = action.payload
    }
  }
})

// Action creators are generated for each case reducer function
export const { setValue, handleDisponibilita, handleSede, setMese, setMedico } = turnoSlice.actions
// Other code such as selectors can use the imported `RootState` type
export const selectListSedi = (state: RootState) => Object.keys(state.turni.sedi)

export default turnoSlice.reducer