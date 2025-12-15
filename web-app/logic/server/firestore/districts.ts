import { StateShift } from "../../redux/turni_slice";
import { SchedulerState } from "../../redux/scheduler_slice";
import { setDoc, doc, arrayRemove, arrayUnion, serverTimestamp, collection, getDocs, query, collectionGroup, where, getDoc, Timestamp, FieldValue } from "firebase/firestore";
import { getLocalLastOreMaxSet } from "../../local_utilities";
import { getKeyMonth, firestore, handleFirebaseError, RemoteLocationInfo, getFirestoreDocInfoSedi, getFirestoreDocInfoMedici, firestore_configDefinitivaDistrettoKey, 
    firestore_disponibilitaSedeKey, firestore_distrettiCollectionKey, firestore_infoCollectionKey, firestore_oreMaxMedicoKey, firestore_sediMedicoKey, getDisponibilitaMeseDistretto } from "./firestore";
import { InfoLocation, InfoRole, PricingPlan } from "../../redux/configuration_district_slice";

/** WARNING: Pay attention to use this only where it's needed
 * and use also `DistrictState` in redux
 */
export interface InfoRemoteDistrict {
    name: string
    /** Oppure qua solo string[] degli id da fetchare in un'altra collezione */
    locations: Record<string, InfoLocation>
    owners: string[]
    /** Only the IDs of the doctors, 
     * we don't want to put too much stuff in the main document */
    doctors: string[]
    pricingPlan: PricingPlan
    roles: Record<string, InfoRole>

    last_modification: FieldValue
    create_at: FieldValue
}

/**
 * 
 * @param month Data del giorno 3 del mese designato
 * @param district Distretto per firestore
 * @param locations Ancora da definire bene
 */
export const setMonthConfigurationDistrict = async (month: Date, district: string, locations: any[]) => {
    const firestoreKeyMese = getKeyMonth(month)
    const out: Record<string, any> = {}
    locations.forEach(val => {
        out[val.name] = {
            doctors_for_shifts: val.doctors_for_shifts,
            shifts: val.shifts
        }
    })
    try {
        await setDoc(getFirestoreDocInfoSedi(district), {
            [firestoreKeyMese]: out,
        })
    } catch (error: unknown) {
        handleFirebaseError(error)
    }
}

export const setAvailabilityMonthDoctor = async (distretto: string, id: string, info: StateShift) => {  
    const key_mese = getKeyMonth(new Date(info.timestamp_month!))
    const data: Record<string, any> = {}
    Object.keys(info.availability).forEach((shift) => {
        info.availability[shift].forEach(day => data[day] = { [shift]: arrayUnion(id) })
    })
    const futures = []

    try {
        futures.push(setDoc(doc(firestore, firestore_distrettiCollectionKey, distretto, firestore_disponibilitaSedeKey, key_mese), data, { merge: true }));
        const lastOreMaxSet = getLocalLastOreMaxSet()
        //if (lastOreMaxSet === null || lastOreMaxSet !== info.oreMassime) { //TODO: Aggiungi logica di cache anche per sedi
            futures.push(setDoc(getFirestoreDocInfoMedici(distretto), { 
                [id]: {
                    [firestore_oreMaxMedicoKey]: info.max_hours,
                    [firestore_sediMedicoKey]: info.locations
                } 
            }, { merge: true }));
        //}
        await Promise.all(futures)
    } catch (error: unknown) {
        handleFirebaseError(error)
    }
}

/**
 * Scheduling that'll be uploaded to the server for the corresponding district in the specified month
 */
export const uploadSchedulingDoctors = async (distric: string, info: SchedulerState) => {
    const key_mese = getKeyMonth(new Date(info.year, info.month, 3))
    const data: Record<string, any> = {
        'create_at': serverTimestamp(),
        'shifts': info.shifts,
        'doctors': info.mod_doctors,
    }
    try {
        await setDoc(doc(firestore, firestore_distrettiCollectionKey, distric, firestore_configDefinitivaDistrettoKey, key_mese), data);
    } catch (error: unknown) {
        //console.log(error)
        handleFirebaseError(error)
    }
}

/**
 * Get all the info regarding the district
 * @param distric 
 * @param info 
 */
export const getConfigurationDistrict = async (distric: string) => {
    try {
        const snap = await getDoc(doc(firestore, firestore_distrettiCollectionKey, distric));
        return snap.data() as InfoRemoteDistrict
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
    return []
}

export const getDistrettiForMedico = async (id: string) => {
    // TODO: Probabilmente è meglio cambiare logica qui, controllando la lista del singolo utente, in cui si vede in quali distretti è abilitato
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

/**
 * Fetch from the database all the districts owned by the user
 * @param id ID of the owner
 * @returns 
 */
export const fetchDistrictsOwnedByUser = async (id: string) => {
    try {
        const collectionDistrettiRef = collection(firestore, firestore_distrettiCollectionKey);
        const q = query(collectionDistrettiRef, where("owners", "array-contains", id));
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
        const out: RemoteLocationInfo = {
            locations: snap.get('locations'),
            shifts: snap.get('shifts'),
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
        const out: Timestamp[] = (await getDoc(docInfoSedi)).get('special_days') || []
        console.log(out)
        return out.map(v => v.toDate())
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
        for (const location of Object.keys(infoSedi.locations)) {
            const out: Record<string, any> = {}
            out['name'] = location
            out['doctors_for_shift'] = infoSedi.locations[location].doctors_for_shift
            out['shifts'] = infoSedi.shifts
            mod_infoSedi.push(out)
        }
        const docs = []
        for (let doctor of Object.keys(infoMedici!)) {
            const outDoc: Record<string, any> = {}
            const infoDoc = infoMedici![doctor]
            outDoc['id'] = infoDoc['uid']
            outDoc['locations'] = infoDoc['locations']
            outDoc['role'] = infoDoc['role']
            outDoc['name'] = infoDoc['name']
            outDoc['max_hours'] = infoDoc['max_hours']
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
            outDoc['availability'] = dispDoc
            docs.push(outDoc)
        }
        const final_out = {
            'year': anno,
            'month': mese,
            'locations': mod_infoSedi,
            'doctors': docs
        }
        return final_out
    } catch (error: unknown) {
        handleFirebaseError(error)
    }
}
