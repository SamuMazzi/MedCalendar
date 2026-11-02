import { AppFirebaseError, firebaseApp } from "../firebase";
import { getFirestore, doc, setDoc, getDoc, Timestamp, connectFirestoreEmulator } from 'firebase/firestore';
import { getFromStorage, getNumOreMaxByRole } from "../../local_utilities";
import { DistrictState } from "../../redux/configuration_district_slice";

export const firestore = getFirestore(firebaseApp);
if(process.env.NODE_ENV === 'test') {
    connectFirestoreEmulator(firestore, 'localhost', 8080);
}

export const firestore_usersKey = "users"
export const firestore_infoCollectionKey = 'info'
export const firestore_infoMediciKey = 'info_doctors'
export const firestore_infoSediKey = 'info_locations'
export const firestore_listaMediciKey = 'list_doctors' //TODO: Capire perchè serve questa voce, si potrebbe fare filter su users, ma forse diventa complicato/costoso
export const firestore_distrettiCollectionKey = 'districts'
export const firestore_disponibilitaSedeKey = 'availability'
export const firestore_configDefinitivaDistrettoKey = 'shifts_month'
export const firestore_lastTimeModifyInfoDoctorsKey = 'lastTimeModifyDoctors'
export const firestore_nomeMedicoKey = 'name'
export const firestore_ruoloMedicoKey = 'role'
export const firestore_oreMaxMedicoKey = 'shifts_max'
export const firestore_uidMedicoKey = 'uid'
export const firestore_sediMedicoKey = 'locations'

export function handleFirebaseError(error: any) {
    if ('name' in error && error.name === 'FirebaseError') {
        throw new AppFirebaseError({ code: error.code, type: 'firestore' })
    } else throw error
}

export function getKeyMonth(date: Date) {
    const firestoreKeyMonth = date.getFullYear() + "-" + (date.getMonth() + 1) //* Fondamentali le parentesi!
    return firestoreKeyMonth
}

export function getFirestoreDocInfoSedi(distretto: string) {
    const docInfoSedi = doc(firestore, firestore_distrettiCollectionKey, distretto, firestore_infoCollectionKey, firestore_infoSediKey)
    return docInfoSedi
}

export function getFirestoreDocInfoMedici(distretto: string) {
    const docInfoMedici = doc(firestore, firestore_distrettiCollectionKey, distretto, firestore_infoCollectionKey, firestore_infoMediciKey)
    return docInfoMedici
}

//TODO: Crea test
export const shouldLoadOnlineMedici = async (distretto: string) => {
    const dataInfoDistretto = await getDoc(doc(firestore, firestore_distrettiCollectionKey, distretto))
    const serverLastTime: Timestamp | undefined = dataInfoDistretto.get(firestore_lastTimeModifyInfoDoctorsKey)
    const localLastTime: number | null = getFromStorage('lastTimeModifyDoctors')
    if (serverLastTime === undefined || localLastTime === null || Timestamp.fromMillis(localLastTime) < serverLastTime) {
        return true
    }
    return false
}

export interface DoctorInterface {
    /** Name and possibly surname of the user */
    name: string,
    /** Role of the doctor, useful only for scheduling. */
    role: string,
    /** Locations available for the user, actually nothing vital 
     * but useful for a better UX of the user when choosing availabilities for scheduling */
    locations?: string[],
    /** Email of the user, which is, so far, the key of the database */
    email: string,
    /** IDs of the locations owned by the user */
    owner_locations?: string[]
}

export const getAllDoctorsServer = async (district: string) => {
    const tmpDoctors: Record<string, DoctorInterface> = {}
    try {
        const docDoctors = getFirestoreDocInfoMedici(district)
        const res = await getDoc(docDoctors);
        const dataMedici: any = res.exists() ? res.data() : {}
        Object.keys(dataMedici).forEach((uid: string) => {
            const singleMedico = dataMedici[uid];
            tmpDoctors[uid] = {
                name: singleMedico.name ?? singleMedico.Nome + ' ' + singleMedico.Cognome, //legacy
                role: singleMedico.role,
                email: singleMedico.email ?? singleMedico.Email, //legacy
                locations: singleMedico.locations
            }
        });
    } catch (error: unknown) {
        handleFirebaseError(error)
    }
    return tmpDoctors;
}

export const setInfoDoctor = async (distretto: string, id_medico: string, nome: string, ruolo: string) => {
    try {
        await setDoc(getFirestoreDocInfoMedici(distretto), {
            [id_medico]: {
                [firestore_nomeMedicoKey]: nome,
                [firestore_ruoloMedicoKey]: ruolo,
                [firestore_oreMaxMedicoKey]: getNumOreMaxByRole(ruolo)
            }
        }, { merge: true })
    } catch (error: unknown) {
        handleFirebaseError(error)
    }
}

// doc.data() is never undefined for query doc snapshots (official documentation)

interface RemoteInfoSingleLocation {
    doctors_for_shift: number
}
export interface RemoteLocationInfo {
    locations: Record<string, RemoteInfoSingleLocation>
    shifts: Record<string, string>
    specialDays?: Timestamp[]
}

/**
 * @param district
 * @param year 
 * @param month Numero compreso tra 0 e 11
 * @returns 
 */ 
export const getDisponibilitaMeseDistretto = async (distretto: string, year: number, month: number) => {
    try {
        const distrettoDispRef = doc(firestore, firestore_distrettiCollectionKey, distretto, firestore_disponibilitaSedeKey, getKeyMonth(new Date(year, month, 3)));
        const snap = await getDoc(distrettoDispRef);
        return snap.data();
    } catch (error: unknown) {
        handleFirebaseError(error)
    }
}

export const uploadConfigurationDistrict = async (district: DistrictState, uid: string) => {
    const districtRef = doc(firestore, firestore_distrettiCollectionKey, district.name)
    await setDoc(districtRef, {
        admins: [uid],
        owners: [uid],
        name: district.name,
        locations: district.locations.map((l) => l.name),
        doctors: Object.keys(district.doctors),
        roles: Object.fromEntries(district.roles.map((r) => [r, r])),
        [firestore_lastTimeModifyInfoDoctorsKey]: Timestamp.now() 
    })
    // infoDistrict maybe?
    const infoLocations: Record<string, any> = {
        locations: {},
        special_days: [],
        shifts: {}
    }
    for(const location of district.locations) {
        infoLocations['locations'][location.name] = { doctors_for_shift: location.doctors_for_shift }
    }
    if(district.extraShifts) {
        //TODO: Check che timestamp non modifichi con fuso orario
        infoLocations['special_days'] = district.extraShifts.map((t) => Timestamp.fromMillis(t.date_millis))
    }
    for(const t of district.shifts) {
        const fascia = t.from + '-' + t.to
        infoLocations['shifts'][fascia] = t.daysOfWeek.join(',')
    }
    const infoSediRef = doc(firestore, districtRef.path, 'info', 'info_locations')
    await setDoc(infoSediRef, infoLocations)
    const infoMedici: Record<string, any> = {}
    for (const id_doc of Object.keys(district.doctors)) {
        const doc = district.doctors[id_doc]
        infoMedici[id_doc] = doc
    }
    await setDoc(doc(firestore, districtRef.path, firestore_infoCollectionKey, firestore_infoMediciKey), infoMedici)
    await setDoc(doc(firestore, districtRef.path, firestore_infoCollectionKey, firestore_listaMediciKey), { list: Object.keys(infoMedici) })
}