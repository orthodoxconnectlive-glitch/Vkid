import React, { useState } from 'react';
import { Lock, X, KeyRound, HelpCircle, AlertCircle } from 'lucide-react';
import { soundFx, speakText } from '../../utils/soundAndTTS';

interface PinLockModalProps {
  currentPin: string;
  onSuccess: () => void;
  onClose: () => void;
}

export const PinLockModal: React.FC<PinLockModalProps> = ({ currentPin, onSuccess, onClose }) => {
  const [enteredPin, setEnteredPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [useMathChallenge, setUseMathChallenge] = useState(false);
  const [mathAnswer, setMathAnswer] = useState('');

  // Random adult math question
  const num1 = 7;
  const num2 = 8;
  const expectedMathResult = (num1 * num2).toString(); // "56"

  const handleDigitClick = (digit: string) => {
    soundFx.playPop();
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
    if (mathAnswer.trim() === expectedMathResult) {
      soundFx.playSuccess();
      onSuccess();
    } else {
      soundFx.playTryAgain();
      setErrorMsg(`Incorrect. ${num1} × ${num2} = ${expectedMathResult}`);
      setMathAnswer('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full border-4 border-rose-300 shadow-2xl relative text-slate-800">
        <button
          onClick={() => {
            soundFx.playPop();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          <X className="w-5 h-5 text-slate-600" />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="font-black text-2xl text-slate-900">Parental Control Lock</h3>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {useMathChallenge ? 'Solve the math problem to prove you are an adult' : 'Enter your 4-digit PIN to access parent settings'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-700 text-xs font-bold animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {!useMathChallenge ? (
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
            <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto mb-6">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  onClick={() => handleDigitClick(digit)}
                  className="py-3 text-2xl font-black rounded-2xl bg-slate-50 hover:bg-rose-100 text-slate-800 border-2 border-slate-200 transition-all active:scale-95"
                >
                  {digit}
                </button>
              ))}
              <button
                onClick={() => {
                  soundFx.playPop();
                  setEnteredPin('');
                }}
                className="py-3 text-xs font-black rounded-2xl bg-slate-100 text-slate-600 border-2 border-slate-200"
              >
                Clear
              </button>
              <button
                onClick={() => handleDigitClick('0')}
                className="py-3 text-2xl font-black rounded-2xl bg-slate-50 hover:bg-rose-100 text-slate-800 border-2 border-slate-200 active:scale-95"
              >
                0
              </button>
              <button
                onClick={() => {
                  soundFx.playPop();
                  setEnteredPin(enteredPin.slice(0, -1));
                }}
                className="py-3 text-xs font-black rounded-2xl bg-slate-100 text-slate-600 border-2 border-slate-200"
              >
                ⌫
              </button>
            </div>

            <div className="text-center pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  soundFx.playPop();
                  setUseMathChallenge(true);
                }}
                className="text-xs text-rose-600 hover:text-rose-700 font-extrabold underline flex items-center justify-center gap-1 mx-auto"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Forgot PIN? Use Adult Math Verification</span>
              </button>
            </div>
          </div>
        ) : (
          /* Adult Math Verification */
          <div className="space-y-4">
            <div className="bg-rose-50 rounded-2xl p-4 text-center border border-rose-200">
              <span className="text-xs font-extrabold text-rose-800 uppercase tracking-wider block mb-1">Adult Gate:</span>
              <p className="text-2xl font-black text-slate-900 mb-3">What is {num1} × {num2}?</p>
              <input
                type="number"
                placeholder="Enter answer"
                value={mathAnswer}
                onChange={(e) => setMathAnswer(e.target.value)}
                className="w-full text-center bg-white border-2 border-rose-300 rounded-xl py-2 text-xl font-black text-slate-800 focus:outline-none focus:border-rose-500"
              />
            </div>

            <button
              onClick={handleMathSubmit}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black text-sm py-3 rounded-xl shadow transition-all"
            >
              Verify Adult Access
            </button>

            <button
              onClick={() => {
                soundFx.playPop();
                setUseMathChallenge(false);
              }}
              className="w-full text-xs font-bold text-slate-500 py-1"
            >
              Back to PIN Pad
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
