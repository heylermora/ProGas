import { deleteApp, initializeApp } from 'firebase/app';
import { createUserWithEmailAndPassword, deleteUser, getAuth, UserCredential } from 'firebase/auth';
import { addData, fetchAllPages, firebaseConfig, updateData } from 'apiConfig';
import UserItem from 'interfaces/UserItem';

const COLLECTION = 'users';

export type CollaboratorInput = Pick<UserItem, 'name' | 'email' | 'active'> & { password: string };

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export class CollaboratorRollbackError extends Error {
  readonly userId: string;

  constructor(userId: string) {
    super(`No se pudo eliminar la cuenta de Authentication creada con UID ${userId}.`);
    this.name = 'CollaboratorRollbackError';
    this.userId = userId;
  }
}

const UserService = {
  getAll: async () => fetchAllPages<UserItem>(COLLECTION),

  createCollaborator: async (input: CollaboratorInput) => {
    // A secondary Auth instance prevents createUserWithEmailAndPassword from
    // replacing the administrator's current Firebase session.
    const secondaryApp = initializeApp(firebaseConfig, `collaborator-${Date.now()}`);
    const secondaryAuth = getAuth(secondaryApp);
    let credential: UserCredential | undefined;
    try {
      credential = await createUserWithEmailAndPassword(
        secondaryAuth,
        normalizeEmail(input.email),
        input.password,
      );
      await addData(COLLECTION, {
        userId: credential.user.uid,
        name: input.name.trim(),
        email: normalizeEmail(input.email),
        roles: ['colaborador'],
        active: input.active,
        createdAt: new Date().toISOString(),
      });
      return credential.user.uid;
    } catch (error) {
      // Avoid leaving an Auth account without its authorization profile when
      // Firestore rejects the second step of the operation.
      if (credential) {
        try {
          await deleteUser(credential.user);
        } catch (rollbackError) {
          console.error('[UserService] No se pudo revertir la cuenta de Authentication:', rollbackError);
          throw new CollaboratorRollbackError(credential.user.uid);
        }
      }
      throw error;
    } finally {
      await deleteApp(secondaryApp);
    }
  },

  updateCollaborator: async (id: string, data: Pick<UserItem, 'name' | 'active'>) =>
    updateData(COLLECTION, id, {
      name: data.name.trim(),
      active: data.active,
      updatedAt: new Date().toISOString(),
    }),
};

export default UserService;
