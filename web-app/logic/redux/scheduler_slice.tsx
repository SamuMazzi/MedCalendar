import { createSlice } from '@reduxjs/toolkit'
import assert from 'assert'

export interface SchedulerState {
    year: number,
    month: number,
    head: string[],
    turni: Record<string, Record<string, string[]>>, // sede -> data -> [id occupati]
    med_per_turno: Record<string, number>,
    medici_orig: Record<string, InfoMedico>,
    medici_mod: Record<string, InfoMedico>,
}

const initialState: SchedulerState = {
    year: 0,
    month: 0,
    head: [],
    turni: {},
    med_per_turno: {},
    medici_orig: {}, //* Qui ci sarà una copia dei medici
    medici_mod: {} //* Qui verranno fatte le modifiche ai medici, sarà quasi sicuramente necessario creare un reducer per gestire tutte le info   
}

export interface InfoMedico {
    uid: string,
    nome: string,
    ruolo: string,
    disponibilita: string[],
    n_turni_per_soddisfatto: number
}

export const getAllTurni = (formatted_data: SchedulerState) => {
    const list_turni: string[] = []
    Object.keys(formatted_data.turni).forEach((sede: string) => {
        Object.keys(formatted_data.turni[sede]).forEach(turno => !list_turni.includes(turno) ? list_turni.push(turno) : null)
    })
    list_turni.sort()
    return list_turni
}

const insertMedicoInTurno = (state: SchedulerState, sede: string, turno: string, id_med: string) => {
    let medici_in_turno = state.turni[sede][turno]
    if (medici_in_turno === undefined) {
        state.turni[sede][turno] = [id_med] //Testare se si può sostituire con variabile
    } else {
        medici_in_turno.push(id_med)
    }
}

const clearState = (state: SchedulerState) => {
    //state = {...initialState} //* Per un po' tienilo cosi, se va bene togli
    //TODO: Da risolvere sta cosa: non si può dover aggiornare questo metodo per ogni cambiamento al codice
    state.year = initialState.year
    state.month = initialState.month
    state.head = initialState.head
    state.turni = initialState.turni
    state.med_per_turno = initialState.med_per_turno
    state.medici_mod = initialState.medici_mod
    state.medici_orig = initialState.medici_orig
}

const updateNumTurniDisponibiliMedico = (state: SchedulerState, id_med: string | undefined, n: number) => {
    if (id_med === undefined) return
    state.medici_mod[id_med].n_turni_per_soddisfatto += n
}

export const scheduler_slice = createSlice({
    name: 'scheduler_slice',
    initialState: initialState,
    reducers: {
        populateScheduler: (state, action) => {
            //state = {...initialState} // Clear state //! Non funziona, da un sacco di problemi
            clearState(state)
            const input = action.payload
            const sedi_input = input['sedi']
            state.year = input['year']
            state.month = input['month']
            state.medici_orig = input['medici']
            state.medici_mod = JSON.parse(JSON.stringify(input['medici']))
            Object.keys(input['sedi']).forEach((sede: string) => {
                const medici_per_turno = sedi_input[sede]['medici_per_turno']
                state.head = [...state.head, sede]
                state.med_per_turno = {...state.med_per_turno, [sede]: medici_per_turno}
                state.turni = {...state.turni, [sede]: {}}
                Object.keys(sedi_input[sede]['turni']).forEach((turno: string) => {
                    const medici_in_turno: string[] = sedi_input[sede]['turni'][turno];
                    medici_in_turno.forEach((id_med) => {
                        updateNumTurniDisponibiliMedico(state, id_med, -1)
                        insertMedicoInTurno(state, sede, turno, id_med)
                    })
                })
            })
        },
        swapMediciInTurno: (state, action) => {
            const data = action.payload
            assert(!(data.med_in === undefined && data.med_out === undefined), "Almeno uno dei due valori non deve essere undefined")
            const meds_disp = state['turni'][data.sedeSel][data.turnoSel]
            updateNumTurniDisponibiliMedico(state, data.med_in, -1)
            updateNumTurniDisponibiliMedico(state, data.med_out, 1)
            if (data.med_out !== undefined && data.med_in !== undefined) {
                const index = meds_disp.indexOf(data.med_out)
                meds_disp.splice(index, 1)
                meds_disp.push(data.med_in)
            } else if (data.med_in !== undefined) {
                if(!meds_disp) {
                    state['turni'][data.sedeSel][data.turnoSel] = [data.med_in]
                } else {
                    meds_disp.push(data.med_in)
                }
            } else if (data.med_out !== undefined) {
                const index = meds_disp.indexOf(data.med_out)
                meds_disp.splice(index, 1)
            }
        },
        setMeseAndAnno: (state, action) => {
            state.month = action.payload.month ? action.payload.month : state.month
            state.year = action.payload.year ? action.payload.year : state.year
        }
    }
})

// Action creators are generated for each case reducer function
export const { populateScheduler, swapMediciInTurno, setMeseAndAnno } = scheduler_slice.actions

export default scheduler_slice.reducer