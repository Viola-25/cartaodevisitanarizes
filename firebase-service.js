import { db, storage, auth } from '../firebase-config.js';
import { collection, getDocs, addDoc, doc, deleteDoc, getDoc, updateDoc, query, orderBy, where, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { ref as stRef, uploadBytesResumable, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";

// Auth Services
export const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const logout = () => signOut(auth);
export const onAuthChange = (callback) => onAuthStateChanged(auth, callback);

// Firestore Services
export async function getPalhacos() {
    const palhacos = [];
    const q = query(collection(db, "palhacos"), orderBy("name", "asc"));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        let d = doc.data();
        d.key = doc.id;
        palhacos.push(d);
    });
    return palhacos;
}

export async function getPalhacoByDocId(key) {
    const ref = doc(db, "palhacos", key);
    const snap = await getDoc(ref);
    if (snap.exists()) {
        return { ...snap.data(), key: snap.id };
    }
    return null;
}

export async function getPalhacoByCardId(id) {
    const palhacosRef = collection(db, "palhacos");
    const q = query(palhacosRef, where("id", "==", id));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    const doc = querySnapshot.docs[0];
    return { ...doc.data(), key: doc.id };
}

export const createPalhaco = (data) => addDoc(collection(db, "palhacos"), data);

export const updatePalhaco = (key, data) => updateDoc(doc(db, "palhacos", key), data);

export async function deletePalhaco(key) {
    const palhacoData = await getPalhacoByDocId(key);

    if (palhacoData) {
        const imagesToDelete = [];
        if (palhacoData.photo) imagesToDelete.push(palhacoData.photo);
        if (palhacoData.additionalImages) {
            palhacoData.additionalImages.forEach(imgUrl => {
                if (imgUrl) imagesToDelete.push(imgUrl);
            });
        }

        const deletePromises = imagesToDelete.map(url => deleteImage(url).catch(err => console.warn("Imagem não encontrada para deletar:", url)));
        await Promise.all(deletePromises);
    }

    await deleteDoc(doc(db, "palhacos", key));
}

// Storage Services
export function uploadImage(file, path) {
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "")}`;
    const storageRef = stRef(storage, `${path}/${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    return { uploadTask, storageRef };
}

export const getImageUrl = (storageRef) => getDownloadURL(storageRef);

export const deleteImage = (url) => deleteObject(stRef(storage, url));