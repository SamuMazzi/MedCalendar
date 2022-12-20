// Import the functions you need from the SDKs you need
import { firebaseApp } from "./firebase";
import { getFirestore, doc, setDoc, collection, getDocs, getDoc, collectionGroup, query, where, arrayUnion, Timestamp } from 'firebase/firestore';

const firestore = getFirestore(firebaseApp);

const usersKey = "users"
const infoCollectionKey = 'info'
const infoMediciKey = 'info_medici'
const infoSediKey = 'info_sedi'
const listaMediciKey = 'list_medici' //TODO: Capire perchè serve questa voce, si potrebbe fare filter su users, ma forse diventa complicato/costoso
const distrettiCollectionKey = 'distretti'

//*     x               V                       V                       V
//* password -> chi sei? medico/admin -> scegli distretto -> cambia turno/raccolta disp ->...

export const getAllMedici = async () => {
    const collectionUsersRef = collection(firestore, usersKey);
    const querySnapshot = await getDocs(collectionUsersRef);
    const tmpMedici: Record<string, Record<any, any>> = {}
    querySnapshot.forEach((doc) => {
      const data = doc.data()!;
      tmpMedici[doc.id] = {
        nome: data.nome,
        distretti: data.distretti,
        ruolo: data.ruolo
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
 * @param mese Date del giorno 3 del mese designato
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

export const setMeseMedico = async (distretto: string, id: string, info: any) => {    
    const key_mese = "2023-"+ info.mese.toString()
    const data: Record<any, any> = {}
    /**
     *  usersRef.update({
            ["requests.outgoing."+personID]: data
        })
     */
    Object.keys(info.disponibilita).forEach((turno) => {
        const giorni: any[] = info.disponibilita[turno]
        giorni.forEach(giorno => data[giorno+"."+turno] = arrayUnion([id]))
        //* 14.20-8 = union[id]
        //* 18.20-8 = union[id]
    })
    
    await setDoc(doc(firestore, distrettiCollectionKey, distretto, 'disponbilita', key_mese), data, { merge: true });
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
    console.log('query' + querySnapshot.docs)
    console.log(querySnapshot.docs)
    const outList = querySnapshot.docs.map((doc) => {
        console.log(doc.ref.path)
        const firstSlash = doc.ref.path.indexOf("/", 1)
        const secondSlash = doc.ref.path.indexOf("/", firstSlash+1)
        const distretto = doc.ref.path.substring(firstSlash+1, secondSlash)
        console.log(distretto)
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
    console.log('Distretto ref: ' + distretto)
    return doc(firestore, distrettiCollectionKey, distretto, infoCollectionKey, infoSediKey)
}
export const getInfoSediDistretto = async (distretto: string) => {
    const distrettoInfoRef = doc(firestore, distrettiCollectionKey, distretto, infoCollectionKey, infoSediKey);
    const snap = await getDoc(distrettoInfoRef);
    return snap.data();
}

export const getDisponibilitaMeseDistretto = async (distretto: string, anno: number, mese: number) => {
    const distrettoDispRef = doc(firestore, distrettiCollectionKey, distretto, 'disponibilita', anno.toString() + '-' + mese.toString());
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