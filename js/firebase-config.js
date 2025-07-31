// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-storage.js";

// Variáveis Globais do Canvas (MANDATÓRIO)
export const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
export const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
    apiKey: "AIzaSyDqPIO6qgLQSG_p5Vg2z5qRVJfQqiK282s",
    authDomain: "cartoes-palhacos-app.firebaseapp.com",
    projectId: "cartoes-palhacos-app",
    storageBucket: "cartoes-palhacos-app.firebasestorage.app",
    messagingSenderId: "455690604804",
    appId: "1:455690604804:web:0b5a909a5ee2dec9e50051"
};
export const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Inicializa e exporta os serviços do Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Exporta a função de autenticação
export const setupAuthListener = (callback) => {
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            try {
                if (initialAuthToken) {
                    await signInWithCustomToken(auth, initialAuthToken);
                } else {
                    await signInAnonymously(auth);
                }
            } catch (error) {
                console.error("Erro na autenticação Firebase:", error);
                // Você pode querer chamar um modal de erro aqui
            }
        }
        callback(); // Chama o roteador ou outra função principal após a autenticação
    });
};
