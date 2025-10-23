import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyDqPIO6qgLQSG_p5Vg2z5qRVJfQqiK282s",
    authDomain: "cartoes-palhacos-app.firebaseapp.com",
    projectId: "cartoes-palhacos-app",
    storageBucket: "cartoes-palhacos-app.firebasestorage.app",
    messagingSenderId: "455690604804",
    appId: "1:455690604804:web:0b5a909a5ee2dec9e50051",
    measurementId: "G-FC6MXKE9XC"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);