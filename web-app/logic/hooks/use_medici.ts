import { useEffect, useState } from "react"
import { getMedici } from "../local_utilities"
import { MedicoInterface } from "../server/firestore/firestore"

export default function useMedici(): [Record<string, MedicoInterface>, boolean, string] {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [medici, setMedici] = useState<Record<string, MedicoInterface>>({})
    
    const retrieveMedici = async () => {
        try {
            const medici = await getMedici()
            setMedici(medici)
        } catch (e) {
            setError("C'è stato un errore, riprovare")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        retrieveMedici();
    }, [])

      return [medici, loading, error]
}