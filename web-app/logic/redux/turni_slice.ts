import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from './store'

export type LocationsType = Record<string, Record<string, number[]>>;

export interface StateShift {
  locations: string[],
  /**
   * Record of availability for each shift
   * 
   * Key is the shift, like 8-14, 14-20
   * Values are timestamps of available days
   */
  availability: Record<string, number[]>,
  max_hours: number
  timestamp_month: number | undefined
}

interface ParamAvailabilityDoctor {
  /**
   * Selected shift to modify, like 8-14, or 14-20
   */
  shift: string,
  /*
  * Timestamps of available days selected by the user
  */
  days: number[]
}

const today = new Date()

const initialStateShifts: StateShift = {
  locations: [],
  availability: <Record<string, number[]>>{},
  max_hours: 0,
  timestamp_month: (new Date(today.getFullYear(), today.getMonth()+1, today.getDate())).getTime()
}

export const turnoSlice = createSlice({
  name: 'shift', 
  initialState: initialStateShifts,
  /**
   * sedi:{
   *    'Formigine': {
   *        "8-20": [],
   *        "20-8": []
   *    }
   * }
   */
  reducers: {
    clearState: () => initialStateShifts, //* Funziona
    setMaxHours: (state, action: PayloadAction<number>) => {
      state.max_hours = action.payload
    },
    setMonth: (state, action: PayloadAction<number>) => {
      state.timestamp_month = action.payload
    },
    setNewAvailabilityDoctor: (state, action: PayloadAction<ParamAvailabilityDoctor>) => {
      // assert(action.payload.days, "Shift is undefined")
      // TODO: Some little problem here
      console.log("payload", action.payload.days)
      state.availability[action.payload.shift] = [...action.payload.days]
    },
    clearAvailability: (state) => {
      Object.keys(state.availability).forEach((disp: string) => {
        delete state.availability[disp]
      })
    },
    handleLocation: (state, action: PayloadAction<string[]>) => {
        state.locations = action.payload
    }
  }
})

// Action creators are generated for each case reducer function
export const { setMaxHours, setNewAvailabilityDoctor, handleLocation, setMonth, clearState, clearAvailability } = turnoSlice.actions
// Other code such as selectors can use the imported `RootState` type
export const selectListSedi = (state: RootState) => Object.keys(state.turni.locations)

export default turnoSlice.reducer