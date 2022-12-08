// Import the functions you need from the SDKs you need
import { firebaseApp } from "./firebase";
import { getFirestore, doc, setDoc, collection, getDocs, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';

const firestore = getFirestore(firebaseApp);

export const setMeseMedico = async (id: string, info: any) => {    
    const key_mese = "2023-"+ info.mese.toString()
    await setDoc(doc(firestore, "users", id), {
        mese: {
            [key_mese]: {
                sedi: info.sedi,
                disponibilita: info.disponibilita,
                n_ore_max: info.value
            }
        },
    }, { merge: true });
}

export const getAllMedici = async () => {
    const collectionUsersRef = collection(getFirestore(firebaseApp), 'users');
    //const q = query(collectionUsersRef, where("sedi", "array-contains", sedeSelected)); in un futuro magari
    //const [snapshot, loading, error, reload] = useCollectionOnce(collectionUsersRef);
    const querySnapshot = await getDocs(collectionUsersRef);
    const tmpMedici: Record<string, string> = {}
    querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      // doc.data() is never undefined for query doc snapshots (official documentation)
      const data = doc.data()!;
      tmpMedici[doc.id] = data.nome;
    });
    return tmpMedici;
}
