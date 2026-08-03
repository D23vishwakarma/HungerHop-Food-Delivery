// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "hungerhop-food-delivery.firebaseapp.com",
  projectId: "hungerhop-food-delivery",
  storageBucket: "hungerhop-food-delivery.firebasestorage.app",
  messagingSenderId: "1007622376057",
  appId: "1:1007622376057:web:abb8025485fdd2f77f22a8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth=getAuth(app)
export {auth,app}
