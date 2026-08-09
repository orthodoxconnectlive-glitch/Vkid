import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { SupportedLanguage } from '../types';
import { getTranslation } from '../data/translations';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { soundFx } from '../utils/soundAndTTS';

interface AuthModalProps {
  currentLanguage: SupportedLanguage;
}

export const AuthModal: React.FC<AuthModalProps> = ({ currentLanguage }) => {
  const { authModalOpen, authModalInitialTab, closeAuthModal, login, signUp } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const t = (key: string, fallback?: string) => getTranslation(currentLanguage, key, fallback);

  useEffect(() => {
    if (authModalOpen) {
      setActiveTab(authModalInitialTab);
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [authModalOpen, authModalInitialTab]);

  if (!authModalOpen) return null;

  const handleTabSwitch = (tab: 'login' | 'register') => {
    soundFx.playPop();
    setActiveTab(tab);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const validateForm = () => {
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return false;
    }

    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return false;
    }

    if (activeTab === 'register') {
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match. Please check again.');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playPop();
    setErrorMsg('');
    setSuccessMsg('');

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (activeTab === 'login') {
        const result = await login(email, password);
        if (!result.success) {
          setErrorMsg(result.error || 'Invalid credentials. Please try again.');
          setIsSubmitting(false);
        } else {
          soundFx.playSuccess();
          setSuccessMsg('Welcome back! Successfully logged in.');
          setTimeout(() => {
            setIsSubmitting(false);
            closeAuthModal();
          }, 600);
        }
      } else {
        const result = await signUp(email, password, fullName);
        if (!result.success) {
          setErrorMsg(result.error || 'Could not create account. Please check details.');
          setIsSubmitting(false);
        } else {
          soundFx.playSuccess();
          if (result.message) {
            setSuccessMsg(result.message);
          } else {
            setSuccessMsg('Account created successfully! Welcome to VKid.');
          }
          setTimeout(() => {
            setIsSubmitting(false);
            closeAuthModal();
          }, 1000);
        }
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'An unexpected error occurred.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full border-4 border-amber-300 shadow-2xl relative my-auto p-5 sm:p-7 text-slate-800">
        {/* Close Button */}
        <button
          onClick={() => {
            soundFx.playPop();
            closeAuthModal();
          }}
          disabled={isSubmitting}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-400 to-indigo-500 p-0.5 mx-auto mb-3 shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center font-black text-amber-500 text-2xl tracking-tight">
              VK
            </div>
          </div>
          <h3 className="font-black text-2xl text-slate-900 tracking-tight">
            {activeTab === 'login' ? 'Parent Account Login' : 'Join VKid Platform'}
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Safe, verified parental access with Supabase Auth security.
          </p>
        </div>

        {/* Auth Tabs (Login / Register) */}
        <div className="flex bg-slate-100 p-1 rounded-2xl mb-5 border border-slate-200">
          <button
            type="button"
            onClick={() => handleTabSwitch('login')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'login'
                ? 'bg-amber-500 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Log In</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabSwitch('register')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'register'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Account</span>
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name field (Register only) */}
          {activeTab === 'register' && (
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">
                Full Name / Parent Alias *
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Sarah Connor"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-9 pr-3 text-xs font-bold focus:outline-none focus:border-amber-500 transition-colors"
                  required={activeTab === 'register'}
                />
              </div>
            </div>
          )}

          {/* Email field */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="parent@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-9 pr-3 text-xs font-bold focus:outline-none focus:border-amber-500 transition-colors"
                required
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-9 pr-10 text-xs font-bold focus:outline-none focus:border-amber-500 transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password field (Register only) */}
          {activeTab === 'register' && (
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-9 pr-3 text-xs font-bold focus:outline-none focus:border-amber-500 transition-colors"
                  required
                />
              </div>
            </div>
          )}

          {/* Quick Demo Credentials Hint */}
          <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-[11px] text-amber-900 font-medium flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Demo Admin: <strong>orthodoxconnect.live@gmail.com</strong>
              </span>
            </span>
            <button
              type="button"
              onClick={() => {
                soundFx.playPop();
                setEmail('orthodoxconnect.live@gmail.com');
                setPassword('superadmin123');
              }}
              className="bg-amber-200 hover:bg-amber-300 text-amber-900 font-extrabold text-[10px] px-2 py-1 rounded-lg transition-colors"
            >
              Fill Demo
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full font-extrabold text-xs py-3 rounded-2xl shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 ${
              activeTab === 'login'
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating with Supabase...</span>
              </>
            ) : activeTab === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In to Account</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create Parent Account</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
