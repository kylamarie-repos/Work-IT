// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, browserSessionPersistence } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyALKoLj0Jnu95Biu-M0c6ryvb5lV2FLZHU",
  authDomain: "work-it-8acb9.firebaseapp.com",
  projectId: "work-it-8acb9",
  storageBucket: "work-it-8acb9.appspot.com",
  messagingSenderId: "255946708910",
  appId: "1:255946708910:web:9ca998473bfe0a15e89a3f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app);

auth.setPersistence(browserSessionPersistence)
  .then(() => {
    // Successfully set persistence
    console.log("Persistence set to session");
  })
  .catch((error) => {
    // Handle errors
    console.error("Error setting persistence:", error);
  });

export { storage, auth, db };
