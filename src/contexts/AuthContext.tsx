// AuthContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, limit, onSnapshot, query, where } from "firebase/firestore";
import { auth, db } from "apiConfig"; // el mismo auth que usas en authService

export type AppRole = 'admin' | 'colaborador' | 'customer';

type UserProfile = {
  id?: string;
  userId?: string;
  roles?: AppRole[];
  active?: boolean;
};

type AuthContextType = {
  user: User | null;
  roles: AppRole[];
  loading: boolean;
  hasRole: (allowedRoles?: AppRole[]) => boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  roles: [],
  loading: true,
  hasRole: () => false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [accessEnabled, setAccessEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      unsubscribeProfile?.();
      unsubscribeProfile = undefined;
      setUser(firebaseUser);
      setRoles([]);
      setAccessEnabled(false);

      if (firebaseUser) {
        setLoading(true);
        const profileQuery = query(
          collection(db, 'users'),
          where('userId', '==', firebaseUser.uid),
          limit(1)
        );

        unsubscribeProfile = onSnapshot(profileQuery, (snapshot) => {
          const profile = snapshot.docs[0]?.data() as UserProfile | undefined;
          // Missing `active` keeps backwards compatibility with existing users;
          // explicitly disabled collaborators lose access as soon as their profile changes.
          const enabled = Boolean(profile) && profile.active !== false;
          setAccessEnabled(enabled);
          setRoles(enabled ? (profile.roles || []) : []);
          setLoading(false);
        }, (error) => {
          console.error('[AuthContext] No se pudieron cargar los roles del usuario:', error);
          setRoles([]);
          setAccessEnabled(false);
          setLoading(false);
        });
        return;
      }

      setLoading(false);
    });

    return () => {
      unsubscribeProfile?.();
      unsubscribeAuth();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, roles, loading, hasRole: (allowedRoles) => {
      if (!user || !accessEnabled) return false;
      if (!allowedRoles?.length) return true;
      return allowedRoles.some((role) => roles.includes(role));
    } }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
