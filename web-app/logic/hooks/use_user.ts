import { User } from "firebase/auth"
import { clearUserAndAdmin, StateAuth } from "../redux/auth_slice"
import { setDistrettoSlice } from "../redux/settings_slice"
import { useAppDispatch, useAppSelector } from "../redux/store"
import { fbAuth, logoutFirebase } from "../server/auth"
import { useEffect, useState } from "react"

export default function useUser(): [StateAuth, string | undefined, () => Promise<void>, User | null, boolean] {
    const authState = useAppSelector(state => state.auth)
    const distretto = useAppSelector(state => state.settings.distretto)
    const [fbUser, setFbUser] = useState<User | null>(null)
    const [loadingFb, setLoadingFb] = useState(true)
    const dispatch = useAppDispatch()
  
    const logout = async () => {
      await logoutFirebase()      
      dispatch(clearUserAndAdmin())
      dispatch(setDistrettoSlice(""))
    };

    useEffect(() => {
      const unsubscribe = fbAuth.onAuthStateChanged((user) => {
        setLoadingFb(true);
        setFbUser(user);
        setLoadingFb(false);
      })
      return () => unsubscribe();
    }, [])

    return [authState, distretto, logout, fbUser, loadingFb]
}