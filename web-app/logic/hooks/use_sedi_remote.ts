import { useEffect, useState } from "react"
import { capitalizeFirstLetter } from "../local_utilities"
import { setMessageError } from "../redux/settings_slice"
import { useAppDispatch, useAppSelector } from "../redux/store"
import { handleLocation } from "../redux/turni_slice"
import { AppFirebaseError } from "../server/firebase"
import { getInfoSediDistretto } from "../server/firestore/districts"
import { RemoteLocationInfo } from "../server/firestore/firestore"

export default function useLocationsDoctor(distretto: string | undefined): [RemoteLocationInfo | undefined, boolean] {
    const [loading, setLoading] = useState(true)
    //const [error, setError] = useState("")
    const [infoLocations, setInfoLocations] = useState<RemoteLocationInfo>()
    const dispatch = useAppDispatch()
    const predefinedLocationUser = useAppSelector((state) => state.auth.locations)

    const setPredefinedLocations = (remoteSedi: string[]) => {
        if (predefinedLocationUser !== undefined && predefinedLocationUser.length > 0) {
          const normalizedSedi = remoteSedi.map(el => el.toLowerCase())
          const normalizedPredefinedSedi = predefinedLocationUser.map(el => el.toLowerCase())
          const out = normalizedPredefinedSedi.filter(el => normalizedSedi.includes(el)).map(el => capitalizeFirstLetter(el))
          if(out.length > 0) {
            dispatch(handleLocation(out))
          }
        } 
    }
    
    const getInfoSedi = async () => {
        try {
            if (distretto === undefined) {
                dispatch(setMessageError("Nessuna sede trovata"))
                return
            }
            const data: RemoteLocationInfo | undefined = await getInfoSediDistretto(distretto)
            if (data === undefined) {
                dispatch(setMessageError("Nessuna sede trovata"))
                return
            }
            setInfoLocations(data)
            setPredefinedLocations(Object.keys(data.locations))
        } catch(error: unknown) {
          if (error instanceof AppFirebaseError) {
            dispatch(setMessageError(error.message))
          } else {
            dispatch(setMessageError("Errore, riprovare!"))
          }
        } finally {
          setLoading(false)
        }
      }
    
      useEffect(() => {
        /* if (predefinedSediUser.length > 0) { //!: Applicare filtro su queste sedi
          dispatch(handleSede(predefinedSediUser.map(el => capitalizeFirstLetter(el))))
        } */
        getInfoSedi()
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])

      return [infoLocations, loading]
}