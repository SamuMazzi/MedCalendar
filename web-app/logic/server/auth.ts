import { firebaseApp } from "./firebase";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth'
import { clearStorage } from "../local_storage";

export type TypeSignError = "email" | "password";

export class SignError extends Error {
    type: TypeSignError;

    constructor(msg: string, type: TypeSignError) {
        super(msg);
        this.type = type;

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, SignError.prototype);
    }
}

const auth = getAuth(firebaseApp);

export const signInAdminWithEmail = async (email: string, password: string) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        return user;
    } catch (error: any) {
        const errorCode = error.code;
        const errorMessage = error.message;
        throw new SignError("C'è stato un errore " + errorMessage, "email")
    }
}

export const logoutFirebase = async () => {
    await signOut(auth)
    clearStorage();
}