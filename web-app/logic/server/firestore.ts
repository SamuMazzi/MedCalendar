import { AppFirebaseError, firebaseApp } from "./firebase";
import { getFirestore, doc, setDoc, collection, getDocs, getDoc, collectionGroup, query, where, arrayUnion, serverTimestamp, FirestoreError } from 'firebase/firestore';
import { StateTurno } from "../redux/turni_slice";
import { SchedulerState } from "../redux/scheduler_slice";
import { capitalizeFirstLetter, getLocalLastOreMaxSet, getNumOreMaxByRole } from "../local_utilities";

const firestore = getFirestore(firebaseApp);

const usersKey = "users"
const infoCollectionKey = 'info'
const infoMediciKey = 'info_medici'
const infoSediKey = 'info_sedi'
const listaMediciKey = 'list_medici' //TODO: Capire perchè serve questa voce, si potrebbe fare filter su users, ma forse diventa complicato/costoso
const distrettiCollectionKey = 'distretti'
const disponibilitaSedeKey = 'disponibilita'
const configDefinitivaDistrettoKey = 'turni_mese'

const nomeMedicoKey = 'nome'
const ruoloMedicoKey = 'ruolo'
const oreMaxMedicoKey = 'ore_max'
const uidMedicoKey = 'uid'
const sediMedicoKey = 'sedi'

function handleFirebaseError(error: any) {
    if ('name' in error && error.name === 'FirebaseError') {
        throw new AppFirebaseError({ code: error.code, type: 'firestore' })
    } else throw error
}

function getKeyMese(date: Date) {
    const firestoreKeyMese = date.getFullYear() + "-" + (date.getMonth() + 1) //* Fondamentali le parentesi!
    return firestoreKeyMese
}

/**
 * Per evitare troppe letture, finchè siamo sul distretto di Sassuolo teniamo la lettura specifica dei medici di quel distretto
 * @returns 
 */
export const getAllMedici = async () => {
    const tmpMedici: Record<string, Record<string, any>> = {}
    try {
        const docMediciSassuolo = doc(firestore, distrettiCollectionKey, 'Sassuolo', infoCollectionKey, infoMediciKey)
        const res = await getDoc(docMediciSassuolo);
        const dataMedici: any = res.data()
        Object.keys(dataMedici).forEach((uid: string) => {
            const singleMedico = dataMedici[uid];
            tmpMedici[uid] = {
                [nomeMedicoKey]: singleMedico.Nome + ' ' + singleMedico.Cognome,
                [ruoloMedicoKey]: singleMedico.ruolo,
                [uidMedicoKey]: singleMedico.uid,
                [sediMedicoKey]: singleMedico.sedi
            }
        });
        return tmpMedici;
    /*    const collectionUsersRef = collection(firestore, usersKey);
        const querySnapshot = await getDocs(collectionUsersRef);
        const tmpMedici: Record<string, Record<string, any>> = {}
        querySnapshot.forEach((doc) => {
          const data = doc.data()!;
          tmpMedici[doc.id] = {
            [nomeMedicoKey]: data.Nome + ' ' + data.Cognome,
            [ruoloMedicoKey]: data.ruolo,
            [uidMedicoKey]: data.uid,
            [sediMedicoKey]: data.sedi
          }
        });
        return tmpMedici; */
    } catch (error: unknown) {
        handleFirebaseError(error)
    }
}

