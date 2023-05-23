import { AppFirebaseError, firebaseApp } from "../firebase";
import { getFirestore, doc, setDoc, getDoc, Timestamp, connectFirestoreEmulator } from 'firebase/firestore';
import { getFromStorage, getNumOreMaxByRole } from "../../local_utilities";
import { StateDistretto } from "../../redux/configuration_distretto_slice";

export const firestore = getFirestore(firebaseApp);
if(process.env.NODE_ENV === 'test') {
    connectFirestoreEmulator(firestore, 'localhost', 8080);
}

export const firestore_usersKey = "users"
export const firestore_infoCollectionKey = 'info'
export const firestore_infoMediciKey = 'info_medici'
export const firestore_infoSediKey = 'info_sedi'
export const firestore_listaMediciKey = 'list_medici' //TODO: Capire perchè serve questa voce, si potrebbe fare filter su users, ma forse diventa complicato/costoso
export const firestore_distrettiCollectionKey = 'distretti'
export const firestore_disponibilitaSedeKey = 'disponibilita'
export const firestore_configDefinitivaDistrettoKey = 'turni_mese'
export const firestore_lastTimeModifyInfoDoctorsKey = 'lastTimeModifyDoctors'
export const firestore_nomeMedicoKey = 'nome'
export const firestore_ruoloMedicoKey = 'ruolo'
export const firestore_oreMaxMedicoKey = 'ore_max'
export const firestore_uidMedicoKey = 'uid'
export const firestore_sediMedicoKey = 'sedi'

export function handleFirebaseError(error: any) {
    if ('name' in error && error.name === 'FirebaseError') {
        throw new AppFirebaseError({ code: error.code, type: 'firestore' })
    } else throw error
}

export function getKeyMese(date: Date) {
    const firestoreKeyMese = date.getFullYear() + "-" + (date.getMonth() + 1) //* Fondamentali le parentesi!
    return firestoreKeyMese
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
export const shouldLoadOnlineMedici = async () => {
    const dataInfoDistrettoSassuolo = await getDoc(doc(firestore, firestore_distrettiCollectionKey, 'Sassuolo'))
    const serverLastTime: Timestamp | undefined = dataInfoDistrettoSassuolo.get(firestore_lastTimeModifyInfoDoctorsKey)
    const localLastTime: number | null = getFromStorage('lastTimeModifyDoctors')
    if (serverLastTime === undefined || localLastTime === null || Timestamp.fromMillis(localLastTime) < serverLastTime) {
        return true
    }
    return false
}

export interface MedicoInterface {
    nome: string,
    ruolo: string,
    sedi: string[],
    email: string
}

/**
 * Per evitare troppe letture, finchè siamo sul distretto di Sassuolo teniamo la lettura specifica dei medici di quel distretto
 * @returns 
 */
export const getAllMediciServer = async (distretto: string) => {
    const tmpMedici: Record<string, MedicoInterface> = {}
    try {
        const docMediciSassuolo = getFirestoreDocInfoMedici(distretto)
        const res = await getDoc(docMediciSassuolo);
        const dataMedici: any = res.data()
        Object.keys(dataMedici).forEach((uid: string) => {
            const singleMedico = dataMedici[uid];
            tmpMedici[uid] = {
                nome: singleMedico.nome ?? singleMedico.Nome + ' ' + singleMedico.Cognome, //legacy
                ruolo: singleMedico.ruolo,
                email: singleMedico.email ?? singleMedico.Email, //legacy
                sedi: singleMedico.sedi
            }
        });
    } catch (error: unknown) {
        handleFirebaseError(error)
    }
    return tmpMedici;
}

export const setInfoMedico = async (distretto: string, id_medico: string, nome: string, ruolo: string) => {
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

interface RemoteInfoSingleSede {
    medici_per_turno: number
}
export interface RemoteSediInfo {
    sedi: Record<string, RemoteInfoSingleSede>
    turni: Record<string, string>
    specialDays?: Timestamp[]
}

/**
 * @param distretto 
 * @param anno 
 * @param mese Numero compreso tra 0 e 11
 * @returns 
 */ 
export const getDisponibilitaMeseDistretto = async (distretto: string, anno: number, mese: number) => {
    try {
        const distrettoDispRef = doc(firestore, firestore_distrettiCollectionKey, distretto, firestore_disponibilitaSedeKey, getKeyMese(new Date(anno, mese, 3)));
        const snap = await getDoc(distrettoDispRef);
        return snap.data();
    } catch (error: unknown) {
        handleFirebaseError(error)
    }
}

export const uploadConfigurationDistretto = async (distretto: StateDistretto, uid: string) => {
    const distrettoRef = doc(firestore, firestore_distrettiCollectionKey, distretto.name)
    await setDoc(distrettoRef, {
        admins: [uid],
        password: distretto.password,
        [firestore_lastTimeModifyInfoDoctorsKey]: Timestamp.now() 
    })
    const infoSedi: Record<string, any> = {
        sedi: {},
        special_days: {},
        turni: {}
    }
    for(const sede of distretto.sedi) {
        infoSedi['sedi'][sede.nome] = { medici_per_turno: sede.medici_per_turno }
    }
    if(distretto.extraTurni) {
        //TODO: Check che timestamp non modifichi con fuso orario
        infoSedi['special_days'] = distretto.extraTurni.map((t) => Timestamp.fromMillis(t.date_millis))
    }
    for(const t of distretto.turni) {
        const fascia = t.from + '-' + t.to
        infoSedi['turni'][fascia] = t.daysOfWeek.join(',')
    }
    const infoSediRef = doc(firestore, distrettoRef.path, 'info', 'info_sedi')
    await setDoc(infoSediRef, infoSedi)
    const infoMedici: Record<string, any> = {}
    for (const id_doc of Object.keys(distretto.medici)) {
        const doc = distretto.medici[id_doc]
        infoMedici[id_doc] = doc
    }
}