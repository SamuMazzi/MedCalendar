import { createSlice, PayloadAction } from '@reduxjs/toolkit'
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

const insertMedicoInTurno = (state: SchedulerState, sede: string, turno: string, id_med: string) => {
    let medici_in_turno = state['turni'][sede][turno]
    if (medici_in_turno === undefined) {
        state['turni'][sede][turno] = [id_med] //Testare se si può sostituire con variabile
    } else {
        medici_in_turno.push(id_med)
    }
}

const updateNumTurniDisponibiliMedico = (state: SchedulerState, id_med: string | undefined, n: number) => {
    if (id_med === undefined) return
    state['medici_mod'][id_med].n_turni_per_soddisfatto += n
}

export const scheduler_slice = createSlice({
    name: 'scheduler_slice',
    initialState: initialState,
    reducers: {
        clearScheduler: (state) => {
            state = initialState
        },
        populateScheduler: (state, action) => {
            const input = action.payload
            const sedi_input = input['sedi']
            state['year'] = input['year']
            state['month'] = input['month']
            state['medici_orig'] = input['medici']
            state['medici_mod'] = JSON.parse(JSON.stringify(input['medici']))
            Object.keys(input['sedi']).forEach((sede: string) => {
                const medici_per_turno = sedi_input[sede]['medici_per_turno']
                state['head'].push(sede)
                state['med_per_turno'][sede] = medici_per_turno
                state['turni'][sede] = {}
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
            console.log(action.payload)
            assert(!(data.med_in === undefined && data.med_out === undefined), "Almeno uno dei due valori non deve essere undefined")
            const meds_disp = state['turni'][data.sedeSel][data.turnoSel]
            updateNumTurniDisponibiliMedico(state, data.med_in, -1)
            updateNumTurniDisponibiliMedico(state, data.med_out, 1)
            if (data.med_out !== undefined && data.med_in !== undefined) {
                const index = meds_disp.indexOf(data.med_out)
                meds_disp.splice(index, 1)
                meds_disp.push(data.med_in)
            } else if (data.med_in !== undefined) {
                console.log('Pusho')
                meds_disp.push(data.med_in)
            } else if (data.med_out !== undefined) {
                const index = meds_disp.indexOf(data.med_out)
                meds_disp.splice(index, 1)
            }
        },
    }
})

// Action creators are generated for each case reducer function
export const { populateScheduler, swapMediciInTurno, clearScheduler } = scheduler_slice.actions

export default scheduler_slice.reducer