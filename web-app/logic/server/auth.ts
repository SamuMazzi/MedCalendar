import { AppFirebaseError, firebaseApp } from "./firebase";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, AuthError, connectAuthEmulator, AuthErrorCodes, signInAnonymously } from 'firebase/auth'
import { clearStorage } from "../local_utilities";

function isInstanceOfAuthError(error: any): error is AuthError {
    if('code' in error && 'customData' in error && 'message' in error && 'name' in error) return true
    
    return false
} 

export const fbAuth = getAuth(firebaseApp);
if(process.env.NODE_ENV === 'test') {
    connectAuthEmulator(fbAuth, 'localhost:9099');
}

export const signInAdminWithEmail = async (email: string, password: string) => {
    try {
        const userCredential = await signInWithEmailAndPassword(fbAuth, email, password);
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

export const signInAnonym = async () => {
    const user = await signInAnonymously(fbAuth)
    return user
} 

export const registerAdminWithEmail = async (email: string, password: string) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(fbAuth, email, password);
        const user = userCredential.user;
        return user;
    } catch (error: unknown) {
        if (isInstanceOfAuthError(error)) {
            if (error.code === AuthErrorCodes.CREDENTIAL_ALREADY_IN_USE) {
                return signInAdminWithEmail(email, password)
            }
            throw new AppFirebaseError({code: error.code})
        } else {
            throw new Error("C'è stato un errore, riprovare dopo")
        }
    }
}

export const logoutFirebase = async () => {
    try {
        await signOut(fbAuth)
        clearStorage();
    } catch (error: unknown) {
        if (isInstanceOfAuthError(error)) {
            throw new AppFirebaseError({ code: error.code })
        } else {
            throw new Error("C'è stato un errore, riprovare dopo")
        }
    }
}