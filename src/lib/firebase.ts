// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v9-compat and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyArHtN0YwhT1rDGn-qnOI4ALOWRHtXhrBo",
  authDomain: "mellow-4401e.firebaseapp.com",
  projectId: "mellow-4401e",
  storageBucket: "mellow-4401e.firebasestorage.app",
  messagingSenderId: "576872483862",
  appId: "1:576872483862:web:0c65f304249bb5fa797937"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
