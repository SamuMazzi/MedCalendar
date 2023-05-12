import { configureStore } from '@reduxjs/toolkit'
import turnoReducer from './turni_slice'
import authReducer from './auth_slice'
import configurationDistrettoReducer from './configuration_distretto_slice'
import schedulerReducer from './scheduler_slice'
import settingsReducer from './settings_slice'
import mediciAdminReducer from './medici_admin'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'

export const store = configureStore({
  reducer: {
    turni: turnoReducer,
    auth: authReducer,
    configurationDistr: configurationDistrettoReducer,
    scheduler: schedulerReducer,
    settings: settingsReducer,
    mediciAdmin: mediciAdminReducer
  },
  devTools: process.env.NODE_ENV !== 'production',
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

