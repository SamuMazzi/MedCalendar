import { AppFirebaseError, firebaseApp } from "./firebase";
import { getAuth, signInWithEmailAndPassword, signOut, AuthError } from 'firebase/auth'
import { clearStorage } from "../local_utilities";

export type TypeSignError = "email" | "password";

export class SignError extends Error {
    type: TypeSignError;

    constructor(msg: string, type: TypeSignError) {
        super(msg);
        this.type = type;
        Object.setPrototypeOf(this, SignError.prototype);
    }
}

function isInstanceOfAuthError(error: any): error is AuthError {
    if('code' in error && 'customData' in error && 'message' in error && 'name' in error) return true
    
    return false
} 

const auth = getAuth(firebaseApp);

export const signInAdminWithEmail = async (email: string, password: string) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        return user;
    } catch (error: unknown) {
        if (isInstanceOfAuthError(error)) {
            throw new AppFirebaseError({code: error.code})
        } else {
            throw new Error("C'è stato un errore, riprovare dopo")
        }
    }
}

export const logoutFirebase = async () => {
    try {
        await signOut(auth)
        clearStorage();
    } catch (error: unknown) {
        if (isInstanceOfAuthError(error)) {
            throw new AppFirebaseError({ code: error.code })
        } else {
            throw new Error("C'è stato un errore, riprovare dopo")
        }
    }
}