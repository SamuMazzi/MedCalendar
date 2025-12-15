import { User } from "firebase/auth"
import { clearUserInfo, StateAuth } from "../redux/auth_slice"
import { useAppDispatch, useAppSelector } from "../redux/store"
import { fbAuth, logoutFirebase } from "../server/auth"
import { useEffect, useState } from "react"

export default function useUser(): [StateAuth, string | undefined, () => Promise<void>, User | null, boolean] {
    const authState = useAppSelector(state => state.auth)
    const [fbUser, setFbUser] = useState<User | null>(null)
    const [loadingFb, setLoadingFb] = useState(true)
    const dispatch = useAppDispatch()
  
    const logout = async () => {
      await logoutFirebase()
      dispatch(clearUserInfo())
    };

    useEffect(() => {
      const unsubscribe = fbAuth.onAuthStateChanged((user) => {
        setLoadingFb(true);
        // TODO: Why not dipatching setUser here?
        setFbUser(user);
        if (user) {
          // Get districts' user info
          
        }
        setLoadingFb(false);
      })
      return () => unsubscribe();
    }, [])

    return [authState, authState.selectedDistrict, logout, fbUser, loadingFb]
}