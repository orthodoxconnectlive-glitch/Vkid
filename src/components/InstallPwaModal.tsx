import React from 'react';
import { Download, Share, PlusSquare, X, Smartphone, CheckCircle } from 'lucide-react';
import { soundFx } from '../utils/soundAndTTS';
import { SupportedLanguage } from '../types';
import { getTranslation } from '../data/translations';

interface InstallPwaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstallDirect?: () => void;
  canInstallDirect: boolean;
  currentLanguage?: SupportedLanguage;
}

export const InstallPwaModal: React.FC<InstallPwaModalProps> = ({
  isOpen,
  onClose,
  onInstallDirect,
  canInstallDirect,
  currentLanguage = 'en',
}) => {
  if (!isOpen) return null;

  const t = (key: string, fallback: string) => getTranslation(currentLanguage, key, fallback);

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-4 border-amber-300 relative text-slate-800 space-y-5 animate-in zoom-in-95 duration-200">
        <button
          onClick={() => {
            soundFx.playPop();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 via-rose-400 to-indigo-500 p-1 mx-auto shadow-lg flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[20px] flex items-center justify-center text-3xl font-black text-amber-500">
              VK
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            Install VKid App 📱
          </h3>
          <p className="text-xs font-semibold text-slate-600 max-w-xs mx-auto leading-relaxed">
            Get instant access to VKid right from your Home Screen with no app store downloads required!
          </p>
        </div>

        {canInstallDirect ? (
          <div className="space-y-3">
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>One-tap fast installation ready!</span>
              </div>
              <p className="text-[11px] text-amber-800">
                Tap the button below to add VKid to your phone or desktop screen.
              </p>
            </div>

            <button
              onClick={() => {
                soundFx.playPop();
                if (onInstallDirect) onInstallDirect();
                onClose();
              }}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 text-white font-extrabold text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              <span>Install VKid Now</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-indigo-50/80 rounded-2xl p-4 border border-indigo-200 space-y-3">
              <h4 className="font-extrabold text-xs text-indigo-900 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-indigo-600" />
                <span>How to Install on iPhone / iPad (Safari):</span>
              </h4>
              <ol className="space-y-2 text-xs text-indigo-900 font-medium">
                <li className="flex items-start gap-2">
                  <span className="font-black bg-indigo-200 text-indigo-900 w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    1
                  </span>
                  <span>
                    Tap the <strong>Share</strong> button <Share className="w-3.5 h-3.5 inline text-indigo-600" /> at the bottom of Safari.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-black bg-indigo-200 text-indigo-900 w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    2
                  </span>
                  <span>
                    Scroll down and select <strong>Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 inline text-indigo-600" />.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-black bg-indigo-200 text-indigo-900 w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    3
                  </span>
                  <span>Tap <strong>Add</strong> in the top right corner. Done! 🎉</span>
                </li>
              </ol>
            </div>

            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 text-center">
              <p className="text-[11px] text-slate-600 font-semibold">
                On Chrome Android: Tap the 3 dots menu top-right ➔ tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
              </p>
            </div>

            <button
              onClick={() => {
                soundFx.playPop();
                onClose();
              }}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-2xl transition-all"
            >
              Got it!
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
