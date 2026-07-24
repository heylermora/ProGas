// apiConfig.ts
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDoc, getDocs, addDoc, doc, updateDoc, deleteDoc, query, where, limit, startAfter, QueryDocumentSnapshot, orderBy, DocumentData, setDoc } from 'firebase/firestore';
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
  filters?: { searchFields?: string[]; searchTerm?: string[] },
  pageSize: number = 10,
  lastVisibleDoc?: QueryDocumentSnapshot
): Promise<T[]> => {
  try {
    if (!collectionName || collectionName.trim() === '') {
      throw new Error('El nombre de la colección es requerido');
    }

    const colRef = collection(db, collectionName);

    const hasFilters =
      !!filters?.searchFields?.length &&
      !!filters?.searchTerm?.length &&
      String(filters.searchTerm[0] ?? '').trim().length > 0;

    // ✅ CASO 1: SIN FILTROS -> query normal con paginación
    if (!hasFilters) {
      let q = query(colRef, orderBy('__name__'), limit(pageSize)); // orderBy estable

      if (lastVisibleDoc) {
        q = query(q, startAfter(lastVisibleDoc));
      }

      const snap = await getDocs(q);
      return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as T[];
    }

    // ✅ CASO 2: CON FILTROS (OR multi-campo) -> queries separadas y merge
    const term = String(filters!.searchTerm![0]).trim();
    const fields = filters!.searchFields!;

    // si te mandan arrays de diferente tamaño, lo tratamos como error
    if (filters!.searchTerm!.length > 1 && fields.length !== filters!.searchTerm!.length) {
      throw new Error(
        `Mismatch de filtros: ${fields.length} campos pero ${filters!.searchTerm!.length} términos`
      );
    }

    // IMPORTANTE:
    // - Si searchTerm trae solo 1 elemento, se usa para todos los campos (OR)
    // - Si trae N elementos, se toma term[i] para field[i] (pero sigue siendo OR)
    const termsByField =
      filters!.searchTerm!.length === 1
        ? fields.map(() => term)
        : fields.map((_, i) => String(filters!.searchTerm![i] ?? '').trim());

    const queries = fields
      .map((field, i) => {
        const t = termsByField[i];
        if (!t) return null;

        // Prefix match: field in [t, t+\uf8ff]
        return query(colRef, where(field, '>=', t), where(field, '<=', t + '\uf8ff'), limit(pageSize));
      })
      .filter(Boolean) as any[];

    const snaps = await Promise.all(queries.map((qq) => getDocs(qq)));

    // merge + dedupe por id
    const map = new Map<string, any>();
    for (const s of snaps) {
      for (const d of s.docs) {
        if (!map.set(d.id, { id: d.id, ...(d.data() as DocumentData) })) {
          // Handle duplicate IDs if needed
        }
      }
    }

    // Firestore no garantiza orden al mezclar; devolvemos como venga.
    // Si querés ordenar, hacelo por un campo (createdAt, requestDate, etc.)
    return Array.from(map.values()) as T[];
  } catch (error) {
    console.error(`[fetchAllData] Error en colección ${collectionName}:`, error);
    throw new Error(
      `No se pudieron obtener los datos de ${collectionName}: ${
        error instanceof Error ? error.message : 'Error desconocido'
      }`
    );
  }
};

