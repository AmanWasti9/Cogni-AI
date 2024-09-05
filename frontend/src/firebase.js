// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD5oWa-7wCdqJqVF8TRnWoz8PZawougMU4",
  authDomain: "final-project-ade2a.firebaseapp.com",
  projectId: "final-project-ade2a",
  storageBucket: "final-project-ade2a.appspot.com",
  messagingSenderId: "775287584978",
  appId: "1:775287584978:web:d66e4dfc8ab6d07f2ed50b",
  measurementId: "G-DTKTWQLGF1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const firestore = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth();

export { firestore, storage, analytics, auth };
