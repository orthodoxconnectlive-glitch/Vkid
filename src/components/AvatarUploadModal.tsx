import React, { useState, useRef } from 'react';
import { X, Camera, Upload, Sparkles, Check, Image as ImageIcon } from 'lucide-react';
import { soundFx } from '../utils/soundAndTTS';
import { processImageFileToAvatar, isImageUrl, PRESET_AVATARS } from '../utils/avatarUtils';

interface AvatarUploadModalProps {
  currentAvatar: string;
  title?: string;
  onSelectAvatar: (avatarUrl: string) => void;
  onClose: () => void;
}

export const AvatarUploadModal: React.FC<AvatarUploadModalProps> = ({
  currentAvatar,
  title = 'Choose Profile Photo & Avatar',
  onSelectAvatar,
  onClose,
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState<string>(currentAvatar);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'upload' | 'presets'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      setErrorMsg('');
      soundFx.playPop();
      const base64Avatar = await processImageFileToAvatar(file, 250);
      setSelectedAvatar(base64Avatar);
      setIsProcessing(false);
    } catch (err: any) {
      console.error('Image processing error:', err);
      setErrorMsg(err.message || 'Failed to process image file');
      setIsProcessing(false);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      setErrorMsg('');
      soundFx.playPop();
      const base64Avatar = await processImageFileToAvatar(file, 250);
      setSelectedAvatar(base64Avatar);
      setIsProcessing(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to process dropped image');
      setIsProcessing(false);
    }
  };

  const handleSave = () => {
    soundFx.playPop();
    onSelectAvatar(selectedAvatar);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[150] flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full border-4 border-amber-300 shadow-2xl relative my-auto p-5 text-slate-800 space-y-4">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center font-black">
              <Camera className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900">{title}</h3>
          </div>
          <button
            onClick={() => {
              soundFx.playPop();
              onClose();
            }}
            className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Preview Circle */}
        <div className="flex flex-col items-center justify-center space-y-2 py-2">
          <div className="relative group">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-amber-400 bg-amber-100 shadow-lg overflow-hidden flex items-center justify-center text-5xl">
              {isImageUrl(selectedAvatar) ? (
                <img
                  src={selectedAvatar}
                  alt="Profile Avatar Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{selectedAvatar || '👤'}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2 bg-amber-500 text-white rounded-full shadow-md hover:bg-amber-600 transition-all border-2 border-white cursor-pointer"
              title="Upload new photo"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[11px] font-bold text-slate-500">Live Profile Avatar Preview</p>
        </div>

        {/* Option Tabs: Custom Upload vs Preset Avatars */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              setActiveTab('upload');
            }}
            className={`flex-1 py-1.5 px-3 rounded-xl font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'upload'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-amber-600" />
            <span>Upload Custom Photo</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              setActiveTab('presets');
            }}
            className={`flex-1 py-1.5 px-3 rounded-xl font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'presets'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Preset Kid Avatars</span>
          </button>
        </div>

        {/* Tab 1: Upload Photo */}
        {activeTab === 'upload' && (
          <div className="space-y-3">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/50 hover:bg-amber-50 rounded-2xl p-6 text-center cursor-pointer transition-all space-y-2 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileChange}
                className="hidden"
              />

              {isProcessing ? (
                <div className="space-y-2 py-2">
                  <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-bold text-amber-800">Optimizing & Cropping Image...</p>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-extrabold text-xs text-slate-800">
                      Click or Drag & Drop Photo Here
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Supports JPG, PNG, WEBP (Auto-cropped to square 250x250)
                    </p>
                  </div>
                </>
              )}
            </div>

            {errorMsg && (
              <p className="text-xs font-bold text-rose-600 text-center bg-rose-50 p-2 rounded-xl border border-rose-200">
                {errorMsg}
              </p>
            )}
          </div>
        )}

        {/* Tab 2: Preset Avatars */}
        {activeTab === 'presets' && (
          <div className="space-y-2">
            <p className="text-[11px] font-bold text-slate-500">Select a fun educational character:</p>
            <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1">
              {PRESET_AVATARS.map((icon, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    soundFx.playPop();
                    setSelectedAvatar(icon);
                  }}
                  className={`w-11 h-11 rounded-2xl text-2xl flex items-center justify-center border-2 transition-all cursor-pointer ${
                    selectedAvatar === icon
                      ? 'bg-amber-300 border-amber-500 scale-110 shadow'
                      : 'bg-slate-50 border-slate-200 hover:bg-amber-100 hover:border-amber-300'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              soundFx.playPop();
              onClose();
            }}
            className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-slate-900 font-extrabold text-xs shadow transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Apply Photo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
