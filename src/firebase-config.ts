import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getDatabase, type Database } from 'firebase/database';
import { getAuth, type Auth } from 'firebase/auth';

// Firebase konfiguracija - edu-cycle-np-utss projekat
const firebaseConfig = {
  apiKey: "AIzaSyBDz_ZCmUe6fh6vwMALUqzUA0jq3HZH2Mw",
  authDomain: "edu-cycle-np-utss.firebaseapp.com",
  databaseURL: "https://edu-cycle-np-utss-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "edu-cycle-np-utss",
  storageBucket: "edu-cycle-np-utss.firebasestorage.app",
  messagingSenderId: "396831706375",
  appId: "1:396831706375:web:df70f5b4e552a22ec009a2"
};

let app: FirebaseApp | null = null;
let database: Database | null = null;
let auth: Auth | null = null;

try {
  app = initializeApp(firebaseConfig);
  database = getDatabase(app);
  auth = getAuth(app);
  console.log('Firebase inicijalizovan');
} catch (error) {
  console.warn('Firebase inicijalizacija nije uspela, koristi se lokalni raspored:', error);
}

export { database, auth };