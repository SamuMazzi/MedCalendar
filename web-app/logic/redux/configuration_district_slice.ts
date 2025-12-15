import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { DoctorInterface } from '../server/firestore/firestore'
import assert from 'assert'
import { getFromStorage, saveToStorage, uniqueID } from '../local_utilities'

export interface InfoLocation {
    id: string
    name: string
    doctors_for_shift: number
    /** Shift mapped with the weekdays in which it's applied */
    shifts: DistrictShift[]
    extra_shifts?: SingleDistrictShift[]
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

export interface InfoRole {
    label: string
    priority: number
}

interface HoursShift {
    from: string
    to: string
}

export interface DistrictShift extends HoursShift {
    daysOfWeek: number[]
}

export interface SingleDistrictShift extends HoursShift {
    /** Milliseconds since epoch of day */
    date_millis: number
    id_shift: string
}

/**
 * Used for both creating a district and getting from firestore
 */
export interface DistrictState {
    id_district: string
    name: string
    locations: Record<string, InfoLocation>
    owners: string[]
    doctors: Record<string, DoctorInterface> //?
    pricingPlan: PricingPlan
    roles: Record<string, InfoRole>
}

interface ParamModifyLocation {
    id: string,
    name?: string,
    doctors_for_shift?: number,
}

interface ParamSetExtraShift {
    shift: SingleDistrictShift
    locations: string[]
    id: number
}

const initialStateDistrict: DistrictState = getFromStorage('district')

const initialState: DistrictState = {
    id_district: initialStateDistrict?.id_district ?? "",
    name: initialStateDistrict?.name ?? "",
    locations: initialStateDistrict?.locations ?? [],
    doctors: initialStateDistrict?.doctors ?? {},
    roles: initialStateDistrict?.roles ?? [],
    pricingPlan: initialStateDistrict?.pricingPlan ?? 'GM_Base',
    owners: initialStateDistrict?.owners ?? []
}

export const configuration_districts_slice = createSlice({
    name: 'configuration_districts',
    initialState: initialState,
    reducers: {
        addLocationToDistrict: (state, action: PayloadAction<InfoLocation>) => {
            if(Object.values(state.locations).some(location => location.name === action.payload.name)) {
                throw "Nome già utilizzato" //TODO: Creare custom exception
            }
            const newLocation: InfoLocation = action.payload
            state.locations = {...state.locations, [newLocation.id]: newLocation}
            saveToStorage('district', state)
        },
        deleteLocationFromDistrict: (state, action: PayloadAction<string>) => {
            /** Delete location */
            const new_locations = (({ [action.payload]: _, ...o }) => o)(state.locations) // remove b and c
            state.locations = new_locations
            saveToStorage('district', state)
        },
        changeNameLocation: (state, action: PayloadAction<ParamModifyLocation>) => {
            assert(action.payload.name !== undefined, "Name location not defined")
            state.locations[action.payload.id].name = action.payload.name
            saveToStorage('district', state)
        },
        changeNumDoctorsForShiftInLocation: (state, action: PayloadAction<ParamModifyLocation>) => {
            assert(action.payload.doctors_for_shift !== undefined, "Doctors for shift of location not defined")
            state.locations[action.payload.id].doctors_for_shift = action.payload.doctors_for_shift
            saveToStorage('district', state)
        },
        changeShiftDistrict: (state, action: PayloadAction<DistrictShift[]>) => {
            //const index = action.payload.index
            const newShifts = action.payload
            //checkIndex(state.sedi.length, index)
            Object.values(state.locations).forEach((location) => {
                location.shifts = newShifts
            })
            state.locations = {...state.locations}
            saveToStorage('district', state)
        },
        setExtraShift: (state, action: PayloadAction<ParamSetExtraShift>) => {
            const shift = action.payload.shift
            for(const location of action.payload.locations) {
                const newExtraTurni = [...state.locations[location].extra_shifts ?? []]
                const index = state.locations[location].extra_shifts?.findIndex((v) => v.id_shift === action.payload.id.toString())
                if (index !== -1 && index !== undefined) {
                    /** We're modifying an existing shift */
                    newExtraTurni[index] = shift
                } else {
                    /** We're adding a new shift */
                    newExtraTurni.push(shift)
                }
                state.locations[location].extra_shifts = [...newExtraTurni]
            }
            saveToStorage('district', state)
        },
        removeExtraShift: (state, action: PayloadAction<string>) => {
            for(const location of Object.keys(state.locations)) {
                state.locations[location].extra_shifts = state.locations[location].extra_shifts?.filter((v) => v.id_shift === action.payload.toString())
            }
            saveToStorage('district', state)
        },
        setNameDistrictSlice: (state, action: PayloadAction<string>) => {
            state.name = action.payload
            saveToStorage('district', state)
        },
        setRolesDistrictSlice: (state, action: PayloadAction<Record<string, {label: string, priority: number}>>) => {
            state.roles = {...action.payload}
            saveToStorage('district', state)
        },
        setIdDistrictSlice: (state, action: PayloadAction<string>) => {
            state.id_district = action.payload
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
    changeShiftDistrict, setDoctorOfDistrictSlice, changeNumDoctorsForShiftInLocation, setIdDistrictSlice,
    removeDoctorFromDistrictSlice, setPricingPlan, setNameDistrictSlice } = configuration_districts_slice.actions

export default configuration_districts_slice.reducer