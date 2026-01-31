import { initializeApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';

// Firebase konfiguracija - edu-cycle-tehnicka-skola projekat
const firebaseConfig = {
  apiKey: "AIzaSyDsYKJUhlQTdyak3gHIGu9g0SHa_hlBPLM",
  authDomain: "edu-cycle-tehnicka-skola.firebaseapp.com",
  databaseURL: "https://edu-cycle-tehnicka-skola-default-rtdb.firebaseio.com",
  projectId: "edu-cycle-tehnicka-skola",
  storageBucket: "edu-cycle-tehnicka-skola.firebasestorage.app",
  messagingSenderId: "555157960840",
  appId: "1:555157960840:web:fef93f042d8ad25bb4073d",
  measurementId: "G-EPK25D2TGJ"
};

let database: Database | null = null;

try {
  const app = initializeApp(firebaseConfig);
  database = getDatabase(app);
  console.log('Firebase inicijalizovan');
} catch (error) {
  console.warn('Firebase inicijalizacija nije uspela, koristi se lokalni raspored:', error);
}

export { database };