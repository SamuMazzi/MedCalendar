import { setDoc, doc, Timestamp, arrayUnion, deleteDoc, deleteField, arrayRemove } from "firebase/firestore";
import { capitalizeFirstLetter } from "../../local_utilities";
import { firestore, firestore_distrettiCollectionKey, firestore_infoCollectionKey, firestore_infoMediciKey, firestore_lastTimeModifyInfoDoctorsKey, firestore_listaMediciKey, firestore_usersKey, handleFirebaseError, MedicoImported, MedicoRemote } from "./firestore";

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

export const setDataMedici = async (bufferString: string) => {
    const futures = []
    const arr = bufferString.split('\n'); 
    const headers = arr[0].split(',').map(el => capitalizeFirstLetter(el.trim()));
    //TODO: Per questioni prestazionali togliere uid dai campi e lasciarlo solo come chiave dell'oggetto
    try {
        for (let i = 1; i < arr.length; i++) {
            const obj: any = createDataCsv(arr[i], headers)
            const uidMed = obj['uid']
            futures.push(setDoc(doc(firestore, firestore_usersKey, uidMed), obj))
            //! Hardcoded, cambiare quando si aggiungeranno più distretti
            futures.push(setDoc(doc(firestore, firestore_distrettiCollectionKey, 'Sassuolo', firestore_infoCollectionKey, firestore_infoMediciKey), { [uidMed]: obj }, { merge: true }));
            futures.push(setDoc(doc(firestore, firestore_distrettiCollectionKey, 'Sassuolo', firestore_infoCollectionKey, firestore_listaMediciKey), { 'list': arrayUnion(uidMed) }, {merge: true}));
            futures.push(updateLastModifyDoctors('Sassuolo'))
        }
        await Promise.all(futures)
    } catch (error: unknown) {
        handleFirebaseError(error)
    }
}

//Codice provvisorio --------------------------------

export const fromRemoteToImportedMedico = (med: MedicoRemote): MedicoImported => {
    return {
        nome: (med.Nome + ' ' + med.Cognome).trim(),
        ruolo: med.ruolo,
        sedi: med.sedi,
        email: med.Email
    }
}

export const fromImportedToRemoteMedico = (med: MedicoImported): MedicoRemote => {
    return {
        Nome: med.nome,
        Cognome: '',
        ruolo: med.ruolo,
        sedi: med.sedi,
        Email: med.email
    }
}

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

const _createObjMedico = (data: MedicoRemote) => {
    const obj: Record<string, any> = {...data}
    obj['uid'] = data.Email
    return obj
}

export const addBatchMedici = async (medici: Record<string, MedicoImported>, distretto: string) => {
    const futures = []
    const infoMedici: Record<string, any> = {}
    const infoDocMedico = doc(firestore, firestore_distrettiCollectionKey, distretto, firestore_infoCollectionKey, firestore_infoMediciKey)
    for(const id_m of Object.keys(medici)){
        const med = medici[id_m]
        const obj = _createObjMedico(fromImportedToRemoteMedico(med))
        infoMedici[id_m] = obj
        futures.push(setDoc(doc(firestore, firestore_usersKey, id_m), obj))
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

export const addSingleMedico = async (data: MedicoRemote, distretto: string) => {
    await _setSingleMedico(data, distretto, "add")
}

export const updateSingleMedico = async (data: MedicoRemote, distretto: string) => {
    await _setSingleMedico(data, distretto, "update")
}

const _setSingleMedico = async (data: MedicoRemote, distretto: string, mode: "add" | "update", updateLastModify=true) => {
    const futures = []
    const obj = _createObjMedico(data)
    const infoDocMedico = doc(firestore, firestore_distrettiCollectionKey, distretto, firestore_infoCollectionKey, firestore_infoMediciKey)
    const uidMed: string = obj['uid']
    try {
        futures.push(setDoc(doc(firestore, firestore_usersKey, uidMed), obj))
        futures.push(setDoc(infoDocMedico, { [uidMed]: obj }, { merge: true }));
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