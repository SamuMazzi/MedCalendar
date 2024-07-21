import { useEffect, useState } from "react"
import { AppFirebaseError } from "../server/firebase"
import { getConfigurationDistrict, InfoRemoteDistrict } from "../server/firestore/districts"
import { getFromStorage } from "../local_utilities"

export default function useInfoDistrict(distretto: string | undefined): [InfoRemoteDistrict | undefined, string, boolean] {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [infoDistrict, setInfoDistrict] = useState<InfoRemoteDistrict>()
    
    const internalGetConfigurationDistrict = async () => {
        try {
            if (distretto === undefined) {
                setError("Nessuna sede trovata")
                return
            }
            if (getFromStorage("district") !== null) {
                setInfoDistrict(getFromStorage("district"))
                setLoading(false)
                setError("")
                return
            }
            
            const data = await getConfigurationDistrict(distretto)
            if (data === undefined) {
                setError("Nessuna sede trovata")
                return
            }
            setInfoDistrict(data)
        } catch(error: unknown) {
          if (error instanceof AppFirebaseError) {
            setError(error.message)
          } else {
            setError("Errore, riprovare!")
          }
        } finally {
          setLoading(false)
        }
      }
    
      useEffect(() => {
        /* if (predefinedSediUser.length > 0) { //!: Applicare filtro su queste sedi
          dispatch(handleSede(predefinedSediUser.map(el => capitalizeFirstLetter(el))))
        } */
          internalGetConfigurationDistrict()
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])

      return [infoDistrict, error, loading]
}