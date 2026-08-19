import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { SUPER_ADMIN_EMAIL, checkIsAdmin } from '../components/AdminModerationModal';
import { Classroom } from '../types';

export const DEFAULT_EDUCATOR_CLASSES: Classroom[] = [
  {
    id: 'class_1',
    name: 'Class 1A - Primary Bible & Morals',
    grade: '1st Grade',
    studentPin: '1234',
    assignedPlaylists: ['Orthodox Hymns', 'Bible Animated Stories', 'Moral Lessons'],
    studentCount: 18,
  },
  {
    id: 'class_2',
    name: 'Class 2B - Wonders of Creation & Science',
    grade: '2nd Grade',
    studentPin: '5678',
    assignedPlaylists: ['Creation & Science', 'Interactive Logic Games'],
    studentCount: 22,
  },
];

export interface AppUser {
  id: string;
  email: string;
  fullName?: string;
  role: 'parent' | 'educator' | 'admin' | 'super_admin' | string;
  schoolName?: string;
  classes?: Classroom[];
  activeClassId?: string;
  presentationMode?: boolean;
  app_metadata?: {
    role?: string;
    [key: string]: any;
  };
  user_metadata?: {
    role?: string;
    schoolName?: string;
    classes?: Classroom[];
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
  authModalAccountType: 'parent' | 'educator';
  isPresentationMode: boolean;
  activeClass: Classroom | null;
  openAuthModal: (tab?: 'login' | 'register', accountType?: 'parent' | 'educator') => void;
  closeAuthModal: () => void;
  login: (
    email: string,
    pass: string,
    accountType?: 'parent' | 'educator'
  ) => Promise<{ success: boolean; error?: string; isEmailUnconfirmed?: boolean }>;
  signUp: (
    email: string,
    pass: string,
    fullName?: string,
    accountType?: 'parent' | 'educator',
    schoolName?: string
  ) => Promise<{ success: boolean; error?: string; message?: string; isEmailUnconfirmed?: boolean }>;
  resendVerificationEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateSchoolData: (schoolName: string, classes: Classroom[], activeClassId?: string) => void;
  togglePresentationMode: (enabled?: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalInitialTab, setAuthModalInitialTab] = useState<'login' | 'register'>('login');
  const [authModalAccountType, setAuthModalAccountType] = useState<'parent' | 'educator'>('parent');
  const [isPresentationMode, setIsPresentationMode] = useState<boolean>(false);

  // Helper to load educator classes from localStorage fallback
  const getStoredClasses = (userId: string): Classroom[] => {
    try {
      const stored = localStorage.getItem(`vkid_classes_${userId}`);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Could not parse stored classes', e);
    }
    return DEFAULT_EDUCATOR_CLASSES;
  };

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
            const userRole = isAdmin ? 'admin' : (userMetaRole || 'parent');

            const schoolName = sbUser.user_metadata?.schoolName || (userRole === 'educator' ? 'St. Mark Orthodox Academy' : undefined);
            const classes = sbUser.user_metadata?.classes || (userRole === 'educator' ? getStoredClasses(sbUser.id) : undefined);

            setUser({
              id: sbUser.id,
              email: userEmail,
              fullName: sbUser.user_metadata?.full_name || userEmail.split('@')[0],
              role: userRole,
              schoolName,
              classes,
              activeClassId: classes?.[0]?.id,
              presentationMode: false,
              app_metadata: sbUser.app_metadata,
              user_metadata: sbUser.user_metadata,
              avatarUrl: sbUser.user_metadata?.avatar_url,
            });
          }
        } catch (err) {
          console.warn('Error fetching Supabase auth session:', err);
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
          const userRole = isAdmin ? 'admin' : (userMetaRole || 'parent');

          const schoolName = sbUser.user_metadata?.schoolName || (userRole === 'educator' ? 'St. Mark Orthodox Academy' : undefined);
          const classes = sbUser.user_metadata?.classes || (userRole === 'educator' ? getStoredClasses(sbUser.id) : undefined);

          setUser({
            id: sbUser.id,
            email: userEmail,
            fullName: sbUser.user_metadata?.full_name || userEmail.split('@')[0],
            role: userRole,
            schoolName,
            classes,
            activeClassId: classes?.[0]?.id,
            presentationMode: false,
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

  const openAuthModal = (
    tab: 'login' | 'register' = 'login',
    accountType: 'parent' | 'educator' = 'parent'
  ) => {
    setAuthModalInitialTab(tab);
    setAuthModalAccountType(accountType);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const login = async (
    email: string,
    pass: string,
    accountType: 'parent' | 'educator' = 'parent'
  ): Promise<{ success: boolean; error?: string; isEmailUnconfirmed?: boolean }> => {
    const cleanEmail = email.trim().toLowerCase();

    if (!supabase) {
      return {
        success: false,
        error: 'Supabase authentication is not configured. Please verify your environment variables.',
      };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: pass,
    });

    if (error) {
      const errMsg = error.message || '';
      const isUnconfirmed =
        errMsg.toLowerCase().includes('confirm') ||
        errMsg.toLowerCase().includes('not confirmed') ||
        errMsg.toLowerCase().includes('unverified') ||
        (error as any).code === 'email_not_confirmed';

      return {
        success: false,
        error: isUnconfirmed ? 'Please verify your email address before signing in.' : errMsg,
        isEmailUnconfirmed: isUnconfirmed,
      };
    }

    if (data.user) {
      const userEmail = data.user.email || cleanEmail;
      const appMetaRole = data.user.app_metadata?.role;
      const userMetaRole = data.user.user_metadata?.role;
      const isAdmin = checkIsAdmin(userEmail, (data.user as any).role || userMetaRole, appMetaRole);
      const effectiveRole = isAdmin ? 'admin' : (userMetaRole || accountType);

      const schoolName = data.user.user_metadata?.schoolName || (effectiveRole === 'educator' ? 'St. Mark Orthodox Academy' : undefined);
      const classes = data.user.user_metadata?.classes || (effectiveRole === 'educator' ? getStoredClasses(data.user.id) : undefined);

      setUser({
        id: data.user.id,
        email: userEmail,
        fullName: data.user.user_metadata?.full_name || userEmail.split('@')[0],
        role: effectiveRole,
        schoolName,
        classes,
        activeClassId: classes?.[0]?.id,
        presentationMode: false,
        app_metadata: data.user.app_metadata,
        user_metadata: data.user.user_metadata,
        avatarUrl: data.user.user_metadata?.avatar_url,
      });
      return { success: true };
    }

    return { success: false, error: 'Authentication failed. Please check your credentials.' };
  };

  const signUp = async (
    email: string,
    pass: string,
    fullName?: string,
    accountType: 'parent' | 'educator' = 'parent',
    schoolNameInput?: string
  ): Promise<{ success: boolean; error?: string; message?: string; isEmailUnconfirmed?: boolean }> => {
    const cleanEmail = email.trim().toLowerCase();
    const assignedRole = accountType === 'educator' ? 'educator' : 'parent';
    const schoolName = assignedRole === 'educator' ? (schoolNameInput || 'St. Mark Orthodox Academy') : undefined;
    const classes = assignedRole === 'educator' ? DEFAULT_EDUCATOR_CLASSES : undefined;

    if (!supabase) {
      return {
        success: false,
        error: 'Supabase authentication is not configured. Please verify your environment variables.',
      };
    }

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: pass,
      options: {
        data: {
          full_name: fullName || cleanEmail.split('@')[0],
          role: assignedRole,
          schoolName,
          classes,
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.user) {
      // Check if email confirmation is required (session might be null if email confirmation is enabled in Supabase)
      if (data.user && !data.session) {
        return {
          success: true,
          message: 'Account created! Please check your email inbox to confirm your address before signing in.',
          isEmailUnconfirmed: true,
        };
      }

      const isAdmin = checkIsAdmin(cleanEmail, assignedRole);
      const effectiveRole = isAdmin ? 'admin' : assignedRole;

      const appUserData: AppUser = {
        id: data.user.id,
        email: cleanEmail,
        fullName: fullName || cleanEmail.split('@')[0],
        role: effectiveRole,
        schoolName,
        classes,
        activeClassId: classes?.[0]?.id,
        presentationMode: false,
        app_metadata: data.user.app_metadata,
        user_metadata: data.user.user_metadata,
      };

      setUser(appUserData);
      return { success: true, message: `Account created for ${fullName || cleanEmail}! Welcome to ${assignedRole === 'educator' ? 'School Educator Portal' : 'VKid Platform'}.` };
    }

    return { success: true, message: 'Registration received! Please check your email for confirmation.' };
  };

  const resendVerificationEmail = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!supabase) {
      return { success: false, error: 'Supabase authentication is not configured.' };
    }

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: cleanEmail,
      });

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to resend verification email.' };
    }
  };

  const logout = async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Sign out error:', err);
      }
    }
    setUser(null);
    setIsPresentationMode(false);
    localStorage.removeItem('vkid_auth_user');
  };

  const updateSchoolData = (
    schoolName: string,
    classes: Classroom[],
    activeClassId?: string
  ) => {
    if (!user) return;
    const updatedUser: AppUser = {
      ...user,
      schoolName,
      classes,
      activeClassId: activeClassId || activeClass || classes[0]?.id,
    };
    setUser(updatedUser);
    localStorage.setItem(`vkid_classes_${user.id}`, JSON.stringify(classes));

    // Try updating Supabase metadata async if available
    if (supabase && user.id) {
      supabase.auth.updateUser({
        data: { schoolName, classes },
      }).catch((err) => console.warn('Could not sync school data to Supabase:', err));
    }
  };

  const togglePresentationMode = (enabled?: boolean) => {
    setIsPresentationMode((prev) => (enabled !== undefined ? enabled : !prev));
  };

  const activeClass = user?.classes?.find((c) => c.id === user.activeClassId) || user?.classes?.[0] || null;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        authModalOpen,
        authModalInitialTab,
        authModalAccountType,
        isPresentationMode,
        activeClass,
        openAuthModal,
        closeAuthModal,
        login,
        signUp,
        resendVerificationEmail,
        logout,
        updateSchoolData,
        togglePresentationMode,
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
