import { createUserWithEmailAndPassword, deleteUser, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, addData } from "apiConfig";

// Función para crear un nuevo usuario
export const registerUser = async (email: string, password: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  const user = userCredential.user;

  try {
    // The registration is not complete until its authorization profile exists.
    await addData("users", {
      userId: user.uid,
      name: user.displayName || "",
      roles: ["customer"],
      active: true,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    // Avoid leaving an Authentication account without its profile.
    await deleteUser(user);
    throw error;
  }

  return user;
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

export const logout = async () => {
  await signOut(auth);
};

export const requestPasswordReset = (email: string) =>
  sendPasswordResetEmail(auth, email.trim());
