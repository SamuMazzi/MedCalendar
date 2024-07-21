import { initializeApp, FirebaseApp } from "firebase/app";
//import { initializeAnalytics, getAnalytics, isSupported } from "firebase/analytics";
import { AuthErrorCodes } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA3wL8d2of_SePR0dRY4AuLBKf9JvcUKA0",
  authDomain: "programmazione-turni-gm.firebaseapp.com",
  projectId: "programmazione-turni-gm",
  storageBucket: "programmazione-turni-gm.appspot.com",
  messagingSenderId: "802986988487",
  appId: "1:802986988487:web:d81798c9d779bae9eb3fe2",
  measurementId: "G-1M9KL6CP1P"
};

export function isInstanceOfFirebaseApp(input: any): input is FirebaseApp {
  if ('automaticDataCollectionEnabled' in input && 'name' in input && 'options' in input) {
    return true
  }
  return false
}

interface PropsAppFirebaseError {
  msg?: string
  code: string
  type?: string
}

export class AppFirebaseError extends Error {
  code: string
  type: string
  signinType?: string

  constructor(props: PropsAppFirebaseError) {
    super(props.msg ? props.msg : '');
    this.setMessageDependingFromCode(props.code)
    this.code = props.code
    this.type = this.getTypeOfError(props)

    Object.setPrototypeOf(this, AppFirebaseError.prototype);
  }

  getTypeOfError(props: PropsAppFirebaseError) {
    if(props.type) {
      return props.type
    } else if (props.code.split('/').length > 1) {
      return props.code.split('/')[0]
    } else {
      return 'unknown'
    }
  }

  setMessageDependingFromCode(code: string) {    
    let message: string

    switch(code) {
      case (AuthErrorCodes.CREDENTIAL_ALREADY_IN_USE): {
        message = "Credenziali già utilizzate"
        this.signinType = 'email'
        break;
      }
      case (AuthErrorCodes.CREDENTIAL_MISMATCH): {
        message = "Credenziali sbagliate"
        this.signinType = 'email'
        break;
      }
      case (AuthErrorCodes.EMAIL_EXISTS): {
        message = "Credenziali sbagliate"
        this.signinType = 'email'
        break;
      }
      case (AuthErrorCodes.INVALID_PASSWORD): {
        message = "Credenziali sbagliate"
        this.signinType = 'email'
        break;
      }
      case (AuthErrorCodes.USER_DELETED): {
        message = "Credenziali sbagliate"
        this.signinType = 'email'
        break;
      }
      case (AuthErrorCodes.INVALID_EMAIL): {
        message = "Email non valida"
        this.signinType = 'email'
        break;
      }
      case (AuthErrorCodes.TOO_MANY_ATTEMPTS_TRY_LATER): {
        message = "Troppi tentativi, riprovare fra poco"
        break;
      }
      case (AuthErrorCodes.WEAK_PASSWORD): {
        message = "La password deve essere di almeno 6 caratteri"
        this.signinType = 'password'
        break;
      }
      case (AuthErrorCodes.UNVERIFIED_EMAIL): {
        message = "Email non verificata"
        this.signinType = 'email'
        break;
      }
      case ('unavailable'): {
        message = "Connessione assente, riprovare"
        break;
      }
      case (AuthErrorCodes.INVALID_CONTINUE_URI): {
        message = "Si è verificato un errore con il link, riprovare."
        break;
      }
      default: {
        console.error(code)
        message = "Si è verificato un errore, riprovare"
        break;
      }
    }
    
    this.message = message
  }
}

export const firebaseApp = initializeApp(firebaseConfig);
/* const analytics = isSupported().then(yes => {
  if (yes) {
    initializeAnalytics(firebaseApp)
    getAnalytics(firebaseApp)
  }}
); */
