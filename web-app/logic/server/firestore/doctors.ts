import { setDoc, doc, Timestamp, arrayUnion, deleteDoc, deleteField, arrayRemove, getDoc } from "firebase/firestore";
import { capitalizeFirstLetter } from "../../local_utilities";
import { firestore, firestore_distrettiCollectionKey, firestore_infoCollectionKey, firestore_infoMediciKey, firestore_lastTimeModifyInfoDoctorsKey, firestore_listaMediciKey, firestore_usersKey, handleFirebaseError, DoctorInterface } from "./firestore";

const createDataCsv = (row: string, headers: string[]) => {
    const data = row.split(',');
    const obj: Record<string, any> = {};
    for (let j = 0; j < 3; j++) { //data.length
        obj[headers[j]] = capitalizeFirstLetter(data[j].trim());
    }
    const tmpRuolo = data[5].trim().toLowerCase().startsWith('incar') ? 'INCARICATO' : data[5].trim()
    obj['role'] = capitalizeFirstLetter(tmpRuolo) + data[4].trim()
    obj['locations'] = data.slice(8).filter(el => el !== "")
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

export const addBatchDoctors = async (medici: Record<string, DoctorInterface>, distretto: string) => {
    const futures = []
    const infoMedici: Record<string, DoctorInterface> = {}
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

export const addSingleMedico = async (data: DoctorInterface, distretto: string) => {
    await _setSingleMedico(data, distretto, "add")
}

export const updateSingleMedico = async (data: DoctorInterface, distretto: string) => {
    await _setSingleMedico(data, distretto, "update")
}

const _setSingleMedico = async (data: DoctorInterface, district: string, mode: "add" | "update", updateLastModify=true) => {
    const futures = []
    const infoDocMedico = doc(firestore, firestore_distrettiCollectionKey, district, firestore_infoCollectionKey, firestore_infoMediciKey)
    const uidMed: string = data.email
    try {
        futures.push(setDoc(doc(firestore, firestore_usersKey, uidMed), data))
        futures.push(setDoc(infoDocMedico, { [uidMed]: data }, { merge: true }));
        if (mode === "add") {
            futures.push(setDoc(doc(firestore, firestore_distrettiCollectionKey, district, firestore_infoCollectionKey, firestore_listaMediciKey), { 'list': arrayUnion(uidMed) }, { merge: true }));
        }
        if(updateLastModify) {
            futures.push(updateLastModifyDoctors(district))
        }
        await Promise.all(futures)
    } catch (error: unknown) {
        handleFirebaseError(error)
    }
}

const createUser = async (data: DoctorInterface) => {
    const futures = []
    const uidMed: string = data.email
    try {
        futures.push(setDoc(doc(firestore, firestore_usersKey, uidMed), data))
        await Promise.all(futures)
    } catch (error: unknown) {
        handleFirebaseError(error)
    }
}

export const setNameUser = async (email: string, name: string) => {
    try {
        await setDoc(doc(firestore, firestore_usersKey, email), {name: name}, { merge: true })
    } catch (error: unknown) {
        handleFirebaseError(error)
    }
}

// TODO: Add function that, from the admin, let him add a new user
// add a user to the database if it doesn't exists
// add al distretto che ha creato

/**
 * Get the data regarding a single user from the database (info like role, name, etc.)
 * If it doesn't exist, return it'll create a new basic one
 * @param email_user Email of the user we want to fetch data from
 * @returns 
 */
export const fetchUserOnLogin = async (email_user: string, display_name?: string): Promise<DoctorInterface> => {
    let out: DoctorInterface = { email: email_user, name: display_name ?? "", role: "" }
    try {
        const documentDoctor = await getDoc(doc(firestore, firestore_usersKey, email_user))
        if (documentDoctor.exists()) {
            out = documentDoctor.data() as DoctorInterface
        } else {
            await createUser({ email: email_user, name: display_name ?? "", role: "" })
        }
    } catch (error: unknown) {
        handleFirebaseError(error)
    }
    return out
}

export const setNameAndSurnameAfterRegistration = async (email_user: string, name: string, surname: string) => {
    try {
        await setDoc(doc(firestore, firestore_usersKey, email_user), {name: name + " " + surname}, {merge: true})
    } catch (error: unknown) {
        handleFirebaseError(error)
    }
}

// -------------------------------------------------