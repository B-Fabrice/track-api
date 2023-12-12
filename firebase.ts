import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCjyaPdOeEtsssNoNObnJT_F4eBX3yt1no",
  authDomain: "track-api-e9ec6.firebaseapp.com",
  projectId: "track-api-e9ec6",
  storageBucket: "track-api-e9ec6.appspot.com",
  messagingSenderId: "932115295932",
  appId: "1:932115295932:web:b65d8613678e9503046ab9",
  measurementId: "G-7SMYHYSZM6"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);