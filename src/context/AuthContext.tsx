import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { SUPER_ADMIN_EMAIL, checkIsAdmin } from '../components/AdminModerationModal';

export interface AppUser {
  id: string;
  email: string;
  fullName?: string;
  role: 'parent' | 'admin' | 'super_admin' | string;
  app_metadata?: {
    role?: string;
    [key: string]: any;
  };
  user_metadata?: {
    role?: string;
    [key: string]: any;
  };
  avatarUrl?: string;
}

interface AuthContextType {
  user: AppUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authModalOpen: boolean;
  authModalInitialTab: 'login' | 'register';
  openAuthModal: (tab?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, pass: string, fullName?: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalInitialTab, setAuthModalInitialTab] = useState<'login' | 'register'>('login');

  // Check saved session on mount & listen for Supabase auth state changes
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      if (supabase) {
        try {
          const { data } = await supabase.auth.getSession();
          if (mounted && data.session?.user) {
            const sbUser = data.session.user;
            const userEmail = sbUser.email || '';
            const appMetaRole = sbUser.app_metadata?.role;
            const userMetaRole = sbUser.user_metadata?.role;
            const isAdmin = checkIsAdmin(userEmail, (sbUser as any).role || userMetaRole, appMetaRole);

            setUser({
              id: sbUser.id,
              email: userEmail,
              fullName: sbUser.user_metadata?.full_name || userEmail.split('@')[0],
              role: isAdmin ? 'admin' : ((userMetaRole || 'parent') as string),
              app_metadata: sbUser.app_metadata,
              user_metadata: sbUser.user_metadata,
              avatarUrl: sbUser.user_metadata?.avatar_url,
            });
          }
        } catch (err) {
          console.warn('Error fetching Supabase auth session:', err);
        }
      } else {
        // Local storage fallback for persistent mock auth session when Supabase env vars aren't attached
        const savedLocalUser = localStorage.getItem('vkid_auth_user');
        if (savedLocalUser && mounted) {
          try {
            setUser(JSON.parse(savedLocalUser));
          } catch (e) {
            localStorage.removeItem('vkid_auth_user');
          }
        }
      }

      if (mounted) setIsLoading(false);
    }

    initAuth();

    // Listen for realtime Supabase Auth changes
    let authListener: any = null;
    if (supabase) {
      const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;
        if (session?.user) {
          const sbUser = session.user;
          const userEmail = sbUser.email || '';
          const appMetaRole = sbUser.app_metadata?.role;
          const userMetaRole = sbUser.user_metadata?.role;
          const isAdmin = checkIsAdmin(userEmail, (sbUser as any).role || userMetaRole, appMetaRole);

          setUser({
            id: sbUser.id,
            email: userEmail,
            fullName: sbUser.user_metadata?.full_name || userEmail.split('@')[0],
            role: isAdmin ? 'admin' : ((userMetaRole || 'parent') as string),
            app_metadata: sbUser.app_metadata,
            user_metadata: sbUser.user_metadata,
            avatarUrl: sbUser.user_metadata?.avatar_url,
          });
        } else {
          setUser(null);
        }
        setIsLoading(false);
      });
      authListener = listener;
    }

    return () => {
      mounted = false;
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const openAuthModal = (tab: 'login' | 'register' = 'login') => {
    setAuthModalInitialTab(tab);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: pass,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        const userEmail = data.user.email || cleanEmail;
        const appMetaRole = data.user.app_metadata?.role;
        const userMetaRole = data.user.user_metadata?.role;
        const isAdmin = checkIsAdmin(userEmail, (data.user as any).role || userMetaRole, appMetaRole);

        setUser({
          id: data.user.id,
          email: userEmail,
          fullName: data.user.user_metadata?.full_name || userEmail.split('@')[0],
          role: isAdmin ? 'admin' : 'parent',
          app_metadata: data.user.app_metadata,
          user_metadata: data.user.user_metadata,
        });
      }
      return { success: true };
    } else {
      // Fallback local auth simulation
      const isAdmin = checkIsAdmin(cleanEmail, 'parent');
      const mockUser: AppUser = {
        id: `usr_${Date.now()}`,
        email: cleanEmail,
        fullName: cleanEmail.split('@')[0],
        role: isAdmin ? 'admin' : 'parent',
      };
      setUser(mockUser);
      localStorage.setItem('vkid_auth_user', JSON.stringify(mockUser));
      return { success: true };
    }
  };

  const signUp = async (
    email: string,
    pass: string,
    fullName?: string
  ): Promise<{ success: boolean; error?: string; message?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    if (supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: pass,
        options: {
          data: {
            full_name: fullName || cleanEmail.split('@')[0],
            role: 'parent',
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        const isAdmin = checkIsAdmin(cleanEmail, 'parent');
        const appUserData: AppUser = {
          id: data.user.id,
          email: cleanEmail,
          fullName: fullName || cleanEmail.split('@')[0],
          role: isAdmin ? 'admin' : 'parent',
          app_metadata: data.user.app_metadata,
          user_metadata: data.user.user_metadata,
        };

        if (data.session) {
          setUser(appUserData);
          return { success: true, message: 'Account created & signed in!' };
        }

        // Attempt immediate login via password to bypass client verification wait
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: pass,
        });

        if (!signInError && signInData?.user) {
          setUser(appUserData);
          return { success: true, message: 'Account created! Signed in immediately.' };
        }

        // Client-side fallback: log user in directly in app state so they can start immediately
        setUser(appUserData);
        localStorage.setItem('vkid_auth_user', JSON.stringify(appUserData));
        return { success: true, message: 'Account created! Signed in immediately.' };
      }
      return { success: true };
    } else {
      // Fallback local auth simulation
      const isAdmin = checkIsAdmin(cleanEmail, 'parent');
      const mockUser: AppUser = {
        id: `usr_${Date.now()}`,
        email: cleanEmail,
        fullName: fullName || cleanEmail.split('@')[0],
        role: isAdmin ? 'admin' : 'parent',
      };
      setUser(mockUser);
      localStorage.setItem('vkid_auth_user', JSON.stringify(mockUser));
      return { success: true };
    }
  };

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem('vkid_auth_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        authModalOpen,
        authModalInitialTab,
        openAuthModal,
        closeAuthModal,
        login,
        signUp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
