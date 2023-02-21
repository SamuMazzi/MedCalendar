import { useEffect, useState } from "react"
import { capitalizeFirstLetter } from "../local_utilities"
import { setMessageError } from "../redux/settings_slice"
import { useAppDispatch, useAppSelector } from "../redux/store"
import { handleSede } from "../redux/turni_slice"
import { AppFirebaseError } from "../server/firebase"
import { getInfoSediDistretto } from "../server/firestore/distretti"
import { RemoteSediInfo } from "../server/firestore/firestore"

export default function useSediDoctor(distretto: string | undefined): [RemoteSediInfo | undefined, boolean] {
    const [loading, setLoading] = useState(true)
    //const [error, setError] = useState("")
    const [infoSedi, setInfoSedi] = useState<RemoteSediInfo>()
    const dispatch = useAppDispatch()
    const predefinedSediUser = useAppSelector((state) => state.auth.sedi)

    const setPredefinedSedi = (remoteSedi: string[]) => {
        if (predefinedSediUser.length > 0) {
          const normalizedSedi = remoteSedi.map(el => el.toLowerCase())
          const normalizedPredefinedSedi = predefinedSediUser.map(el => el.toLowerCase())
          const out = normalizedPredefinedSedi.filter(el => normalizedSedi.includes(el)).map(el => capitalizeFirstLetter(el))
          if(out.length > 0) {
            dispatch(handleSede(out))
          }
        } 
    }
    
    const getInfoSedi = async () => {
        try {
            if (distretto === undefined) {
                dispatch(setMessageError("Nessuna sede trovata"))
                return
            }
            const data: RemoteSediInfo | undefined = await getInfoSediDistretto(distretto)
            if (data === undefined) {
                dispatch(setMessageError("Nessuna sede trovata"))
                return
            }
            setInfoSedi(data)
            setPredefinedSedi(Object.keys(data.sedi))
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

      return [infoSedi, loading]
}