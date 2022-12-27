import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from './store'

export type SediType = Record<string, Record<string, number[]>>;
type LocalTimestamp = number;

export interface StateTurno {
  sedi: string[],
  disponibilita: Record<string, number[]>,
  oreMassime: number
  mese: LocalTimestamp | undefined
}

interface ParamDisponibilita {
  fasciaTurno: string,
  giorno: number
}

const today = new Date()

const initialStateTurni: StateTurno = {
  sedi: [],
  disponibilita: <Record<string, number[]>>{},
  oreMassime: 0,
  mese: (new Date(today.getFullYear(), today.getMonth()+1, today.getDate())).getTime()
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
    clearState: (state) => {
      state = initialStateTurni
    },
    setOreMassime: (state, action) => {
      state.oreMassime = action.payload
    },
    setMese: (state, action) => {
      console.log('Slice: setting mese')
      state.mese = action.payload
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
export const { setOreMassime, handleDisponibilita, handleSede, setMese, clearState } = turnoSlice.actions
// Other code such as selectors can use the imported `RootState` type
export const selectListSedi = (state: RootState) => Object.keys(state.turni.sedi)

export default turnoSlice.reducer