import React, { useState, useEffect } from 'react';
import { ShieldCheck, X, AlertCircle, Lock, ExternalLink, Trash2, Settings, HelpCircle, CheckCircle2 } from 'lucide-react';
import { soundFx } from '../../utils/soundAndTTS';
import { useTvNavigation } from '../../hooks/useTvNavigation';

export interface ParentGateModalProps {
  title?: string;
  description?: string;
  reason?: 'external_link' | 'settings' | 'delete_account' | 'billing' | 'general';
  targetUrl?: string;
  onSuccess: () => void;
  onClose: () => void;
}

// Generate randomized adult math challenge (e.g., 8 x 7 = 56, 9 x 6 = 54, 7 x 9 = 63, 12 x 4 = 48)
function generateMathProblem() {
  const problems = [
    { n1: 9, n2: 7, op: '×', ans: 63 },
    { n1: 8, n2: 6, op: '×', ans: 48 },
    { n1: 7, n2: 8, op: '×', ans: 56 },
    { n1: 9, n2: 6, op: '×', ans: 54 },
    { n1: 8, n2: 9, op: '×', ans: 72 },
    { n1: 6, n2: 7, op: '×', ans: 42 },
    { n1: 12, n2: 4, op: '×', ans: 48 },
    { n1: 13, n2: 3, op: '×', ans: 39 },
    { n1: 15, n2: 4, op: '×', ans: 60 },
    { n1: 27, n2: 18, op: '+', ans: 45 },
    { n1: 34, n2: 29, op: '+', ans: 63 },
    { n1: 45, n2: 28, op: '+', ans: 73 },
  ];
  const chosen = problems[Math.floor(Math.random() * problems.length)];
  return chosen;
}

