import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyA3wL8d2of_SePR0dRY4AuLBKf9JvcUKA0",
  authDomain: "programmazione-turni-gm.firebaseapp.com",
  projectId: "programmazione-turni-gm",
  storageBucket: "programmazione-turni-gm.appspot.com",
  messagingSenderId: "802986988487",
  appId: "1:802986988487:web:d81798c9d779bae9eb3fe2",
  measurementId: "G-1M9KL6CP1P"
};

export const firebaseApp = initializeApp(firebaseConfig);
const analytics = isSupported().then(yes => yes ? getAnalytics(firebaseApp) : null);