export const setInfoMedico = async (distretto: string, id_medico: string, nome: string, ruolo: string) => {
    try {
        await setDoc(doc(firestore, distrettiCollectionKey, distretto, infoCollectionKey, infoMediciKey), {
            [id_medico]: {
                [nomeMedicoKey]: nome,
                [ruoloMedicoKey]: ruolo,
                [oreMaxMedicoKey]: getNumOreMaxByRole(ruolo)
            }
        }, { merge: true })
    } catch (error: unknown) {
        handleFirebaseError(error)
    }
}

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
        await setDoc(doc(firestore, distrettiCollectionKey, distretto, infoCollectionKey, infoSediKey), {
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
        futures.push(setDoc(doc(firestore, distrettiCollectionKey, distretto, disponibilitaSedeKey, key_mese), data, { merge: true }));
        const lastOreMaxSet = getLocalLastOreMaxSet()
        //if (lastOreMaxSet === null || lastOreMaxSet !== info.oreMassime) { //TODO: Aggiungi logica di cache anche per sedi
            futures.push(setDoc(doc(firestore, distrettiCollectionKey, distretto, infoCollectionKey, infoMediciKey), { 
                [id]: {
                    [oreMaxMedicoKey]: info.oreMassime,
                    [sediMedicoKey]: info.sedi
                } 
            }, { merge: true }));
        //}
        await Promise.all(futures)
    } catch (error: unknown) {
        handleFirebaseError(error)
    }
}

export const uploadDefConfigurazione = async (distretto: string, info: SchedulerState) => {
    const key_mese = getKeyMese(new Date(info.year, info.month, 3))
    const data: Record<string, any> = {
        'create_at': serverTimestamp(),
        'turni': info.turni,
        'medici': info.medici_mod
    }
    try {
        await setDoc(doc(firestore, distrettiCollectionKey, distretto, configDefinitivaDistrettoKey, key_mese), data);
    } catch (error: unknown) {
        //console.log(error)
        handleFirebaseError(error)
    }
}

// doc.data() is never undefined for query doc snapshots (official documentation)
//TODO: Implementare last modified per evitare troppe letture

export const getAllDistretti = async () => {
    try {
        const collectionDistrettiRef = collection(firestore, distrettiCollectionKey);
        const querySnapshot = await getDocs(collectionDistrettiRef);
        const outList = querySnapshot.docs.map((doc) => doc.id)
        return outList;
    } catch (error: unknown) {
        handleFirebaseError(error)
    }
}