export const ParentGateModal: React.FC<ParentGateModalProps> = ({
  title = 'Grown-ups Only',
  description,
  reason = 'general',
  targetUrl,
  onSuccess,
  onClose,
}) => {
  const [problem, setProblem] = useState(generateMathProblem);
  const [userAnswer, setUserAnswer] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Pick default description based on reason
  const defaultDesc =
    description ||
    (reason === 'external_link'
      ? 'To protect children, a parent or guardian must verify their age before leaving the app to visit an external website.'
      : reason === 'delete_account'
      ? 'To protect your account and data, a parent or guardian must verify their age before deleting the account.'
      : reason === 'settings'
      ? 'Please ask a parent or adult guardian to solve this math problem to access parent controls and settings.'
      : 'Please ask a grown-up to solve the question below to continue.');

  // TV Remote & Hardware Back Key Listener
  useTvNavigation({
    onBack: () => {
      soundFx.playPop();
      onClose();
    },
    enabled: true,
  });

  const handleDigitPress = (digit: string) => {
    soundFx.playPop();
    if (userAnswer.length < 4) {
      setUserAnswer((prev) => prev + digit);
      setErrorMsg('');
    }
  };

  const handleClear = () => {
    soundFx.playPop();
    setUserAnswer('');
    setErrorMsg('');
  };

  const handleBackspace = () => {
    soundFx.playPop();
    setUserAnswer((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleVerify = () => {
    if (!userAnswer.trim()) {
      setErrorMsg('Please enter your answer first.');
      return;
    }

    setIsVerifying(true);
    const parsed = parseInt(userAnswer.trim(), 10);

    if (parsed === problem.ans) {
      soundFx.playSuccess();
      setErrorMsg('');
      setTimeout(() => {
        onSuccess();
        if (targetUrl && reason === 'external_link') {
          window.open(targetUrl, '_blank', 'noopener,noreferrer');
        }
      }, 250);
    } else {
      soundFx.playTryAgain();
      setErrorMsg('Incorrect answer. Please ask a grown-up to solve this.');
      setUserAnswer('');
      // Generate fresh problem on failure
      setProblem(generateMathProblem());
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full border-4 border-amber-400 shadow-2xl relative my-auto p-5 sm:p-6 text-slate-800 space-y-4">
        {/* Close Button */}
        <button
          type="button"
          tabIndex={0}
          onClick={() => {
            soundFx.playPop();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors focus:outline-none focus:ring-4 focus:ring-amber-400 cursor-pointer"
          title="Close Parental Gate"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Title */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-gradient-to-tr from-amber-400 to-orange-400 text-slate-900 rounded-2xl flex items-center justify-center mx-auto shadow-md border-2 border-amber-300">
            {reason === 'external_link' ? (
              <ExternalLink className="w-7 h-7" />
            ) : reason === 'delete_account' ? (
              <Trash2 className="w-7 h-7 text-rose-900" />
            ) : reason === 'settings' ? (
              <Settings className="w-7 h-7" />
            ) : (
              <ShieldCheck className="w-7 h-7" />
            )}
          </div>
          <div className="inline-block bg-amber-100 text-amber-900 text-[11px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full border border-amber-300">
            Parental Gate • Google Play Families Compliant
          </div>
          <h3 className="font-black text-xl sm:text-2xl text-slate-900 leading-tight">{title}</h3>
          <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-sm mx-auto">{defaultDesc}</p>
        </div>

        {/* Math Challenge Display */}
        <div className="bg-amber-50/80 rounded-2xl p-4 border-2 border-amber-300 text-center space-y-2">
          <span className="text-[11px] font-black text-amber-800 uppercase tracking-wider block">
            Adult Verification Question:
          </span>
          <div className="text-3xl font-black text-slate-900 tracking-wide font-mono">
            {problem.n1} {problem.op} {problem.n2} = ?
          </div>

          {/* Answer Input Display */}
          <div className="bg-white rounded-xl border-2 border-amber-400 py-2 px-4 max-w-[180px] mx-auto text-2xl font-black text-slate-900 tracking-widest min-h-[44px] flex items-center justify-center shadow-inner">
            {userAnswer ? (
              <span>{userAnswer}</span>
            ) : (
              <span className="text-slate-300 text-base font-normal">Answer</span>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-bold animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Number Keypad */}
        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              tabIndex={0}
              onClick={() => handleDigitPress(digit)}
              className="py-2.5 text-xl font-black rounded-xl bg-slate-50 hover:bg-amber-100 text-slate-800 border-2 border-slate-200 active:scale-95 transition-all focus:outline-none focus:ring-4 focus:ring-amber-400 cursor-pointer"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            tabIndex={0}
            onClick={handleClear}
            className="py-2.5 text-xs font-black rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border-2 border-slate-200 focus:outline-none focus:ring-4 focus:ring-slate-300 cursor-pointer"
          >
            Clear
          </button>
          <button
            type="button"
            tabIndex={0}
            onClick={() => handleDigitPress('0')}
            className="py-2.5 text-xl font-black rounded-xl bg-slate-50 hover:bg-amber-100 text-slate-800 border-2 border-slate-200 active:scale-95 transition-all focus:outline-none focus:ring-4 focus:ring-amber-400 cursor-pointer"
          >
            0
          </button>
          <button
            type="button"
            tabIndex={0}
            onClick={handleBackspace}
            className="py-2.5 text-xs font-black rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border-2 border-slate-200 focus:outline-none focus:ring-4 focus:ring-slate-300 cursor-pointer"
          >
            ⌫
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            tabIndex={0}
            onClick={() => {
              soundFx.playPop();
              onClose();
            }}
            className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-colors cursor-pointer focus:outline-none focus:ring-4 focus:ring-slate-300"
          >
            Cancel
          </button>
          <button
            type="button"
            tabIndex={0}
            onClick={handleVerify}
            disabled={isVerifying}
            className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-95 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer focus:outline-none focus:ring-4 focus:ring-amber-400 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Verify Adult</span>
          </button>
        </div>
      </div>
    </div>
  );
};
