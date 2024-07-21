import { AppFirebaseError, firebaseApp } from "./firebase";
import { getAuth, signInWithEmailAndPassword, signOut, AuthError, 
    connectAuthEmulator, signInAnonymously, GoogleAuthProvider, signInWithPopup,
    signInWithEmailLink, sendSignInLinkToEmail, isSignInWithEmailLink
} from 'firebase/auth'
import { clearStorage } from "../local_utilities";

function isInstanceOfAuthError(error: any): error is AuthError {
    if('code' in error && 'customData' in error && 'message' in error && 'name' in error) return true
    
    return false
} 

export const fbAuth = getAuth(firebaseApp);
if(process.env.NODE_ENV === 'test') {
    connectAuthEmulator(fbAuth, 'localhost:9099');
}

export const sendSignInEmailWithLink = async (email: string) => {
    if(typeof window === 'undefined') {
        return
    }
    const url = "https://medscheduler.vercel.app"

    try {
        const actionCodeSettings = {
            url: url + '/signin_confirm',
            handleCodeInApp: true,
        }
        await sendSignInLinkToEmail(fbAuth, email, actionCodeSettings)
        // The link was successfully sent. Inform the user.
        // Save the email locally so you don't need to ask the user for it again
        // if they open the link on the same device.
        window.localStorage.setItem('emailForSignIn', email);
    } catch (error: unknown) {
        if (isInstanceOfAuthError(error)) {
            throw new AppFirebaseError({code: error.code})
        } else {
            throw new Error("C'è stato un errore, riprovare dopo")
        }
    }
}

export const signInUserWithEmailLink = async (email: string, link: string) => {
    if(typeof window === 'undefined') {
        return
    }
    try {
        // Confirm the link is a sign-in with email link.
        if (isSignInWithEmailLink(fbAuth, link)) {
            // The client SDK will parse the code from the link for you.
            await signInWithEmailLink(fbAuth, email, link)
            if(typeof window !== 'undefined') {
                window.localStorage.removeItem('emailForSignIn');
            }
        }
    } catch (error: unknown) {
        if (isInstanceOfAuthError(error)) {
            throw new AppFirebaseError({code: error.code})
        } else {
            throw new Error("C'è stato un errore, riprovare dopo")
        }
    }
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

export const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    // provider.setCustomParameters({ prompt: "select_account" });
    try {
        const userCredential = await signInWithPopup(fbAuth, provider);
        const user = userCredential.user;
        return user
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