export const getDistrettiForMedico = async (id: string) => {
    try {
        const queryDistretti = query(collectionGroup(firestore, infoCollectionKey), where('list', "array-contains", id));
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
        const collectionDistrettiRef = collection(firestore, distrettiCollectionKey);
        const q = query(collectionDistrettiRef, where("admins", "array-contains", id));
        const querySnapshot = await getDocs(q);
        const outList = querySnapshot.docs.map((doc) => doc.id)
        return outList;
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
export const getDataToSendAPI = async (distretto: string, anno: number, mese: number) => {
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
        console.log(infoMedici)
        for (let doctor of Object.keys(infoMedici!)) {
            const outDoc: Record<string, any> = {}
            const infoDoc = infoMedici![doctor]
            outDoc['id'] = infoDoc['uid']
            outDoc['sedi'] = infoDoc['sedi']
            if(!infoDoc['sedi']) {
                console.log('No sedi!')
                console.log(infoDoc)
            }
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
        console.log(final_out)
        return final_out
    } catch (error: unknown) {
        console.log('ops')
        handleFirebaseError(error)
    }
}

export const getInfoMediciDistretto = async (distretto: string) => {
    try {
        const distrettoInfoRef = doc(firestore, distrettiCollectionKey, distretto, infoCollectionKey, infoMediciKey);
        const snap = await getDoc(distrettoInfoRef);
        return snap.data();
    } catch (error: unknown) {
        handleFirebaseError(error)
    }
}

export const getInfoSediRef = (distretto: string) => {
    return doc(firestore, distrettiCollectionKey, distretto, infoCollectionKey, infoSediKey)
}
export const getInfoSediDistretto = async (distretto: string) => {
    try {
        const infoSediRef = getInfoSediRef(distretto)
        const snap = await getDoc(infoSediRef);
        const data = snap.data()!
        const out: RemoteSediInfo = {
            sedi: data.sedi,
            turni: data.turni
        }
        return out
    } catch (error: any) {
        handleFirebaseError(error)
    }
}
interface RemoteInfoSingleSede {
    medici_per_turno: number
}
export interface RemoteSediInfo {
    sedi: Record<string, RemoteInfoSingleSede>
    turni: Record<string, string>
}

/**
 * @param distretto 
 * @param anno 
 * @param mese Numero compreso tra 0 e 11
 * @returns 
 */ 
export const getDisponibilitaMeseDistretto = async (distretto: string, anno: number, mese: number) => {
    try {
        const distrettoDispRef = doc(firestore, distrettiCollectionKey, distretto, disponibilitaSedeKey, getKeyMese(new Date(anno, mese, 3)));
        const snap = await getDoc(distrettoDispRef);
        return snap.data();
    } catch (error: unknown) {
        handleFirebaseError(error)
    }
}

export const getDisponibiltiaOfSediOfAdminUser = async (mese: string, distretto: string) => {
    try {
        const disponibilitaMediciQuery = query(collectionGroup(firestore, mese), where('distretti', 'array-contains', distretto)); //* Rivedere array-contains
        const querySnapshot = await getDocs(disponibilitaMediciQuery);
        querySnapshot.forEach((doc) => {
            doc.ref.path //Possiamo risalire ad ID medico
        });
    } catch (error: unknown) {
        handleFirebaseError(error)
    }
}

const createDataCsv = (row: string, headers: string[]) => {
    const data = row.split(',');
    const obj: Record<string, any> = {};
    for (let j = 0; j < 3; j++) { //data.length
        obj[headers[j]] = capitalizeFirstLetter(data[j].trim());
    }
    const tmpRuolo = data[5].trim().toLowerCase().startsWith('incar') ? 'INCARICATO' : data[5].trim()
    obj['ruolo'] = capitalizeFirstLetter(tmpRuolo) + data[4].trim()
    obj['sedi'] = data.slice(8).filter(el => el !== "")
    obj['uid'] = obj[headers[0]]
    return obj
}

export const setDataMedici = async (bufferString: string) => {
    const futures = []
    const arr = bufferString.split('\n'); 
    const headers = arr[0].split(',').map(el => capitalizeFirstLetter(el.trim()));
    //TODO: Per questioni prestazionali togliere uid dai campi e lasciarlo solo come chiave dell'oggetto
    try {
        for (let i = 1; i < arr.length; i++) {
            const obj: any = createDataCsv(arr[i], headers)
            const uidMed = obj['uid']
            futures.push(setDoc(doc(firestore, usersKey, uidMed), obj))
            //! Hardcoded, cambiare quando si aggiungeranno più distretti
            futures.push(setDoc(doc(firestore, distrettiCollectionKey, 'Sassuolo', infoCollectionKey, infoMediciKey), { [uidMed]: obj }, { merge: true }));
            futures.push(setDoc(doc(firestore, distrettiCollectionKey, 'Sassuolo', infoCollectionKey, listaMediciKey), { 'list': arrayUnion(uidMed) }, {merge: true}));
        }
        await Promise.all(futures)
    } catch (error: unknown) {
        handleFirebaseError(error)
    }
}

//Codice provvisorio --------------------------------

export interface MedicoRemote {
    Cognome: string,
    Nome: string,
    ruolo: string,
    sedi: string[],
    Email: string
}

export const addSingleMedico = async (data: MedicoRemote, distretto: string) => {
    const futures = []
    const obj: Record<string, any> = {...data}
    obj['uid'] = data.Email
    const uidMed: string = obj['uid']
    try {
        futures.push(setDoc(doc(firestore, usersKey, uidMed), obj))
        const docMedico = doc(firestore, distrettiCollectionKey, distretto, infoCollectionKey, infoMediciKey)
        futures.push(setDoc(docMedico, { [uidMed]: obj }, { merge: true }));
        futures.push(setDoc(doc(firestore, distrettiCollectionKey, distretto, infoCollectionKey, listaMediciKey), { 'list': arrayUnion(uidMed) }, { merge: true }));
        
        await Promise.all(futures)
    } catch (error: unknown) {
        console.log(error)
        handleFirebaseError(error)
    }
}
// -------------------------------------------------