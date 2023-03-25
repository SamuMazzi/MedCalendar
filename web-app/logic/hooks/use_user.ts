import { clearUserAndAdmin, StateAuth } from "../redux/auth_slice"
import { setDistrettoSlice } from "../redux/settings_slice"
import { useAppDispatch, useAppSelector } from "../redux/store"
import { logoutFirebase } from "../server/auth"

export default function useUser(): [StateAuth, string, () => Promise<void>] {
    const authState = useAppSelector(state => state.auth)
    const distretto = useAppSelector(state => state.settings.distretto)
    const dispatch = useAppDispatch()
  
    const logout = async () => {
      if(authState.admin) {
          await logoutFirebase()
      }
      dispatch(clearUserAndAdmin())
      dispatch(setDistrettoSlice(""))
    };

    return [authState, distretto, logout]
}