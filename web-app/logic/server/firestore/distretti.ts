import { StateTurno } from "../../redux/turni_slice";
import { SchedulerState } from "../../redux/scheduler_slice";
import { setDoc, doc, arrayRemove, arrayUnion, serverTimestamp, collection, getDocs, query, collectionGroup, where, getDoc, Timestamp } from "firebase/firestore";
import { getLocalLastOreMaxSet } from "../../local_utilities";
import { getKeyMese, firestore, handleFirebaseError, RemoteSediInfo, getFirestoreDocInfoSedi, getFirestoreDocInfoMedici, firestore_configDefinitivaDistrettoKey, firestore_disponibilitaSedeKey, firestore_distrettiCollectionKey, firestore_infoCollectionKey, firestore_oreMaxMedicoKey, firestore_sediMedicoKey, getDisponibilitaMeseDistretto } from "./firestore";

/**
 * 
 * @param mese Data del giorno 3 del mese designato
 * @param distretto Distretto per firestore
 * @param sedi Ancora da definire bene
 */
export const setConfigurationDistrettoMese = async (mese: Date, distretto: string, sedi: any[]) => {
    const firestoreKeyMese = getKeyMese(mese)
    const out: Record<any, any> = {}
    sedi.forEach(val => {
        out[val.nome] = {
            medici_per_turno: val.medici_per_turno,
            turni: val.fasce_turno
        }
    })
    try {
        await setDoc(getFirestoreDocInfoSedi(distretto), {
            [firestoreKeyMese]: out,
        })
    } catch (error: unknown) {
        handleFirebaseError(error)
    }
}

export const setDisponibilitaMeseMedico = async (distretto: string, id: string, info: StateTurno) => {  
    const key_mese = getKeyMese(new Date(info.timestamp_mese!))
    const data: Record<string, any> = {}
    Object.keys(info.disponibilita).forEach((turno) => {
        info.disponibilita[turno].forEach(giorno => data[giorno] = { [turno]: arrayUnion(id) })
    })
    const futures = []

    try {
        futures.push(setDoc(doc(firestore, firestore_distrettiCollectionKey, distretto, firestore_disponibilitaSedeKey, key_mese), data, { merge: true }));
        const lastOreMaxSet = getLocalLastOreMaxSet()
        //if (lastOreMaxSet === null || lastOreMaxSet !== info.oreMassime) { //TODO: Aggiungi logica di cache anche per sedi
            futures.push(setDoc(getFirestoreDocInfoMedici(distretto), { 
                [id]: {
                    [firestore_oreMaxMedicoKey]: info.oreMassime,
                    [firestore_sediMedicoKey]: info.sedi
                } 
            }, { merge: true }));
        //}
        await Promise.all(futures)
    } catch (error: unknown) {
        handleFirebaseError(error)
    }
}

export const uploadConfigurazioneMediciDistretto = async (distretto: string, info: SchedulerState) => {
    const key_mese = getKeyMese(new Date(info.year, info.month, 3))
    const data: Record<string, any> = {
        'create_at': serverTimestamp(),
        'turni': info.turni,
        'medici': info.medici_mod
    }
    try {
        await setDoc(doc(firestore, firestore_distrettiCollectionKey, distretto, firestore_configDefinitivaDistrettoKey, key_mese), data);
    } catch (error: unknown) {
        //console.log(error)
        handleFirebaseError(error)
    }
}


export const getAllDistretti = async () => {
    try {
        const collectionDistrettiRef = collection(firestore, firestore_distrettiCollectionKey);
        const querySnapshot = await getDocs(collectionDistrettiRef);
        const outList = querySnapshot.docs.map((doc) => doc.id)
        return outList;
    } catch (error: unknown) {
        handleFirebaseError(error)
    }
}

export const getDistrettiForMedico = async (id: string) => {
    try {
        const queryDistretti = query(collectionGroup(firestore, firestore_infoCollectionKey), where('list', "array-contains", id));
        const querySnapshot = await getDocs(queryDistretti);
        const outList = querySnapshot.docs.map((doc) => {
            const firstSlash = doc.ref.path.indexOf("/", 1)
            const secondSlash = doc.ref.path.indexOf("/", firstSlash+1)
            const distretto = doc.ref.path.substring(firstSlash+1, secondSlash)
            return distretto
        })
        return outList;
    } catch (error: unknown) {
        handleFirebaseError(error)
    }
}

