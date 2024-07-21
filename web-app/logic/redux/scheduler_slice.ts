import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import assert from 'assert'

export interface SchedulerState {
    year: number,
    month: number,
    head: string[],
    shifts: Record<string, Record<string, string[]>>, // sede -> data -> [id occupati]
    doctors_for_shift: Record<string, number>,
    original_doctors: Record<string, InfoDoctor>,
    mod_doctors: Record<string, InfoDoctor>,
}

export interface SchedulingDataFromAPI {
    locations: Record<string, {
      shifts: Record<string, string[]>  // shift -> [doctor1, doctor2, ...]
      doctors_for_shift: number
    }>,
    doctors: Record<string, any> // doctor -> {id, locations, role, name, max_hours, availability}
    busy_shifts: number,
    tot_shifts: number,
    non_fillable_shifts: number,
    placeable_shifts: number,
    year: number,
    month: number
}

const initialState: SchedulerState = {
    year: 0,
    month: 0,
    head: [],
    shifts: {},
    doctors_for_shift: {},
    original_doctors: {}, //* Qui ci sarà una copia dei medici
    mod_doctors: {} //* Qui verranno fatte le modifiche ai medici, sarà quasi sicuramente necessario creare un reducer per gestire tutte le info   
}

export interface InfoDoctor {
    name: string,
    role: string,
    availability: string[],
    n_turni_per_soddisfatto: number,
    n_shifts_max: number,
    locations: string[]
}

export const getAllShifts = (formatted_data: SchedulerState) => {
    const list_turni: string[] = []
    Object.keys(formatted_data.shifts).forEach((sede: string) => {
        Object.keys(formatted_data.shifts[sede]).forEach(turno => {
            if(!list_turni.includes(turno)) {
                list_turni.push(turno)
            }
        })
    })
    list_turni.sort()
    return list_turni
}

const insertMedicoInTurno = (state: SchedulerState, location: string, shift: string, id_doctor: string) => {
    let medici_in_turno = state.shifts[location][shift]
    if (medici_in_turno === undefined) {
        state.shifts[location][shift] = [id_doctor] //Testare se si può sostituire con variabile
    } else {
        medici_in_turno.push(id_doctor)
    }
}

const clearState = (state: SchedulerState) => {
    //state = {...initialState} //* Per un po' tienilo cosi, se va bene togli
    //TODO: Da risolvere sta cosa: non si può dover aggiornare questo metodo per ogni cambiamento al codice
    state.year = initialState.year
    state.month = initialState.month
    state.head = initialState.head
    state.shifts = initialState.shifts
    state.doctors_for_shift = initialState.doctors_for_shift
    state.mod_doctors = initialState.mod_doctors
    state.original_doctors = initialState.original_doctors
}

const updateNumTurniDisponibiliMedico = (state: SchedulerState, id_med: string | undefined, n: number) => {
    if (id_med === undefined) return
    state.mod_doctors[id_med].n_turni_per_soddisfatto += n
}

export const scheduler_slice = createSlice({
    name: 'scheduler_slice',
    initialState: initialState,
    reducers: {
        populateScheduler: (state, action: PayloadAction<SchedulingDataFromAPI>) => {
            //state = {...initialState} // Clear state //! Non funziona, da un sacco di problemi
            clearState(state)
            const input = action.payload
            const sedi_input = input['locations']
            state.year = input['year']
            state.month = input['month']
            state.original_doctors = input['doctors']
            state.mod_doctors = JSON.parse(JSON.stringify(input['doctors']))
            Object.keys(input['locations']).forEach((location: string) => {
                const doctors_for_shift = sedi_input[location]['doctors_for_shift']
                state.head = [...state.head, location]
                state.doctors_for_shift = {...state.doctors_for_shift, [location]: doctors_for_shift}
                state.shifts = {...state.shifts, [location]: {}}
                Object.keys(sedi_input[location]['shifts']).forEach((turno: string) => {
                    const doctors_in_shift: string[] = sedi_input[location]['shifts'][turno]
                    doctors_in_shift.forEach((id_doctor) => {
                        updateNumTurniDisponibiliMedico(state, id_doctor, -1)
                        insertMedicoInTurno(state, location, turno, id_doctor)
                    })
                })
            })
            //* Serve per mettere i giorni anche in cui non ci sono medici
            Object.keys(input['locations']).forEach((location: string) => {
                Object.keys(sedi_input[location]['shifts']).forEach((turno: string) => {
                    if(state.shifts[location][turno] === undefined)
                        state.shifts[location][turno] = []
                })
            })
        },
        swapMediciInTurno: (state, action) => {
            const data = action.payload
            assert(!(data.med_in === undefined && data.med_out === undefined), "Almeno uno dei due valori non deve essere undefined")
            const meds_disp = state['shifts'][data.sedeSel][data.turnoSel]
            updateNumTurniDisponibiliMedico(state, data.med_in, -1)
            updateNumTurniDisponibiliMedico(state, data.med_out, 1)
            if (data.med_out !== undefined && data.med_in !== undefined) {
                const index = meds_disp.indexOf(data.med_out)
                meds_disp.splice(index, 1)
                meds_disp.push(data.med_in)
            } else if (data.med_in !== undefined) {
                if(!meds_disp) {
                    state['shifts'][data.sedeSel][data.turnoSel] = [data.med_in]
                } else {
                    meds_disp.push(data.med_in)
                }
            } else if (data.med_out !== undefined) {
                const index = meds_disp.indexOf(data.med_out)
                meds_disp.splice(index, 1)
            }
        },
        setMonthAndYear: (state, action: PayloadAction<{month: number, year: number}>) => {
            state.month = action.payload.month ? action.payload.month : state.month
            state.year = action.payload.year ? action.payload.year : state.year
        }
    }
})

// Action creators are generated for each case reducer function
export const { populateScheduler, swapMediciInTurno, setMonthAndYear } = scheduler_slice.actions

export default scheduler_slice.reducer