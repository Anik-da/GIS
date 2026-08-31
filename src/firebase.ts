import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

// Web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA0x8C1xXZZ7Q1-drIPbnWkyNPfqx8Iziw",
  authDomain: "propertymap-system.firebaseapp.com",
  projectId: "propertymap-system",
  storageBucket: "propertymap-system.firebasestorage.app",
  messagingSenderId: "18308437207",
  appId: "1:18308437207:web:c89b13c96cede33a3b4c92",
  measurementId: "G-BRG4Q00NTK"
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Analytics safely for browser environment
export const analyticsPromise = isSupported().then((supported) => (supported ? getAnalytics(app) : null));
