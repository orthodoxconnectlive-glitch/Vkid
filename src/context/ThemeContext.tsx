import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'light' | 'dark' | 'playful';
export type Language = 'en' | 'ar';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    appName: 'VKid',
    tagline: 'Child-Safe Educational & Video Streaming Platform',
    feed: 'Explore Videos',
    library: 'My Library',
    rewards: 'Badges & Rewards',
    parentDashboard: 'Parent Control Panel',
    profile: 'Kid Profile',
    notifications: 'Alerts',
    searchVideos: 'Search safe videos, channels, or topics...',
    uploadVideo: 'Upload Video',
    approved: 'Approved',
    pendingModeration: 'Pending Moderation',
    like: 'Favorite',
    share: 'Share',
    signOut: 'Sign Out',
    signIn: 'Sign In',
    signUp: 'Create Kids Account',
    language: 'Language',
    themeMode: 'Theme Mode',
    playful: 'Playful Yellow',
    dark: 'Dark Mode',
    light: 'Light Mode',
    arabic: 'العربية',
    english: 'English',
    parentalPin: 'Parental PIN',
    screenTimeLimit: 'Screen Time Limit',
    ttsEnabled: 'Read Aloud Voice',
  },
  ar: {
    appName: 'ڤي كيد - VKid',
    tagline: 'منصة آمنة وتعليمية لفيديوهات الأطفال',
    feed: 'استكشف الفيديوهات',
    library: 'مكتبتي',
    rewards: 'الأوسمة والجوائز',
    parentDashboard: 'لوحة التحكم للوالدين',
    profile: 'ملف الطفل',
    notifications: 'التنبيهات',
    searchVideos: 'ابحث عن فيديوهات آمنة وقنوات...',
    uploadVideo: 'رفع فيديو',
    approved: 'مقبول',
    pendingModeration: 'قيد المراجعة',
    like: 'المفضلة',
    share: 'مشاركة',
    signOut: 'تسجيل الخروج',
    signIn: 'تسجيل الدخول',
    signUp: 'إنشاء حساب جديد',
    language: 'اللغة',
    themeMode: 'المظهر',
    playful: 'أصفر مبهج',
    dark: 'الداكن',
    light: 'الفاتح',
    arabic: 'العربية',
    english: 'English',
    parentalPin: 'رمز أمان الوالدين',
    screenTimeLimit: 'وقت الشاشة المحدد',
    ttsEnabled: 'القارئ الصوتي',
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem('vkid_theme') as ThemeMode) || 'playful';
  });

  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('vkid_lang') as Language) || 'en';
  });

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    localStorage.setItem('vkid_theme', mode);
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('vkid_lang', lang);
  };

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-dark', 'theme-light', 'theme-playful', 'dark', 'light');
    if (theme === 'dark') {
      root.classList.add('dark', 'theme-dark');
    } else if (theme === 'playful') {
      root.classList.add('theme-playful');
    } else {
      root.classList.add('light', 'theme-light');
    }
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('lang', language);
    root.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, language, setLanguage, t }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
