import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCWZ7NpZwhV5Q8fzu4hvbE5eIKWkCk4SHo',
  authDomain: 'product-management-app-fa86a.firebaseapp.com',
  projectId: 'product-management-app-fa86a',
  storageBucket: 'product-management-app-fa86a.firebasestorage.app',
  messagingSenderId: '248980693024',
  appId: '1:248980693024:web:34f4df59681539994cdc45',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);