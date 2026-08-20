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
  GraduationCap,
  Building2,
  Users,
  Send,
  KeyRound,
  Sparkles,
} from 'lucide-react';
import { soundFx } from '../utils/soundAndTTS';

interface AuthModalProps {
  currentLanguage: SupportedLanguage;
}

export const AuthModal: React.FC<AuthModalProps> = ({ currentLanguage }) => {
  const {
    authModalOpen,
    authModalInitialTab,
    authModalAccountType,
    closeAuthModal,
    login,
    signUp,
    resendVerificationEmail,
    resetPassword,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [accountType, setAccountType] = useState<'parent' | 'educator'>('parent');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [schoolName, setSchoolName] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isEmailUnconfirmed, setIsEmailUnconfirmed] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resetSuccessMsg, setResetSuccessMsg] = useState('');

  const t = (key: string, fallback?: string) => getTranslation(currentLanguage, key, fallback);

  useEffect(() => {
    if (authModalOpen) {
      setActiveTab(authModalInitialTab);
      setAccountType(authModalAccountType || 'parent');
      setErrorMsg('');
      setSuccessMsg('');
      setIsEmailUnconfirmed(false);
      setResendSuccess(false);
      setResetSuccessMsg('');
    }
  }, [authModalOpen, authModalInitialTab, authModalAccountType]);

  if (!authModalOpen) return null;

  const handleTabSwitch = (tab: 'login' | 'register') => {
    soundFx.playPop();
    setActiveTab(tab);
    setErrorMsg('');
    setSuccessMsg('');
    setIsEmailUnconfirmed(false);
    setResendSuccess(false);
    setResetSuccessMsg('');
  };

  const handleAccountTypeChange = (type: 'parent' | 'educator') => {
    soundFx.playPop();
    setAccountType(type);
    setErrorMsg('');
    setSuccessMsg('');
    setIsEmailUnconfirmed(false);
    setResendSuccess(false);
    setResetSuccessMsg('');
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
      if (accountType === 'educator' && !schoolName.trim()) {
        setErrorMsg('Please enter your School or Institution name.');
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
    setIsEmailUnconfirmed(false);
    setResendSuccess(false);
    setResetSuccessMsg('');

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (activeTab === 'login') {
        const result = await login(email, password, accountType);
        if (!result.success) {
          if (result.isEmailUnconfirmed) {
            setIsEmailUnconfirmed(true);
            setErrorMsg('Your email has not been verified yet. Please confirm your email or resend verification.');
          } else {
            setErrorMsg(result.error || 'Invalid credentials. Please try again.');
          }
          setIsSubmitting(false);
        } else {
          soundFx.playSuccess();
          setSuccessMsg(`Welcome back! Logged in to ${accountType === 'educator' ? 'Educator Portal' : 'Parent Account'}.`);
          setTimeout(() => {
            setIsSubmitting(false);
            closeAuthModal();
          }, 600);
        }
      } else {
        const result = await signUp(email, password, fullName, accountType, schoolName);
        if (!result.success) {
          setErrorMsg(result.error || 'Could not create account. Please check details.');
          setIsSubmitting(false);
        } else {
          soundFx.playSuccess();
          if (result.isEmailUnconfirmed) {
            setIsEmailUnconfirmed(true);
            setSuccessMsg(result.message || 'Account created! Please verify your email address before signing in.');
          } else {
            setSuccessMsg(result.message || `Account created successfully! Welcome to ${accountType === 'educator' ? 'School Educator Portal' : 'VKid Platform'}.`);
            setTimeout(() => {
              setIsSubmitting(false);
              closeAuthModal();
            }, 1200);
          }
          setIsSubmitting(false);
        }
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'An unexpected error occurred.');
    }
  };

  const handleResendVerification = async () => {
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter your email address above to resend verification.');
      return;
    }

    soundFx.playPop();
    setIsResending(true);
    setErrorMsg('');

    try {
      const res = await resendVerificationEmail(email);
      if (res.success) {
        soundFx.playSuccess();
        setResendSuccess(true);
        setSuccessMsg('Verification email resent! Please check your inbox and spam folder.');
      } else {
        setErrorMsg(res.error || 'Could not resend verification email. Please try again later.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to resend verification email.');
    } finally {
      setIsResending(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter your registered email address in the field above first.');
      return;
    }

    soundFx.playPop();
    setIsResettingPassword(true);
    setErrorMsg('');
    setResetSuccessMsg('');

    try {
      const res = await resetPassword(email);
      if (res.success) {
        soundFx.playSuccess();
        setResetSuccessMsg(`Password reset email sent to ${email}. Please check your inbox.`);
      } else {
        setErrorMsg(res.error || 'Could not send password reset email. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send password reset email.');
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full border-4 border-amber-300 shadow-2xl relative my-auto p-5 sm:p-7 text-slate-800">
        {/* Close Button */}
        <button
          type="button"
          tabIndex={0}
          onClick={() => {
            soundFx.playPop();
            closeAuthModal();
          }}
          disabled={isSubmitting}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors disabled:opacity-50 focus:outline-none focus:ring-4 focus:ring-amber-400 cursor-pointer"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-400 to-indigo-500 p-0.5 mx-auto mb-2 shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center font-black text-amber-500 text-2xl tracking-tight">
              {accountType === 'educator' ? <GraduationCap className="w-8 h-8 text-indigo-600" /> : 'VK'}
            </div>
          </div>
          <h3 className="font-black text-2xl text-slate-900 tracking-tight">
            {accountType === 'educator'
              ? activeTab === 'login' ? 'School / Educator Login' : 'Educator Portal Register'
              : activeTab === 'login' ? 'Parent Account Login' : 'Join VKid Platform'}
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {accountType === 'educator'
              ? 'Manage classroom playlists, student access & presentation modes.'
              : 'Safe, verified parental access & account security.'}
          </p>
        </div>

        {/* Account Type Selector (Parent vs Educator) */}
        <div className="bg-slate-100 p-1 rounded-2xl mb-4 flex border border-slate-200 gap-1">
          <button
            type="button"
            tabIndex={0}
            onClick={() => handleAccountTypeChange('parent')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400 ${
              accountType === 'parent'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Parent Account</span>
          </button>

          <button
            type="button"
            tabIndex={0}
            onClick={() => handleAccountTypeChange('educator')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              accountType === 'educator'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>School / Educator</span>
          </button>
        </div>

        {/* Auth Tabs (Login / Register) */}
        <div className="flex bg-slate-50 p-1 rounded-xl mb-4 border border-slate-200">
          <button
            type="button"
            tabIndex={0}
            onClick={() => handleTabSwitch('login')}
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400 ${
              activeTab === 'login'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Log In</span>
          </button>

          <button
            type="button"
            tabIndex={0}
            onClick={() => handleTabSwitch('register')}
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400 ${
              activeTab === 'register'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </button>
        </div>

        {/* Unconfirmed Email Notice & Clickable Resend Action */}
        {isEmailUnconfirmed && (
          <div className="mb-4 p-3.5 bg-amber-50 border-2 border-amber-300 rounded-2xl text-amber-900 text-xs font-bold space-y-2.5 animate-in fade-in">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <span className="block font-black text-amber-950">Email Verification Required</span>
                <span className="font-medium text-[11px] text-amber-800">
                  Your account requires email verification before signing in. Please check your inbox or click below to receive a new link.
                </span>
              </div>
            </div>
            {!resendSuccess ? (
              <button
                type="button"
                tabIndex={0}
                onClick={handleResendVerification}
                disabled={isResending}
                className="w-full flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-black text-xs py-2.5 px-3 rounded-xl transition-all shadow-sm focus:outline-none focus:ring-4 focus:ring-amber-400 cursor-pointer disabled:opacity-50"
              >
                {isResending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Resending Verification Email...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Resend Verification Email</span>
                  </>
                )}
              </button>
            ) : (
              <div className="p-2.5 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-900 text-[11px] font-extrabold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verification email resent! Please check your inbox and spam folder.</span>
              </div>
            )}
          </div>
        )}

        {/* Password Reset Confirmation Alert */}
        {resetSuccessMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{resetSuccessMsg}</span>
          </div>
        )}

        {/* Standard Error Alert */}
        {errorMsg && !isEmailUnconfirmed && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Standard Success Alert */}
        {successMsg && !isEmailUnconfirmed && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Full Name field (Register only) */}
          {activeTab === 'register' && (
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">
                {accountType === 'educator' ? 'Teacher / Educator Full Name *' : 'Full Name / Parent Alias *'}
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  tabIndex={0}
                  placeholder={accountType === 'educator' ? 'e.g. Ms. Clara Oswald' : 'e.g. Sarah Connor'}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 pl-9 pr-3 text-xs font-bold focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 transition-colors"
                  required={activeTab === 'register'}
                />
              </div>
            </div>
          )}

          {/* School Name field (Educator Register only) */}
          {activeTab === 'register' && accountType === 'educator' && (
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">
                School / Institution Name *
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  tabIndex={0}
                  placeholder="e.g. St. Mark Orthodox Academy"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 pl-9 pr-3 text-xs font-bold focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 transition-colors"
                  required
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
                tabIndex={0}
                placeholder={accountType === 'educator' ? 'teacher@school.edu' : 'parent@example.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 pl-9 pr-3 text-xs font-bold focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-amber-400 transition-colors"
                required
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-extrabold text-slate-700">
                Password *
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                tabIndex={0}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 pl-9 pr-10 text-xs font-bold focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-amber-400 transition-colors"
                required
              />
              <button
                type="button"
                tabIndex={0}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 focus:outline-none focus:ring-2 focus:ring-amber-400 rounded-md cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Forgot password button below password field in Login mode */}
            {activeTab === 'login' && (
              <div className="flex justify-end mt-1.5">
                <button
                  type="button"
                  tabIndex={0}
                  onClick={handleForgotPassword}
                  disabled={isResettingPassword}
                  className="text-[11px] font-bold text-amber-600 hover:text-amber-800 hover:underline flex items-center gap-1 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 rounded px-1 disabled:opacity-50"
                >
                  <KeyRound className="w-3 h-3" />
                  <span>
                    {isResettingPassword ? 'Sending reset link...' : 'Forgot password?'}
                  </span>
                </button>
              </div>
            )}
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
                  tabIndex={0}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 pl-9 pr-3 text-xs font-bold focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 transition-colors"
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            tabIndex={0}
            disabled={isSubmitting}
            className={`w-full font-extrabold text-xs py-3 rounded-2xl shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-4 focus:ring-amber-400 ${
              accountType === 'educator'
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                : activeTab === 'login'
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying credentials...</span>
              </>
            ) : activeTab === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In to {accountType === 'educator' ? 'Educator Portal' : 'Parent Account'}</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create {accountType === 'educator' ? 'Educator Account' : 'Parent Account'}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
