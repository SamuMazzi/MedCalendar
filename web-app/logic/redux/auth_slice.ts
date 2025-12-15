import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { getFromStorage, saveToStorage } from '../local_utilities';
import { DoctorInterface } from '../server/firestore/firestore';

export interface StateAuth {
  uid: string,
  /** Districts in which we act as doctors that need to set the availabilities */
  districts: string[],
  /** Districts in which we act as administrators */
  ownedDistricts: string[],
  /** I'd say this is deprecated */
  locations?: string[],
  name: string,
  role: string
  selectedDistrict: string
}

export interface ParamSetUser {
  uid: string,
  data: DoctorInterface
}

/**
 * Gives a more readable role
 * @param user User with that role
 * @returns 
 */
export const getGoodRole = (user: StateAuth) => {
  const role = user.role.toLowerCase()
  if(role.startsWith('titolare')) {
    return 'Titolare'
  } else if (role.startsWith('incaricato')) {
    return 'Incaricato Temporaneo'
  } 
  return user.role
}

const initialUser: StateAuth = getFromStorage('user');

const emptyState: StateAuth = {
  uid: "",
  districts: [],
  ownedDistricts: [],
  locations: [],
  name: "",
  role: "",
  selectedDistrict: ""
}

const initialStateAuth: StateAuth = {
  uid: initialUser?.uid !== undefined ? initialUser.uid : "",
  districts: initialUser?.districts !== undefined ? initialUser.districts : [],
  locations: initialUser?.locations !== undefined ? initialUser.locations : [],
  name: initialUser?.name !== undefined ? initialUser.name : "",
  role: initialUser?.role !== undefined ? initialUser.role : "",
  ownedDistricts: initialUser?.ownedDistricts !== undefined ? initialUser.ownedDistricts : [],
  selectedDistrict: initialUser?.selectedDistrict !== undefined ? initialUser.selectedDistrict : "",
}

export const authSlice = createSlice({
  name: 'auth', 
  initialState: initialStateAuth,
  reducers: {
    setUser: (state, action: PayloadAction<ParamSetUser>) => {
      state.uid = action.payload.uid
      state.name = action.payload.data.name
      state.locations = action.payload.data.locations
      state.role = action.payload.data.role ?? ""
      saveToStorage('user', state)
    },
    setNameUserLocal: (state, action: PayloadAction<string>) => {
      state.name = action.payload
      saveToStorage('user', state)
    },
    setSelectedDistrict: (state, action: PayloadAction<string>) => {
      state.selectedDistrict = action.payload
      saveToStorage('user', state)
    },
    setOwnedDistricts: (state, action: PayloadAction<string[]>) => {
      state.ownedDistricts = [...action.payload]
      saveToStorage('user', state)
    },
    clearUserInfo: (state) => {
      state = {...emptyState} // TODO: Test this
      /* state.name = emptyState.name
      state.uid = emptyState.uid
      state.locations = emptyState.locations
      state.role = emptyState.role
      state.districts = emptyState.districts */
      saveToStorage('user', emptyState)
    }
  }
})

// Action creators are generated for each case reducer function
export const { setUser, setNameUserLocal, setOwnedDistricts, clearUserInfo, setSelectedDistrict } = authSlice.actions

export default authSlice.reducer