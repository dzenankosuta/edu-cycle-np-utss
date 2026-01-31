import { useState, useEffect, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User
} from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { auth, database } from '../../firebase-config';
import type { AdminUser } from '../../types';

interface AuthState {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
}

interface UseAuthReturn extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAdmin: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    if (!auth) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Firebase Auth nije inicijalizovan',
      }));
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Proveri da li je korisnik admin
        const isAdmin = await checkAdminStatus(user.uid);
        setState({
          user,
          isAdmin,
          isLoading: false,
          error: null,
        });
      } else {
        setState({
          user: null,
          isAdmin: false,
          isLoading: false,
          error: null,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const checkAdminStatus = async (uid: string): Promise<boolean> => {
    if (!database) return false;

    try {
      const adminRef = ref(database, `admins/${uid}`);
      const snapshot = await get(adminRef);

      if (snapshot.exists()) {
        const adminData = snapshot.val() as AdminUser;
        return adminData.role === 'admin';
      }
      return false;
    } catch (error) {
      console.error('Greška pri proveri admin statusa:', error);
      return false;
    }
  };

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    if (!auth) {
      setState(prev => ({
        ...prev,
        error: 'Firebase Auth nije inicijalizovan',
      }));
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const isAdmin = await checkAdminStatus(userCredential.user.uid);

      if (!isAdmin) {
        await signOut(auth);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Nemate administratorska prava',
        }));
        return false;
      }

      setState({
        user: userCredential.user,
        isAdmin: true,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (error: unknown) {
      let errorMessage = 'Došlo je do greške pri prijavi';

      if (error instanceof Error) {
        const errorCode = (error as { code?: string }).code;
        switch (errorCode) {
          case 'auth/invalid-email':
            errorMessage = 'Nevažeća email adresa';
            break;
          case 'auth/user-disabled':
            errorMessage = 'Korisnički nalog je onemogućen';
            break;
          case 'auth/user-not-found':
            errorMessage = 'Korisnik nije pronađen';
            break;
          case 'auth/wrong-password':
            errorMessage = 'Pogrešna lozinka';
            break;
          case 'auth/invalid-credential':
            errorMessage = 'Pogrešni podaci za prijavu';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Previše neuspelih pokušaja. Pokušajte ponovo kasnije.';
            break;
        }
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    if (!auth) return;

    try {
      await signOut(auth);
      setState({
        user: null,
        isAdmin: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Greška pri odjavi:', error);
      setState(prev => ({
        ...prev,
        error: 'Greška pri odjavi',
      }));
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    login,
    logout,
    clearError,
  };
}
