// Import the functions you need from the SDKs you need
import { firebaseApp } from "./firebase";
import { getFirestore, doc, setDoc, collection, getDocs, getDoc, collectionGroup, query, where, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { StateTurno } from "../redux/turni_slice";
import { SchedulerState } from "../redux/scheduler_slice";
import { capitalizeFirstLetter } from "../local_storage";

const firestore = getFirestore(firebaseApp);

const usersKey = "users"
const infoCollectionKey = 'info'
const infoMediciKey = 'info_medici'
const infoSediKey = 'info_sedi'
const listaMediciKey = 'list_medici' //TODO: Capire perchè serve questa voce, si potrebbe fare filter su users, ma forse diventa complicato/costoso
const distrettiCollectionKey = 'distretti'
const disponibilitaSedeKey = 'disponibilita'


export const getAllMedici = async () => {
    const collectionUsersRef = collection(firestore, usersKey);
    const querySnapshot = await getDocs(collectionUsersRef);
    const tmpMedici: Record<string, Record<any, any>> = {}
    querySnapshot.forEach((doc) => {
      const data = doc.data()!;
      tmpMedici[doc.id] = {
        nome: data.Nome + ' ' + data.Cognome,
        ruolo: data.ruolo,
        uid: data.uid,
        sedi: data.sedi
      }
    });
    return tmpMedici;
}

export const setInfoMedico = async (distretto: string, id_medico: string, nome: string, ruolo: string) => {
    await setDoc(doc(firestore, distrettiCollectionKey, distretto, infoCollectionKey, infoMediciKey), {
        [id_medico]: {
            nome: nome,
            ore_max: -1,
            ruolo: ruolo
        }
    }, { merge: true })
}

/**
 * 
 * @param mese Data del giorno 3 del mese designato
 * @param distretto Distretto per firestore
 * @param sedi Ancora da definire bene
 */
export const setConfigurationDistrettoMese = async (mese: Date, distretto: string, sedi: any[]) => {
    const firestoreKeyMese = mese.getFullYear().toString() + "-" + mese.getMonth().toString()
    const out: Record<any, any> = {}
    sedi.forEach(val => {
        out[val.nome] = {
            medici_per_turno: val.medici_per_turno,
            turni: val.fasce_turno
        }
    })
    await setDoc(doc(firestore, distrettiCollectionKey, distretto, infoCollectionKey, infoSediKey), {
        [firestoreKeyMese]: out,
    })
}

export const setMeseMedico = async (distretto: string, id: string, info: StateTurno) => {  
    const key_mese = "2023-"+ (new Date(info.mese!).getMonth()+1).toString()
    const data: Record<string, any> = {}
    Object.keys(info.disponibilita).forEach((turno) => {
        info.disponibilita[turno].forEach(giorno => data[giorno] = { [turno]: arrayUnion(id) })
    })
    await setDoc(doc(firestore, distrettiCollectionKey, distretto, disponibilitaSedeKey, key_mese), data, { merge: true });
}

export const uploadDefConfigurazione = async (distretto: string, info: SchedulerState) => {
    const key_mese = "2023-" + info.month
    const data: Record<string, any> = {
        'create_at': serverTimestamp(),
        'turni': info.turni,
        'medici': info.medici_mod
    }    
    
    await setDoc(doc(firestore, distrettiCollectionKey, distretto, "turni_mese", key_mese), data);

}

// doc.data() is never undefined for query doc snapshots (official documentation)
//TODO: Implementare last modified per evitare troppe letture

export const getAllDistretti = async () => {
    const collectionDistrettiRef = collection(firestore, distrettiCollectionKey);
    const querySnapshot = await getDocs(collectionDistrettiRef);
    const outList = querySnapshot.docs.map((doc) => doc.id)
    return outList;
}

export const getDistrettiForMedico = async (id: string) => {
    const queryDistretti = query(collectionGroup(firestore, infoCollectionKey), where('list', "array-contains", id));
    const querySnapshot = await getDocs(queryDistretti);
    const outList = querySnapshot.docs.map((doc) => {
        const firstSlash = doc.ref.path.indexOf("/", 1)
        const secondSlash = doc.ref.path.indexOf("/", firstSlash+1)
        const distretto = doc.ref.path.substring(firstSlash+1, secondSlash)
        return distretto
    })
    return outList;
}

export const getDistrettiForAdmin = async (id: string) => {
    const collectionDistrettiRef = collection(firestore, distrettiCollectionKey);
    const q = query(collectionDistrettiRef, where("admins", "array-contains", id));
    const querySnapshot = await getDocs(q);
    const outList = querySnapshot.docs.map((doc) => doc.id)
    return outList;
}


export const getInfoMediciDistretto = async (distretto: string) => {
    const distrettoInfoRef = doc(firestore, distrettiCollectionKey, distretto, infoCollectionKey, infoMediciKey);
    const snap = await getDoc(distrettoInfoRef);
    return snap.data();
}

export const getInfoSediRef = (distretto: string) => {
    return doc(firestore, distrettiCollectionKey, distretto, infoCollectionKey, infoSediKey)
}
export const getInfoSediDistretto = async (distretto: string) => {
    const snap = await getDoc(getInfoSediRef(distretto));

    const data = snap.data()!
    const out: RemoteSediInfo = {
        sedi: data.sedi,
        turni: data.turni
    }
    return out
}
interface RemoteInfoSingleSede {
    medici_per_turno: number
}
export interface RemoteSediInfo {
    sedi: Record<string, RemoteInfoSingleSede>
    turni: Record<string, string>
}

/**
 * Struttura disp: <giorno> -> <turno> -> id_medici
 *                 Record<giorno, Record<turno, <id_medici>[]>>
 * @param distretto 
 * @param anno 
 * @param mese 
 * @returns 
 */ 
export const getDisponibilitaMeseDistretto = async (distretto: string, anno: number, mese: number) => {
    const distrettoDispRef = doc(firestore, distrettiCollectionKey, distretto, 'disponibilita', anno.toString() + '-' + mese.toString().padStart(2, '0'));
    const snap = await getDoc(distrettoDispRef);
    return snap.data();
}

export const getDisponibiltiaOfSediOfAdminUser = async (mese: string, distretto: string) => {
    const disponibilitaMediciQuery = query(collectionGroup(firestore, mese), where('distretti', 'array-contains', distretto)); //* Rivedere array-contains
    const querySnapshot = await getDocs(disponibilitaMediciQuery);
    querySnapshot.forEach((doc) => {
        doc.ref.path //Possiamo risalire ad ID medico
        console.log(doc.id, ' => ', doc.data());
    });
}

export const getGenericPassword = async () => {
    const secretsRef = doc(firestore, 'generic_info', 'secrets');
    const secrets = await getDoc(secretsRef);
    return secrets.get('password');
}

/* async function clearCollection(path: string) {
    const ref = collection(firestore, path)
    onSnapshot(ref, (snapshot) => {
        snapshot.docs.forEach(async (doc) => {
            await deleteDoc(doc.ref)
        })
    })
} */

export const setDataMedici = async (bufferString: string) => {
    const futures = []
    const arr = bufferString.split('\n'); 
    var headers = arr[0].split(',').map(el => capitalizeFirstLetter(el.trim()));
    
    for (var i = 1; i < arr.length; i++) {
        var data = arr[i].split(',');
        var obj: any = {};
        for (var j = 0; j < 3; j++) { //data.length
            obj[headers[j]] = capitalizeFirstLetter(data[j].trim());
        }
        const tmpRuolo = data[5].trim().toLowerCase().startsWith('incar') ? 'INCARICATO' : data[5].trim()
        obj['ruolo'] = capitalizeFirstLetter(tmpRuolo) + data[4].trim()
        obj['sedi'] = data.slice(8).filter(el => el !== "")
        obj['uid'] = obj[headers[0]]
        futures.push(setDoc(doc(firestore, usersKey, obj['uid']), obj));
    }
    //JSON.stringify(jsonObj);
    await Promise.all(futures)
}