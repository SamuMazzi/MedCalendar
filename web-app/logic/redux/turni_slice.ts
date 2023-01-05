import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from './store'

export type SediType = Record<string, Record<string, number[]>>;

export interface StateTurno {
  sedi: string[],
  disponibilita: Record<string, number[]>,
  oreMassime: number
  timestamp_mese: number | undefined
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
  timestamp_mese: (new Date(today.getFullYear(), today.getMonth()+1, today.getDate())).getTime()
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
    clearState: () => initialStateTurni, //* Funziona
    setOreMassime: (state, action) => {
      state.oreMassime = action.payload
    },
    setMese: (state, action) => {
      state.timestamp_mese = action.payload
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
    clearDisponibilita: (state) => {
      Object.keys(state.disponibilita).forEach((disp: string) => {
        delete state.disponibilita[disp]
      })
    },
    handleSede: (state: any, action: PayloadAction<string[]>) => {
        state.sedi = action.payload
    }
  }
})

// Action creators are generated for each case reducer function
export const { setOreMassime, handleDisponibilita, handleSede, setMese, clearState, clearDisponibilita } = turnoSlice.actions
// Other code such as selectors can use the imported `RootState` type
export const selectListSedi = (state: RootState) => Object.keys(state.turni.sedi)

export default turnoSlice.reducer