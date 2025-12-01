import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, addData } from "apiConfig";

// Función para crear un nuevo usuario
export const registerUser = (email: string, password: string) => {
  return new Promise((resolve, reject) => {
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            const userId = user.uid; // Obtener el userId
            const name = user.displayName || ""; // Obtener el nombre, si está disponible

            // Agregar los datos del usuario
            addData("users", {
            userId: userId,
            name: name,  // Agregar el nombre del usuario
            roles: ["customer"],  // Guardamos los roles como una lista
            createdAt: new Date().toISOString(),
            })
        }).then((user) => {
            resolve(user);
        })
      .catch((error) => {
        reject(new Error(error.message));
      });
  });
};

// Función para iniciar sesión
export const loginUser = (email: string, password: string) => {
    return new Promise((resolve, reject) => {
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          // Aquí puedes manejar la lógica después de iniciar sesión, como almacenar el token de autenticación si es necesario
          resolve(user); // Devuelve los detalles del usuario autenticado
        })
        .catch((error) => {
          reject(new Error(error.message)); // Maneja los errores, como contraseñas incorrectas o problemas de red
        });
    });
  };