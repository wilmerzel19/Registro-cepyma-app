import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import  { getAuth } from "firebase/auth";



const firebaseConfig = {
  apiKey: "AIzaSyAomjHvZ-PiDd_kUDlpIdIBMddXLPqOS9c",
  authDomain: "registro-estudiantil-869e6.firebaseapp.com",
  projectId: "registro-estudiantil-869e6",
  storageBucket: "registro-estudiantil-869e6.appspot.com",
  messagingSenderId: "285018278171",
  appId: "1:285018278171:web:f2072bb15fe658a9b02bbe"
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
