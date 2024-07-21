import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { DoctorInterface } from '../server/firestore/firestore'
import assert from 'assert'
import { getFromStorage, saveToStorage } from '../local_utilities'

interface Location {
    name: string,
    doctors_for_shift: number,
}

export type PricingPlan = 'GM_Base' | 'Contattaci'

export const InfoPricingPlan: Record<PricingPlan, any> = {
    GM_Base: {
        name: 'Guardia medica (Base)',
        price: 50
    },
    Contattaci: {
        name: 'Contattaci',
        reason: 'mock'
    }
}

interface HoursShift {
    from: string
    to: string
}

export interface DistrictShift extends HoursShift {
    daysOfWeek: number[]
}

export interface SingleDistrictShift extends HoursShift {
    date_millis: number //* Milliseconds since epoch of day
}

/**
 * Used for both creating a district and getting from firestore
 */
export interface DistrictState {
    name: string,
    locations: Location[],
    shifts: DistrictShift[],
    doctors: Record<string, DoctorInterface> //?
    extraShifts?: SingleDistrictShift[]
    pricingPlan: PricingPlan
    owners: string[]
    roles: string[]
    // modifiche?: Record<string, string> //* Ancora da definire
}

export interface ParamLocation {
    index: number,
    name: string,
    doctors_for_shift: number,
}

interface ParamModifyLocation {
    index: number,
    name?: string,
    doctors_for_shift?: number,
}

interface ParamSetExtraShift {
    shift: SingleDistrictShift
    index?: number
}

const initialStateDistrict: DistrictState = getFromStorage('district')

const initialState: DistrictState = {
    name: initialStateDistrict?.name ?? "",
    locations: initialStateDistrict?.locations ?? [],
    doctors: initialStateDistrict?.doctors ?? {},
    shifts: initialStateDistrict?.shifts ?? [],
    roles: initialStateDistrict?.roles ?? [],
    pricingPlan: initialStateDistrict?.pricingPlan ?? 'GM_Base',
    owners: initialStateDistrict?.owners ?? []
}

const checkIndex = (lenLocations: number, index: number) => {
    if(lenLocations - 1 < index) {
        throw "Errore nel trovare la sede"
    }
}

export const configuration_districts_slice = createSlice({
    name: 'configuration_districts',
    initialState: initialState,
    reducers: {
        addLocationToDistrict: (state, action: PayloadAction<ParamLocation>) => {
            if(state.locations.some(location => location.name === action.payload.name)) {
                throw "Nome già utilizzato" //TODO: Creare custom exception
            }
            const newSede: Location = {
                name: action.payload.name,
                doctors_for_shift: action.payload.doctors_for_shift,
            }
            state.locations = [...state.locations, newSede]
            saveToStorage('district', state)
        },
        deleteLocationFromDistrict: (state, action: PayloadAction<number>) => {
            const index = action.payload
            state.locations = state.locations!.filter((v, i) => i !== index)
            saveToStorage('district', state)
        },
        changeNameLocation: (state, action: PayloadAction<ParamModifyLocation>) => {
            assert(action.payload.name !== undefined, "Name location not defined")
            const index = action.payload.index
            checkIndex(state.locations.length, index)
            state.locations[index].name = action.payload.name
            saveToStorage('district', state)
        },
        changeNumDoctorsForShiftInLocation: (state, action: PayloadAction<ParamModifyLocation>) => {
            assert(action.payload.doctors_for_shift !== undefined, "Doctors for shift of location not defined")
            const index = action.payload.index
            checkIndex(state.locations.length, index)
            state.locations[index].doctors_for_shift = action.payload.doctors_for_shift
            saveToStorage('district', state)
        },
        changeShiftDistrict: (state, action: PayloadAction<DistrictShift[]>) => {
            //const index = action.payload.index
            const newShifts = action.payload
            //checkIndex(state.sedi.length, index)
            state.shifts = [...newShifts]
            saveToStorage('district', state)
        },
        setExtraShift: (state, action: PayloadAction<ParamSetExtraShift>) => {
            const turno = action.payload.shift
            const index = action.payload.index
            if (index) {
                const newExtraTurni = [...state.extraShifts!]
                newExtraTurni[index] = turno
                state.extraShifts = [...newExtraTurni]
            }
            if (state.extraShifts) {
                state.extraShifts = [...state.extraShifts, turno]
            } else {
                state.extraShifts = [turno]
            }
            saveToStorage('district', state)
        },
        removeExtraShift: (state, action: PayloadAction<number>) => {
            const index = action.payload
            state.extraShifts = state.extraShifts!.filter((v, i) => i !== index)
            saveToStorage('district', state)
        },
        setNameDistrictSlice: (state, action: PayloadAction<string>) => {
            state.name = action.payload
            saveToStorage('district', state)
        },
        setRolesDistrictSlice: (state, action: PayloadAction<string[]>) => {
            state.roles = [...action.payload]
            saveToStorage('district', state)
        },
        setDoctorOfDistrictSlice: (state, action: PayloadAction<DoctorInterface>) => {
            const medico = action.payload
            const id_doc = medico.email
            state.doctors = {...state.doctors, [id_doc]: medico}
            saveToStorage('district', state)
        },
        removeDoctorFromDistrictSlice: (state, action: PayloadAction<string>) => {
            const id_doc = action.payload
            const { [id_doc]: _, ...others} = state.doctors
            state.doctors = others
            saveToStorage('district', state)
        },
        setPricingPlan: (state, action: PayloadAction<PricingPlan>) => {
            state.pricingPlan = action.payload
            saveToStorage('district', state)
        }
    }
})

// Action creators are generated for each case reducer function
export const { addLocationToDistrict, deleteLocationFromDistrict, changeNameLocation, setRolesDistrictSlice,
    changeShiftDistrict, setDoctorOfDistrictSlice, changeNumDoctorsForShiftInLocation,
    removeDoctorFromDistrictSlice, setPricingPlan, setNameDistrictSlice } = configuration_districts_slice.actions

export default configuration_districts_slice.reducer