export const getDistrettiForAdmin = async (id: string) => {
    try {
        const collectionDistrettiRef = collection(firestore, firestore_distrettiCollectionKey);
        const q = query(collectionDistrettiRef, where("admins", "array-contains", id));
        const querySnapshot = await getDocs(q);
        const outList = querySnapshot.docs.map((doc) => doc.id)
        return outList;
    } catch (error: unknown) {
        handleFirebaseError(error)
    }
}

export const getInfoMediciDistretto = async (distretto: string) => {
    try {
        const distrettoInfoRef = getFirestoreDocInfoMedici(distretto);
        const snap = await getDoc(distrettoInfoRef);
        return snap.data();
    } catch (error: unknown) {
        handleFirebaseError(error)
    }
}

export const getInfoSediDistretto = async (distretto: string) => {
    try {
        const infoSediRef = getFirestoreDocInfoSedi(distretto)
        const snap = await getDoc(infoSediRef);
        const out: RemoteSediInfo = {
            sedi: snap.get('sedi'),
            turni: snap.get('turni'),
            specialDays: snap.get('special_days')
        }
        return out
    } catch (error: any) {
        handleFirebaseError(error)
    }
}

export const getSpecialTurniServer = async (distretto: string) => {
    const docInfoSedi = getFirestoreDocInfoSedi(distretto)
    try {
        const out: undefined | Timestamp[] = (await getDoc(docInfoSedi)).get('special_days')
        return out?.map(v => v.toDate())
    } catch (error: unknown) {
        handleFirebaseError(error)
    }
}

export const addSpecialTurnoServer = async (date_with_turno: Date, distretto: string) => {
    const docInfoSedi = getFirestoreDocInfoSedi(distretto)
    try {
        setDoc(docInfoSedi, { 'special_days': arrayUnion(Timestamp.fromDate(date_with_turno)) }, { merge: true })
    } catch (error: unknown) {
        handleFirebaseError(error)
    }
}

export const removeSpecialTurnoServer = async (date_with_turno: Date, distretto: string) => {
    const docInfoSedi = getFirestoreDocInfoSedi(distretto)
    try {
        setDoc(docInfoSedi, { 'special_days': arrayRemove(Timestamp.fromDate(date_with_turno)) }, { merge: true })
    } catch (error: unknown) {
        handleFirebaseError(error)
    }
}

/**
 * @param distretto 
 * @param anno 
 * @param mese Numero compreso tra 0 e 11
 * @returns 
 */ 
export const getDataDistrettoToSendAPI = async (distretto: string, anno: number, mese: number) => {
    try {
        const infoMedici = await getInfoMediciDistretto(distretto)
        const infoSedi = (await getInfoSediDistretto(distretto))!
        const disponibilitaDoctors = await getDisponibilitaMeseDistretto(distretto, anno, mese)
        const mod_infoSedi = []
        for (let sede of Object.keys(infoSedi.sedi)) {
            const out: Record<string, any> = {}
            out['nome'] = sede
            out['medici_per_turno'] = infoSedi.sedi[sede].medici_per_turno
            out['fasce_turno'] = infoSedi.turni
            mod_infoSedi.push(out)
        }
        const docs = []
        for (let doctor of Object.keys(infoMedici!)) {
            const outDoc: Record<string, any> = {}
            const infoDoc = infoMedici![doctor]
            outDoc['id'] = infoDoc['uid']
            outDoc['sedi'] = infoDoc['sedi']
            outDoc['ruolo'] = infoDoc['ruolo']
            outDoc['nome'] = infoDoc['Nome'] + ' ' + infoDoc['Cognome']
            outDoc['ore_max'] = infoDoc['ore_max']
            const dispDoc: Record<string, number[]> = {}
            for (const disp_giorno of Object.keys(disponibilitaDoctors!)) {
                const turni_docs: Record<string, string[]> = disponibilitaDoctors![disp_giorno]
                for (const turno of Object.keys(turni_docs)) {
                    if (turni_docs[turno].includes(outDoc['id'])) {
                        if(!dispDoc[turno]) {
                            dispDoc[turno] = [parseInt(disp_giorno)]
                        } else {
                            dispDoc[turno].push(parseInt(disp_giorno))
                        }
                        continue
                    }
                }
            }
            outDoc['disponibilita'] = dispDoc
            docs.push(outDoc)
        }
        const final_out = {
            'year': anno,
            'month': mese,
            'sedi': mod_infoSedi,
            'medici': docs
        }
        return final_out
    } catch (error: unknown) {
        handleFirebaseError(error)
    }
}
