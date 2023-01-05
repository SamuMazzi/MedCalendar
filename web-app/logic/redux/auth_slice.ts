import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { getFromStorage, saveToStorage } from '../local_utilities';

interface StateAuth {
  admin: boolean,
  uid: string,
  distretti: string[],
  sedi: string[],
  nome: string | undefined,
  ruolo: string
}

export interface ParamSetUser {
  uid: string,
  data: Record<string, any>
}

export const getGoodRuolo = (user: StateAuth) => {
  const role = user.ruolo.toLowerCase()
  if(role.startsWith('titolare')) {
    return 'Titolare'
  } else if (role.startsWith('incaricato')) {
    return 'Incaricato Temporaneo'
  } 
  return user.ruolo
}

const initialUser = getFromStorage('user');
const initialAdmin = getFromStorage('admin');

const emptyState: StateAuth = {
  admin: false,
  uid: "",
  distretti: [],
  sedi: [],
  nome: "",
  ruolo: ""
}

const initialStateAuth: StateAuth = {
  admin: initialAdmin !== undefined ? initialAdmin : false,
  uid: initialUser?.uid !== undefined ? initialUser.uid : "",
  distretti: initialUser?.distretti !== undefined ? initialUser.distretti : [],
  sedi: initialUser?.sedi !== undefined ? initialUser.sedi : [],
  nome: initialUser?.nome !== undefined ? initialUser.nome : "",
  ruolo: initialUser?.ruolo !== undefined ? initialUser.ruolo : ""
}

export const authSlice = createSlice({
  name: 'auth', 
  initialState: initialStateAuth,
  reducers: {
    setUser: (state, action: PayloadAction<ParamSetUser>) => {
      state.nome = action.payload.data.nome
      state.uid = action.payload.uid
      state.sedi = action.payload.data.sedi
      state.ruolo = action.payload.data.ruolo
      saveToStorage('user', state)
    },
    setAdmin: (state, action: PayloadAction<boolean>) => {
      state.admin = action.payload
      saveToStorage('admin', action.payload)
    },
    setDistrettiAdmin: (state, action: PayloadAction<string[]>) => {
      state.distretti = action.payload
      saveToStorage('distretti_admin', action.payload)
    },
    clearUserAndAdmin: (state) => {
      //state = {...emptyState} Non funziona
      state.nome = emptyState.nome
      state.uid = emptyState.uid
      state.sedi = emptyState.sedi
      state.ruolo = emptyState.ruolo
      state.admin = emptyState.admin
      saveToStorage('user', emptyState)
      saveToStorage('admin', emptyState.admin)
    }
  }
})

// Action creators are generated for each case reducer function
export const { setUser, setAdmin, setDistrettiAdmin, clearUserAndAdmin } = authSlice.actions

export default authSlice.reducer