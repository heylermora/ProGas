// apiConfig.ts
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDoc, getDocs, addDoc, doc, updateDoc, deleteDoc, query, where, limit, startAfter, QueryDocumentSnapshot } from 'firebase/firestore';
import { getAuth } from "firebase/auth";

// Tu configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCmu7161B_rRoXn4_eLLW64s5EzaOVlCvA",
    authDomain: "progasdb-8c0e4.firebaseapp.com",
    projectId: "progasdb-8c0e4",
    storageBucket: "progasdb-8c0e4.firebasestorage.app",
    messagingSenderId: "502042335555",
    appId: "1:502042335555:web:ac486c56921f9357aeb7f6",
    measurementId: "G-E98QXJDWT5"
  };  

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Obtener la instancia de autenticación
export const auth = getAuth(app);

// Exportar funciones para interactuar con Firestore

export const fetchAllData = async <T>(
    collectionName: string,
    filters?: { searchFields?: string[], searchTerm?: string[] },
    pageSize: number = 10,
    lastVisibleDoc?: QueryDocumentSnapshot
): Promise<T[]> => {
    let q = query(collection(db, collectionName), limit(pageSize));

    // Verificamos si hay filtros de búsqueda
    if (filters?.searchFields && filters?.searchTerm) {
        if (filters.searchFields.length === filters.searchTerm.length) {
            filters.searchFields.forEach((field, index) => {
                const term = filters.searchTerm[index];
                q = query(q, where(field, '>=', term), where(field, '<=', term + '\uf8ff'));
            });
        } else {
            throw new Error('El número de searchFields debe ser igual al número de searchTerm');
        }
    }

    if (lastVisibleDoc) {
        q = query(q, startAfter(lastVisibleDoc));
    }

    // Ejecutamos la consulta
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as T[];

    return data;
};

export const fetchDataById = async (collectionName: string, id: string) => {
    const docRef = doc(db, collectionName, id);
    const docSnapshot = await getDoc(docRef);
    
    if (docSnapshot.exists()) {
        return { id: docSnapshot.id, ...docSnapshot.data() };
    } else {
        throw new Error('Documento no encontrado');
    }
};

export const fetchDataWithFilters = async (collectionName: string, filters?: { searchFields?: string[], searchTerms?: string[] }) => {
    let q = query(collection(db, collectionName));

    if (filters?.searchFields && filters.searchTerms && filters.searchFields.length === filters.searchTerms.length) {
        filters.searchFields.forEach((field, index) => {
            const term = filters.searchTerms[index];
            q = query(q, where(field, '>=', term), where(field, '<=', term + '\uf8ff'));
        });
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data() }));
};

export const addData = async (collectionName: string, data: any) => {
    await addDoc(collection(db, collectionName), data);
};

export const updateData = async (collectionName: string, id: string, updatedData: any) => {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, updatedData);
};

export const deleteData = async (collectionName: string, id: string) => {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
};
