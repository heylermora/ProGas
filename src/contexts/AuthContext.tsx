// AuthContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, fetchAllData } from "apiConfig"; // el mismo auth que usas en authService

export type AppRole = 'admin' | 'colaborador' | 'customer';

type UserProfile = {
  id?: string;
  userId?: string;
  roles?: AppRole[];
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setRoles([]);

      if (firebaseUser) {
        try {
          const profiles = await fetchAllData<UserProfile>(
            'users',
            { searchFields: ['userId'], searchTerm: [firebaseUser.uid] },
            1
          );
          setRoles(profiles[0]?.roles || []);
        } catch (error) {
          console.error('[AuthContext] No se pudieron cargar los roles del usuario:', error);
        }
      }

      setLoading(false);
    });

    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{ user, roles, loading, hasRole: (allowedRoles) => {
      if (!allowedRoles?.length) return !!user;
      return allowedRoles.some((role) => roles.includes(role));
    } }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
