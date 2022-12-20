import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from './store'

export type SediType = Record<string, Record<string, number[]>>;
type LocalTimestamp = number;

interface StateTurnoType {
  sedi: string[],
  disponibilita: Record<string, number[]>,
  value: number
  mese: LocalTimestamp | undefined
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

const today = new Date()
//

const initialStateTurni: StateTurnoType = {
  sedi: [],
  disponibilita: <Record<string, number[]>>{},
  value: 0,
  mese: (new Date(today.getFullYear(), today.getMonth()+1, today.getDate())).getTime(),
  medico: "",
  id_medico: ""
}

export const turnoSlice = createSlice({
  name: 'turno', 
  initialState: initialStateTurni,
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
      console.log('Slice: setting mese')
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