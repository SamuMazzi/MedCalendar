// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA3wL8d2of_SePR0dRY4AuLBKf9JvcUKA0",
  authDomain: "programmazione-turni-gm.firebaseapp.com",
  projectId: "programmazione-turni-gm",
  storageBucket: "programmazione-turni-gm.appspot.com",
  messagingSenderId: "802986988487",
  appId: "1:802986988487:web:d81798c9d779bae9eb3fe2",
  measurementId: "G-1M9KL6CP1P"
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);
//const analytics = getAnalytics(firebaseApp); window is not defined //TODO Risolvi