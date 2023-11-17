import { setDoc, doc, Timestamp, arrayUnion, deleteDoc, deleteField, arrayRemove } from "firebase/firestore";
import { capitalizeFirstLetter } from "../../local_utilities";
import { firestore, firestore_distrettiCollectionKey, firestore_infoCollectionKey, firestore_infoMediciKey, firestore_lastTimeModifyInfoDoctorsKey, firestore_listaMediciKey, firestore_usersKey, handleFirebaseError, MedicoInterface } from "./firestore";

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

const updateLastModifyDoctors = async (distretto: string) => {
    await setDoc(doc(firestore, firestore_distrettiCollectionKey, distretto), {
        [firestore_lastTimeModifyInfoDoctorsKey]: Timestamp.now()
    }, { merge: true })
}

export const setDataMedici = async (bufferString: string, distretto: string) => {
    const futures = []
    const arr = bufferString.split('\n'); 
    const headers = arr[0].split(',').map(el => capitalizeFirstLetter(el.trim()));
    try {
        for (let i = 1; i < arr.length; i++) {
            const obj: any = createDataCsv(arr[i], headers)
            const uidMed = obj['uid']
            futures.push(setDoc(doc(firestore, firestore_usersKey, uidMed), obj))
            //! Hardcoded, cambiare quando si aggiungeranno più distretti
            futures.push(setDoc(doc(firestore, firestore_distrettiCollectionKey, distretto, firestore_infoCollectionKey, firestore_infoMediciKey), { [uidMed]: obj }, { merge: true }));
            futures.push(setDoc(doc(firestore, firestore_distrettiCollectionKey, distretto, firestore_infoCollectionKey, firestore_listaMediciKey), { 'list': arrayUnion(uidMed) }, {merge: true}));
            futures.push(updateLastModifyDoctors(distretto))
        }
        await Promise.all(futures)
    } catch (error: unknown) {
        handleFirebaseError(error)
    }
}

//Codice provvisorio --------------------------------

//TODO: Manda una mail ad utenti registrati?

export const deleteSingleMedicoServer = async (id_med: string, distretto: string) => {
    const futures = []
    const docMedico = doc(firestore, firestore_distrettiCollectionKey, distretto, firestore_infoCollectionKey, firestore_infoMediciKey)
    try {
        futures.push(deleteDoc(doc(firestore, firestore_usersKey, id_med)))
        futures.push(setDoc(docMedico, { [id_med]: deleteField() }, { merge: true }));
        futures.push(setDoc(doc(firestore, firestore_distrettiCollectionKey, distretto, firestore_infoCollectionKey, firestore_listaMediciKey), { 'list': arrayRemove(id_med) }, { merge: true }));
        futures.push(updateLastModifyDoctors(distretto))
        await Promise.all(futures)
    } catch (error: unknown) {
        handleFirebaseError(error)
    }
}

export const addBatchMedici = async (medici: Record<string, MedicoInterface>, distretto: string) => {
    const futures = []
    const infoMedici: Record<string, MedicoInterface> = {}
    const infoDocMedico = doc(firestore, firestore_distrettiCollectionKey, distretto, firestore_infoCollectionKey, firestore_infoMediciKey)
    for(const id_m of Object.keys(medici)){
        const med = medici[id_m]
        infoMedici[id_m] = med
        futures.push(setDoc(doc(firestore, firestore_usersKey, id_m), med))
    }
    try {
        futures.push(setDoc(infoDocMedico, infoMedici, { merge: true }));
        futures.push(setDoc(doc(firestore, firestore_distrettiCollectionKey, distretto, firestore_infoCollectionKey, firestore_listaMediciKey), 
            { 'list': arrayUnion(...Object.keys(infoMedici)) }, { merge: true }));
        futures.push(updateLastModifyDoctors(distretto))
        await Promise.all(futures)
    } catch (error: unknown) {
        handleFirebaseError(error)
    }
}

export const addSingleMedico = async (data: MedicoInterface, distretto: string) => {
    await _setSingleMedico(data, distretto, "add")
}

export const updateSingleMedico = async (data: MedicoInterface, distretto: string) => {
    await _setSingleMedico(data, distretto, "update")
}

const _setSingleMedico = async (data: MedicoInterface, distretto: string, mode: "add" | "update", updateLastModify=true) => {
    const futures = []
    const infoDocMedico = doc(firestore, firestore_distrettiCollectionKey, distretto, firestore_infoCollectionKey, firestore_infoMediciKey)
    const uidMed: string = data.email
    try {
        futures.push(setDoc(doc(firestore, firestore_usersKey, uidMed), data))
        futures.push(setDoc(infoDocMedico, { [uidMed]: data }, { merge: true }));
        if (mode === "add") {
            futures.push(setDoc(doc(firestore, firestore_distrettiCollectionKey, distretto, firestore_infoCollectionKey, firestore_listaMediciKey), { 'list': arrayUnion(uidMed) }, { merge: true }));
        }
        if(updateLastModify) {
            futures.push(updateLastModifyDoctors(distretto))
        }
        await Promise.all(futures)
    } catch (error: unknown) {
        handleFirebaseError(error)
    }
}

// -------------------------------------------------