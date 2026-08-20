import React, { useState } from 'react';
import { Lock, X, KeyRound, HelpCircle, AlertCircle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { soundFx } from '../../utils/soundAndTTS';
import { useTvNavigation } from '../../hooks/useTvNavigation';

interface PinLockModalProps {
  currentPin: string;
  onSuccess: () => void;
  onClose: () => void;
}

function getRandomProblem() {
  const problems = [
    { n1: 9, n2: 7, op: '×', ans: 63 },
    { n1: 8, n2: 6, op: '×', ans: 48 },
    { n1: 7, n2: 8, op: '×', ans: 56 },
    { n1: 9, n2: 6, op: '×', ans: 54 },
    { n1: 8, n2: 9, op: '×', ans: 72 },
    { n1: 6, n2: 7, op: '×', ans: 42 },
    { n1: 12, n2: 4, op: '×', ans: 48 },
    { n1: 14, n2: 3, op: '×', ans: 42 },
    { n1: 15, n2: 4, op: '×', ans: 60 },
    { n1: 28, n2: 19, op: '+', ans: 47 },
    { n1: 35, n2: 28, op: '+', ans: 63 },
  ];
  return problems[Math.floor(Math.random() * problems.length)];
}

export const PinLockModal: React.FC<PinLockModalProps> = ({ currentPin, onSuccess, onClose }) => {
  const [enteredPin, setEnteredPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [useMathChallenge, setUseMathChallenge] = useState(true); // Default to Adult Math Gate for Google Play Families compliance
  const [mathProblem, setMathProblem] = useState(getRandomProblem);
  const [mathAnswer, setMathAnswer] = useState('');

  // TV remote & Android back button listener
  useTvNavigation({
    onBack: () => {
      soundFx.playPop();
      onClose();
    },
    enabled: true,
  });

  const handleDigitClick = (digit: string) => {
    soundFx.playPop();
    if (useMathChallenge) {
      if (mathAnswer.length < 4) {
        setMathAnswer((prev) => prev + digit);
        setErrorMsg('');
      }
      return;
    }

    if (enteredPin.length < 4) {
      const updated = enteredPin + digit;
      setEnteredPin(updated);
      setErrorMsg('');

      if (updated.length === 4) {
        if (updated === currentPin) {
          soundFx.playSuccess();
          onSuccess();
        } else {
          soundFx.playTryAgain();
          setErrorMsg('Incorrect PIN. Please try again (Default: 1234)');
          setEnteredPin('');
        }
      }
    }
  };

  const handleMathSubmit = () => {
    soundFx.playPop();
    const parsed = parseInt(mathAnswer.trim(), 10);
    if (parsed === mathProblem.ans) {
      soundFx.playSuccess();
      onSuccess();
    } else {
      soundFx.playTryAgain();
      setErrorMsg('Incorrect answer. Please ask an adult to verify.');
      setMathAnswer('');
      setMathProblem(getRandomProblem());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full border-4 border-rose-300 shadow-2xl relative text-slate-800 my-auto">
        <button
          type="button"
          tabIndex={0}
          onClick={() => {
            soundFx.playPop();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400"
          title="Close Parental Gate"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner border border-rose-200">
            <Lock className="w-7 h-7" />
          </div>
          <div className="inline-block bg-rose-100 text-rose-900 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-rose-300 mb-1">
            Grown-ups Only • Parental Gate
          </div>
          <h3 className="font-black text-2xl text-slate-900 leading-tight">Parental Verification</h3>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {useMathChallenge
              ? 'Solve the math problem to confirm you are an adult and access Parent Settings'
              : 'Enter your 4-digit PIN to access parent settings'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-700 text-xs font-bold animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {useMathChallenge ? (
          /* Adult Math Verification */
          <div className="space-y-4">
            <div className="bg-rose-50/80 rounded-2xl p-4 text-center border-2 border-rose-200 space-y-2">
              <span className="text-[11px] font-black text-rose-800 uppercase tracking-wider block">
                Adult Math Challenge:
              </span>
              <p className="text-3xl font-black text-slate-900 tracking-wide font-mono">
                {mathProblem.n1} {mathProblem.op} {mathProblem.n2} = ?
              </p>

              <div className="bg-white rounded-xl border-2 border-rose-300 py-2 px-4 max-w-[160px] mx-auto text-2xl font-black text-slate-900 min-h-[44px] flex items-center justify-center shadow-inner">
                {mathAnswer || <span className="text-slate-300 text-sm font-normal">Answer</span>}
              </div>
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  tabIndex={0}
                  onClick={() => handleDigitClick(digit)}
                  className="py-2.5 text-xl font-black rounded-xl bg-slate-50 hover:bg-rose-100 text-slate-800 border-2 border-slate-200 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-rose-400 cursor-pointer"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                tabIndex={0}
                onClick={() => {
                  soundFx.playPop();
                  setMathAnswer('');
                }}
                className="py-2.5 text-xs font-black rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border-2 border-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                Clear
              </button>
              <button
                type="button"
                tabIndex={0}
                onClick={() => handleDigitClick('0')}
                className="py-2.5 text-xl font-black rounded-xl bg-slate-50 hover:bg-rose-100 text-slate-800 border-2 border-slate-200 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-rose-400 cursor-pointer"
              >
                0
              </button>
              <button
                type="button"
                tabIndex={0}
                onClick={() => {
                  soundFx.playPop();
                  setMathAnswer((prev) => prev.slice(0, -1));
                }}
                className="py-2.5 text-xs font-black rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border-2 border-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                ⌫
              </button>
            </div>

            <button
              type="button"
              tabIndex={0}
              onClick={handleMathSubmit}
              className="w-full bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-black text-sm py-3 rounded-xl shadow transition-all cursor-pointer focus:outline-none focus:ring-4 focus:ring-rose-400 flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Verify Adult Access</span>
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                tabIndex={0}
                onClick={() => {
                  soundFx.playPop();
                  setUseMathChallenge(false);
                }}
                className="text-xs text-rose-600 hover:text-rose-700 font-bold underline flex items-center justify-center gap-1 mx-auto cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Switch to 4-Digit PIN Pad</span>
              </button>
            </div>
          </div>
        ) : (
          /* 4-Digit PIN Keypad */
          <div>
            {/* PIN Dots */}
            <div className="flex justify-center gap-4 mb-6">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full border-2 transition-all ${
                    idx < enteredPin.length ? 'bg-rose-500 border-rose-600 scale-125' : 'bg-slate-100 border-slate-300'
                  }`}
                />
              ))}
            </div>

            {/* Keypad Buttons */}
            <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto mb-6">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  tabIndex={0}
                  onClick={() => handleDigitClick(digit)}
                  className="py-3 text-2xl font-black rounded-2xl bg-slate-50 hover:bg-rose-100 text-slate-800 border-2 border-slate-200 transition-all active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                tabIndex={0}
                onClick={() => {
                  soundFx.playPop();
                  setEnteredPin('');
                }}
                className="py-3 text-xs font-black rounded-2xl bg-slate-100 text-slate-600 border-2 border-slate-200 cursor-pointer"
              >
                Clear
              </button>
              <button
                type="button"
                tabIndex={0}
                onClick={() => handleDigitClick('0')}
                className="py-3 text-2xl font-black rounded-2xl bg-slate-50 hover:bg-rose-100 text-slate-800 border-2 border-slate-200 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400"
              >
                0
              </button>
              <button
                type="button"
                tabIndex={0}
                onClick={() => {
                  soundFx.playPop();
                  setEnteredPin(enteredPin.slice(0, -1));
                }}
                className="py-3 text-xs font-black rounded-2xl bg-slate-100 text-slate-600 border-2 border-slate-200 cursor-pointer"
              >
                ⌫
              </button>
            </div>

            <div className="text-center pt-2 border-t border-slate-100">
              <button
                type="button"
                tabIndex={0}
                onClick={() => {
                  soundFx.playPop();
                  setUseMathChallenge(true);
                }}
                className="text-xs text-rose-600 hover:text-rose-700 font-extrabold underline flex items-center justify-center gap-1 mx-auto cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Use Adult Math Challenge</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
