import { useCallback, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';
import api from '../api/axios';
import { AuthContext } from './auth-context';
import type { AuthContextValue, RegisterData, UpdateProfileData, User } from './auth-context';

function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string | string[] } | undefined;
    if (typeof data?.message === 'string') {
      return data.message;
    }
    if (Array.isArray(data?.message)) {
      return data.message.join(', ');
    }
    if (error.response?.status === 401) {
      return 'Email ou mot de passe incorrect.';
    }
  }
  return 'Une erreur est survenue. Veuillez réessayer.';
}

function readStoredUser(): User | null {
  try {
    const stored = localStorage.getItem('user');
    return stored ? (JSON.parse(stored) as User) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readStoredUser);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      // Le backend renvoie { success, message, data: { token, user } }
      const { token: newToken, user: newUser } = (response.data as {
        data: { token: string; user: User };
      }).data;
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
    } catch (error) {
      throw new Error(getApiErrorMessage(error), { cause: error });
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    try {
      await api.post('/auth/register', data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error), { cause: error });
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (data: UpdateProfileData) => {
    try {
      const response = await api.patch('/auth/me', data);
      const updated = (response.data as { data: User }).data;
      localStorage.setItem('user', JSON.stringify(updated));
      setUser(updated);
    } catch (error) {
      throw new Error(getApiErrorMessage(error), { cause: error });
    }
  }, []);

  const changePassword = useCallback(async (ancienPassword: string, nouveauPassword: string) => {
    try {
      await api.patch('/auth/me/password', {
        ancien_password: ancienPassword,
        nouveau_password: nouveauPassword,
      });
    } catch (error) {
      throw new Error(getApiErrorMessage(error), { cause: error });
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: token !== null,
      isAdmin: user?.role === 'admin',
      login,
      register,
      logout,
      updateProfile,
      changePassword,
    }),
    [user, token, login, register, logout, updateProfile, changePassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}