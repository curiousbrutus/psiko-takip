'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import {
  apiLogin,
  apiRegister,
  apiLogout,
  apiGetMe,
  getStoredUser,
  clearTokens,
  setStoredUser,
} from '@/lib/api-client';
import { Skeleton } from '@/components/ui/skeleton';
import { Logo } from '@/components/logo';

export interface AppUser {
  uid: string;
  userId: string;
  email: string;
  displayName?: string;
  role: string;
  connectedTherapistId?: string;
  connectedTherapist?: string;
  phone?: string;
  status?: string;
  photoURL?: string;
  profileSymbol?: string;
}

interface AuthContextType {
  user: AppUser | null;
  userData: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (email: string, password: string, displayName: string, role: string) => Promise<any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const buildAppUser = (data: any): AppUser => ({
    uid: data.userId || data.uid,
    userId: data.userId || data.uid,
    email: data.email,
    displayName: data.displayName,
    role: data.role,
    connectedTherapistId: data.connectedTherapistId,
    connectedTherapist: data.connectedTherapistId,
    phone: data.phone,
    status: data.status,
    photoURL: data.photoURL,
    profileSymbol: data.profileSymbol,
  });

  useEffect(() => {
    const initAuth = async () => {
      const storedUser = getStoredUser();
      if (storedUser) {
        try {
          const data = await apiGetMe();
          const appUser = buildAppUser(data.user);
          setUser(appUser);
          setStoredUser(data.user);
        } catch {
          clearTokens();
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiLogin(email, password);
    const appUser = buildAppUser(data.user);
    setUser(appUser);
    return data;
  }, []);

  const register = useCallback(async (email: string, password: string, displayName: string, role: string) => {
    const data = await apiRegister(email, password, displayName, role);
    const appUser = buildAppUser(data.user);
    setUser(appUser);
    return data;
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
        <Logo />
        <div className="mt-8 flex flex-col items-center gap-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, userData: user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
