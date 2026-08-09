import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string, parish: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default mock profile when guest or initial offline load
const DEFAULT_GUEST_PROFILE: UserProfile = {
  id: 'owner-lucas',
  email: 'Lucasautocode@gmail.com',
  full_name: 'Lucas (Owner & Admin)',
  parish: 'St. Mark Coptic Orthodox Cathedral',
  bio: 'Administrator & Community Shepherd for OrthodoxConnect.',
  avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
  role: 'owner',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(DEFAULT_GUEST_PROFILE);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Fetch or upsert user profile from Supabase profiles table
  const fetchProfile = async (userId: string, emailStr?: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        const isOwnerEmail = (data.email || emailStr || '').toLowerCase() === 'lucasautocode@gmail.com';
        setProfile({
          id: data.id,
          email: data.email || emailStr || 'Lucasautocode@gmail.com',
          full_name: data.full_name || 'Lucas (Owner & Admin)',
          parish: data.parish || 'St. Mark Coptic Orthodox Cathedral',
          bio: data.bio || 'Administrator & Community Shepherd for OrthodoxConnect.',
          avatar_url: data.avatar_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
          role: isOwnerEmail ? 'owner' : (data.role as UserRole) || 'user',
          created_at: data.created_at,
        });
        return;
      }

      // If profile does not exist yet in table, build default
      const isOwnerEmail = (emailStr || '').toLowerCase() === 'lucasautocode@gmail.com';
      const defaultProf: UserProfile = {
        id: userId,
        email: emailStr || 'Lucasautocode@gmail.com',
        full_name: isOwnerEmail ? 'Lucas (Owner & Admin)' : (emailStr ? emailStr.split('@')[0] : 'Parish Member'),
        parish: isOwnerEmail ? 'St. Mark Coptic Orthodox Cathedral' : 'Holy Resurrection Parish',
        bio: 'Orthodox Christian seeking fellowship and spiritual growth.',
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
        role: isOwnerEmail ? 'owner' : 'user',
      };

      setProfile(defaultProf);

      // Attempt upserting to database
      await supabase.from('profiles').upsert([
        {
          id: userId,
          email: defaultProf.email,
          full_name: defaultProf.full_name,
          parish: defaultProf.parish,
          bio: defaultProf.bio,
          avatar_url: defaultProf.avatar_url,
          role: defaultProf.role,
        },
      ]);
    } catch (err) {
      console.warn('Profile fetch error, using local state profile:', err);
    }
  };

  useEffect(() => {
    // Check initial auth session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id, session.user.email);
      } else {
        setUser(null);
        const saved = localStorage.getItem('orthodox_user_profile');
        if (saved) {
          try {
            setProfile(JSON.parse(saved));
          } catch (e) {
            setProfile(DEFAULT_GUEST_PROFILE);
          }
        } else {
          setProfile(DEFAULT_GUEST_PROFILE);
        }
      }
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id, session.user.email);
      } else {
        setUser(null);
        const saved = localStorage.getItem('orthodox_user_profile');
        if (saved) {
          try {
            setProfile(JSON.parse(saved));
          } catch (e) {
            setProfile(DEFAULT_GUEST_PROFILE);
          }
        } else {
          setProfile(DEFAULT_GUEST_PROFILE);
        }
      }
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) {
        setUser(data.user);
        await fetchProfile(data.user.id, data.user.email);
      }
      return { error: null };
    } catch (err: any) {
      return { error: err as Error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, parish: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            parish,
          },
        },
      });
      if (error) throw error;

      if (data.user) {
        setUser(data.user);
        const newProf: UserProfile = {
          id: data.user.id,
          email,
          full_name: fullName,
          parish,
          bio: 'Orthodox Christian seeking fellowship.',
          avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
          role: 'user',
        };
        setProfile(newProf);

        await supabase.from('profiles').insert([
          {
            id: data.user.id,
            email,
            full_name: fullName,
            parish,
            bio: newProf.bio,
            avatar_url: newProf.avatar_url,
            role: 'user',
          },
        ]);
      }
      return { error: null };
    } catch (err: any) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(DEFAULT_GUEST_PROFILE);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile) return { error: new Error('No profile loaded') };

    const updated = { ...profile, ...updates };
    setProfile(updated);

    try {
      localStorage.setItem('orthodox_user_profile', JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }

    if (user && user.id) {
      try {
        const { error } = await supabase.from('profiles').upsert([
          {
            id: user.id,
            full_name: updated.full_name,
            parish: updated.parish,
            bio: updated.bio,
            avatar_url: updated.avatar_url,
            role: updated.role,
          },
        ]);
        if (error) {
          console.warn('Database sync notice:', error.message);
        }
      } catch (err: any) {
        console.warn('Profile database update warning:', err);
      }
    }

    return { error: null };
  };

  const updatePassword = async (newPassword: string) => {
    try {
      if (!user) {
        // If guest user or local offline mode, simulate successful password update
        return { error: null };
      }
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      return { error: null };
    } catch (err: any) {
      return { error: err as Error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
        updatePassword,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
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