export const fetchDataById = async (collectionName: string, id: string) => {
    try {
        if (!collectionName || collectionName.trim() === '') {
            throw new Error('El nombre de la colección es requerido');
        }
        if (!id || id.trim() === '') {
            throw new Error('El ID del documento es requerido');
        }

        const docRef = doc(db, collectionName, id);
        const docSnapshot = await getDoc(docRef);
        
        if (!docSnapshot.exists()) {
            throw new Error(`Documento no encontrado en ${collectionName} con ID: ${id}`);
        }

        return { id: docSnapshot.id, ...docSnapshot.data() };
    } catch (error) {
        console.error(`[fetchDataById] Error en colección ${collectionName}, ID: ${id}:`, error);
        throw new Error(`No se pudo obtener el documento: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
};

export const fetchDataWithFilters = async (collectionName: string, filters?: { searchFields?: string[], searchTerms?: string[] }) => {
    try {
        if (!collectionName || collectionName.trim() === '') {
            throw new Error('El nombre de la colección es requerido');
        }

        let q = query(collection(db, collectionName));

        if (filters?.searchFields && filters.searchTerms) {
            if (filters.searchFields.length !== filters.searchTerms.length) {
                throw new Error(`Mismatch de filtros: ${filters.searchFields.length} campos pero ${filters.searchTerms.length} términos`);
            }
            filters.searchFields.forEach((field, index) => {
                const term = filters.searchTerms![index];
                q = query(q, where(field, '>=', term), where(field, '<=', term + '\uf8ff'));
            });
        }

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ ...doc.data() }));
    } catch (error) {
        console.error(`[fetchDataWithFilters] Error en colección ${collectionName}:`, error);
        throw new Error(`No se pudieron obtener los datos filtrados: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
};

export const addData = async (collectionName: string, data: any) => {
    try {
        if (!collectionName || collectionName.trim() === '') {
            throw new Error('El nombre de la colección es requerido');
        }
        if (!data || Object.keys(data).length === 0) {
            throw new Error('Los datos a guardar no pueden estar vacíos');
        }

        const docRef = await addDoc(collection(db, collectionName), data);
        console.log(`[addData] Documento creado en ${collectionName} con ID: ${docRef.id}`);
        return { id: docRef.id };
    } catch (error) {
        console.error(`[addData] Error al agregar documento a ${collectionName}:`, error);
        throw new Error(`No se pudo agregar el documento: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
};

export const updateData = async (collectionName: string, id: string, updatedData: any) => {
    try {
        if (!collectionName || collectionName.trim() === '') {
            throw new Error('El nombre de la colección es requerido');
        }
        if (!id || id.trim() === '') {
            throw new Error('El ID del documento es requerido');
        }
        if (!updatedData || Object.keys(updatedData).length === 0) {
            throw new Error('Los datos a actualizar no pueden estar vacíos');
        }

        const docRef = doc(db, collectionName, id);
        const docSnapshot = await getDoc(docRef);
        
        if (!docSnapshot.exists()) {
            throw new Error(`Documento no encontrado en ${collectionName} con ID: ${id}`);
        }

        await updateDoc(docRef, updatedData);
        console.log(`[updateData] Documento actualizado en ${collectionName}, ID: ${id}`);
    } catch (error) {
        console.error(`[updateData] Error al actualizar documento de ${collectionName}, ID: ${id}:`, error);
        throw new Error(`No se pudo actualizar el documento: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
};

// Crea o actualiza un documento con un id conocido. Es útil para ajustes globales
// que no deben duplicarse cada vez que un administrador los guarda.
export const upsertData = async (collectionName: string, id: string, data: any) => {
    try {
        if (!collectionName || collectionName.trim() === '') {
            throw new Error('El nombre de la colección es requerido');
        }
        if (!id || id.trim() === '') {
            throw new Error('El ID del documento es requerido');
        }
        if (!data || Object.keys(data).length === 0) {
            throw new Error('Los datos a guardar no pueden estar vacíos');
        }

        await setDoc(doc(db, collectionName, id), data, { merge: true });
    } catch (error) {
        console.error(`[upsertData] Error al guardar ${collectionName}, ID: ${id}:`, error);
        throw new Error(`No se pudo guardar el documento: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
};

export const deleteData = async (collectionName: string, id: string) => {
    try {
        if (!collectionName || collectionName.trim() === '') {
            throw new Error('El nombre de la colección es requerido');
        }
        if (!id || id.trim() === '') {
            throw new Error('El ID del documento es requerido para la eliminación');
        }

        const docRef = doc(db, collectionName, id);
        const docSnapshot = await getDoc(docRef);
        
        if (!docSnapshot.exists()) {
            throw new Error(`Documento no encontrado en ${collectionName} con ID: ${id}`);
        }
        
        await deleteDoc(docRef);
        console.log(`[deleteData] Documento eliminado de ${collectionName}, ID: ${id}`);
    } catch (error) {
        console.error(`[deleteData] Error al eliminar documento de ${collectionName}, ID: ${id}:`, error);
        throw new Error(`No se pudo eliminar el documento: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
};
