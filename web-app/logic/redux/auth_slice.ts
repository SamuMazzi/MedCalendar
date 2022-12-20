import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { getFromStorage, saveToStorage } from '../local_storage';

interface StateAuthType {
  admin: boolean,
  id: string,
  distretti: string[]
  nome: string | undefined
}

export interface ParamSetUser {
  id: string,
  data: Record<any, any>
}

const initialUser = getFromStorage('user');
const initialAdmin = getFromStorage('admin');

const initialStateAuth: StateAuthType = {
  admin: initialAdmin !== undefined ? initialAdmin : false,
  id: initialUser?.id !== undefined ? initialUser.id : "",
  distretti: initialUser?.distretti !== undefined ? initialUser.distretti : [],
  nome: initialUser?.nome !== undefined ? initialUser.nome : ""
}

export const authSlice = createSlice({
  name: 'auth', 
  initialState: initialStateAuth,
  reducers: {
    setUser: (state, action: PayloadAction<ParamSetUser>) => {
      state.nome = action.payload.data.nome
      state.id = action.payload.id
      state.distretti = action.payload.data.distretti
      saveToStorage('user', action.payload)
    },
    setAdmin: (state, action: PayloadAction<boolean>) => {
      state.admin = action.payload
      saveToStorage('admin', action.payload)
    },
    setDistrettiAdmin: (state, action: PayloadAction<string[]>) => {
      state.distretti = action.payload
      saveToStorage('distretti_admin', action.payload)
    },
  }
})

// Action creators are generated for each case reducer function
export const { setUser, setAdmin, setDistrettiAdmin } = authSlice.actions

export default authSlice.reducer