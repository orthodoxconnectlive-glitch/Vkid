import React, { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Share2, Copy, Check, X, UserPlus, Gift, Heart, Sparkles, MessageSquare, Download, QrCode } from 'lucide-react';
import { soundFx } from '../utils/soundAndTTS';
import { SupportedLanguage } from '../types';
import { getTranslation } from '../data/translations';

interface InviteFriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage?: SupportedLanguage;
}

export const InviteFriendsModal: React.FC<InviteFriendsModalProps> = ({
  isOpen,
  onClose,
  currentLanguage = 'en',
}) => {
  const [copied, setCopied] = useState(false);
  const qrCanvasRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Translation helper
  const t = (key: string, fallback: string) => getTranslation(currentLanguage, key, fallback);

  // App URL and invitation text
  const inviteUrl = 'https://videokid.live/';
  const shareMessage = `${t('invite_title', 'Join me on VKid')} — ${t('brand_tagline', 'Kids Safe • Play, Learn & Grow')} 🎈✨`;

  const handleCopyLink = async () => {
    soundFx.playPop();
    try {
      await navigator.clipboard.writeText(`${shareMessage}\n${inviteUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleNativeShare = async () => {
    soundFx.playPop();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'VKid - Safe Kids Platform',
          text: shareMessage,
          url: inviteUrl,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDownloadQr = () => {
    soundFx.playPop();
    try {
      const canvas = qrCanvasRef.current?.querySelector('canvas');
      if (canvas) {
        const url = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = 'vkid-invite-qr.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error('Failed to download QR code:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border-4 border-amber-300 relative text-slate-800 space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={() => {
            soundFx.playPop();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1.5 pt-1">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-400 to-indigo-500 p-1 mx-auto shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-amber-500">
              <UserPlus className="w-7 h-7 text-rose-500" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2">
            <span>{t('invite_title', 'Invite Friends & Parents')}</span>
            <Sparkles className="w-5 h-5 text-amber-500" />
          </h3>
          <p className="text-xs font-semibold text-slate-600 max-w-xs mx-auto leading-relaxed">
            {t('invite_subtitle', 'Share VKid with other families! Help kids learn, play, and explore safely together.')}
          </p>
        </div>

        {/* Reward Badge */}
        <div className="bg-gradient-to-r from-amber-100 via-orange-100 to-rose-100 rounded-2xl p-3 border border-amber-200 flex items-center gap-3 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-amber-400 text-white flex items-center justify-center shrink-0 shadow">
            <Gift className="w-4 h-4" />
          </div>
          <div>
            <span className="block font-black text-xs text-amber-900">{t('invite_badge_title', 'Family Pass Badge Unlocked!')}</span>
            <span className="text-[10px] sm:text-[11px] text-amber-800 font-medium">{t('invite_badge_desc', 'Inviting parents builds a safer online community for everyone.')}</span>
          </div>
        </div>

        {/* QR Code Display Card */}
        <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 text-center space-y-3">
          <div className="flex items-center justify-between text-xs font-black text-slate-700 px-1">
            <span className="flex items-center gap-1.5 text-indigo-900">
              <QrCode className="w-4 h-4 text-indigo-600" />
              <span>{t('scan_qr_title', 'Scan with Phone Camera')}</span>
            </span>
            <button
              onClick={handleDownloadQr}
              className="flex items-center gap-1 text-[11px] font-extrabold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-xl transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t('download_qr', 'Download QR')}</span>
            </button>
          </div>

          <div
            ref={qrCanvasRef}
            className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-inner w-fit mx-auto flex items-center justify-center"
          >
            <QRCodeCanvas
              value={inviteUrl}
              size={150}
              bgColor="#FFFFFF"
              fgColor="#0F172A"
              level="H"
              marginSize={1}
            />
          </div>

          <p className="text-[11px] font-bold text-slate-500">
            {t('scan_qr_desc', 'Point camera here to open VKid instantly')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Native Share (If supported) */}
          {typeof navigator !== 'undefined' && !!navigator.share && (
            <button
              onClick={handleNativeShare}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              <span>{t('share_invite_link', 'Share Invitation Link')}</span>
            </button>
          )}

          {/* Copy Link Input & Button */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
              <span>{t('invite_link', 'Invitation Link')}</span>
            </label>
            <div className="flex items-center gap-2 bg-slate-50 border-2 border-slate-200 rounded-2xl p-1.5 focus-within:border-amber-400 transition-all">
              <input
                type="text"
                readOnly
                value={inviteUrl}
                className="w-full bg-transparent px-2 text-xs font-bold text-slate-700 outline-none truncate"
              />
              <button
                onClick={handleCopyLink}
                className={`py-2 px-3 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-all active:scale-95 shrink-0 ${
                  copied
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{t('copied', 'Copied!')}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{t('copy', 'Copy')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="pt-2 text-center border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-400 flex items-center justify-center gap-1">
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
            <span>Thank you for sharing VKid Safe Kids!</span>
          </p>
        </div>
      </div>
    </div>
  );
};
