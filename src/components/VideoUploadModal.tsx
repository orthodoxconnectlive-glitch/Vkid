import React, { useState, useRef } from 'react';
import { MediaItem, AgeGroup, MediaType, SupportedLanguage } from '../types';
import { getTranslation } from '../data/translations';
import {
  UploadCloud,
  X,
  Film,
  Headphones,
  Music,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  FileVideo,
  Image as ImageIcon,
  Loader2,
  Link as LinkIcon,
  HardDriveUpload,
} from 'lucide-react';
import { soundFx } from '../utils/soundAndTTS';
import { uploadFileToSupabase } from '../lib/supabase';
import { uploadVideoToBunny } from '../lib/bunny';
import { saveMediaItemToStorage } from '../lib/mediaService';

import { SUPER_ADMIN_EMAIL } from './AdminModerationModal';

interface VideoUploadModalProps {
  currentLanguage: SupportedLanguage;
  currentUserEmail: string;
  onUploadSubmit: (newVideo: MediaItem) => void;
  onClose: () => void;
}

export const VideoUploadModal: React.FC<VideoUploadModalProps> = ({
  currentLanguage,
  currentUserEmail,
  onUploadSubmit,
  onClose,
}) => {
  const [mediaType, setMediaType] = useState<MediaType>('video');
  const [inputMode, setInputMode] = useState<'file' | 'url'>('file');

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Science & Discovery');
  const [description, setDescription] = useState('');
  const [targetAges, setTargetAges] = useState<AgeGroup[]>(['4-5']);

  // Native HTML File Objects State
  const [selectedMediaFile, setSelectedMediaFile] = useState<File | null>(null);
  const [selectedThumbnailFile, setSelectedThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string>('');

  // Manual URL State fallback
  const [mediaUrlInput, setMediaUrlInput] = useState('');
  const [thumbnailUrlInput, setThumbnailUrlInput] = useState('');

  // Upload progress & loading state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatusText, setUploadStatusText] = useState('');

  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const mediaFileInputRef = useRef<HTMLInputElement>(null);
  const thumbFileInputRef = useRef<HTMLInputElement>(null);

  const t = (key: string, fallback?: string) => getTranslation(currentLanguage, key, fallback);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleAgeToggle = (age: AgeGroup) => {
    soundFx.playPop();
    if (targetAges.includes(age)) {
      if (targetAges.length > 1) {
        setTargetAges(targetAges.filter((a) => a !== age));
      }
    } else {
      setTargetAges([...targetAges, age]);
    }
  };

  const handleTypeSelect = (type: MediaType) => {
    soundFx.playPop();
    setMediaType(type);
    if (type === 'video') setCategory('Science & Discovery');
    if (type === 'audiobook') setCategory('Bedtime Stories');
    if (type === 'rhyme') setCategory('Music & Movement');
  };

  // Media File Selection Handler
  const handleMediaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      soundFx.playPop();
      setSelectedMediaFile(file);
      setErrorMsg('');

      // Auto-populate title if empty
      if (!title.trim()) {
        const cleanName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        setTitle(cleanName.replace(/[-_]/g, ' '));
      }
    }
  };

  // Thumbnail File Selection Handler
  const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      soundFx.playPop();
      setSelectedThumbnailFile(file);
      const preview = URL.createObjectURL(file);
      setThumbnailPreviewUrl(preview);
    }
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playPop();
    setErrorMsg('');

    if (!title.trim() || !description.trim()) {
      setErrorMsg('Please enter a title and description.');
      return;
    }

    if (inputMode === 'file' && !selectedMediaFile) {
      setErrorMsg('Please select a video or audio file to upload from your device.');
      return;
    }

    if (inputMode === 'url' && !mediaUrlInput.trim()) {
      setErrorMsg('Please provide a valid stream or video URL.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    setUploadStatusText('Preparing media upload...');

    try {
      let finalMediaUrl = '';
      let finalThumbnailUrl = '';
      let bunnyVideoId = '';

      // 1. Upload Media File to Bunny Stream CDN (or Supabase Audio fallback)
      if (inputMode === 'file' && selectedMediaFile) {
        if (mediaType === 'video' || mediaType === 'rhyme') {
          setUploadStatusText(`Uploading ${selectedMediaFile.name} to Bunny Stream CDN...`);
          setUploadProgress(30);

          const bunnyResult = await uploadVideoToBunny(selectedMediaFile, title.trim());
          finalMediaUrl = bunnyResult.videoUrl;
          bunnyVideoId = bunnyResult.videoId;
          setUploadProgress(60);
        } else {
          // Audiobooks upload to Supabase Storage
          setUploadStatusText(`Uploading audio file (${formatFileSize(selectedMediaFile.size)})...`);
          finalMediaUrl = await uploadFileToSupabase(
            selectedMediaFile,
            'vkid-media',
            'audio',
            (pct) => setUploadProgress(Math.floor(pct * 0.6))
          );
        }
      } else {
        finalMediaUrl = mediaUrlInput.trim();
        if (finalMediaUrl.includes('youtube.com/watch?v=')) {
          const videoId = finalMediaUrl.split('v=')[1]?.split('&')[0];
          if (videoId) finalMediaUrl = `https://www.youtube.com/embed/${videoId}`;
        } else if (finalMediaUrl.includes('youtu.be/')) {
          const videoId = finalMediaUrl.split('youtu.be/')[1]?.split('?')[0];
          if (videoId) finalMediaUrl = `https://www.youtube.com/embed/${videoId}`;
        }
      }

      // 2. Upload Thumbnail File to Supabase Storage (if selected)
      if (selectedThumbnailFile) {
        setUploadStatusText('Uploading cover image thumbnail...');
        finalThumbnailUrl = await uploadFileToSupabase(
          selectedThumbnailFile,
          'vkid-media',
          'thumbnails',
          (pct) => setUploadProgress(60 + Math.floor(pct * 0.2))
        );
      } else if (thumbnailUrlInput.trim()) {
        finalThumbnailUrl = thumbnailUrlInput.trim();
      } else {
        const defaultThumbs: Record<MediaType, string> = {
          video: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
          audiobook: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80',
          rhyme: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=600&q=80',
        };
        finalThumbnailUrl = defaultThumbs[mediaType];
      }

      setUploadProgress(85);
      setUploadStatusText('Saving record to Supabase database...');

      const isUserAdmin = currentUserEmail && (
        currentUserEmail.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() ||
        currentUserEmail.toLowerCase().includes('admin')
      );

      const newMedia: MediaItem & { bunnyId?: string } = {
        id: `m_user_${Date.now()}`,
        title: title.trim(),
        type: mediaType,
        category,
        duration: mediaType === 'audiobook' ? '10:00' : '4:30',
        thumbnailUrl: finalThumbnailUrl,
        mediaUrl: finalMediaUrl,
        bunnyId: bunnyVideoId || undefined,
        targetAgeGroup: targetAges,
        description: description.trim(),
        isPopular: false,
        status: isUserAdmin ? 'approved' : 'pending_approval',
        uploadedBy: currentUserEmail || 'parent@vkid.app',
        createdAt: new Date().toISOString(),
      };

      // 3. PERSIST DIRECTLY TO SUPABASE DATABASE
      await saveMediaItemToStorage(newMedia);

      setUploadProgress(100);
      setUploadStatusText('Finalizing submission...');

      setTimeout(() => {
        setIsUploading(false);
        soundFx.playSuccess();
        onUploadSubmit(newMedia);
        setSubmittedSuccess(true);
      }, 400);
    } catch (err: any) {
      console.error('Upload Error:', err);
      setIsUploading(false);
      setErrorMsg(err.message || 'Failed to upload media file. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full border-4 border-amber-300 shadow-2xl relative my-auto p-5 sm:p-6 text-slate-800">
        {/* Close Button */}
        <button
          onClick={() => {
            soundFx.playPop();
            onClose();
          }}
          disabled={isUploading}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5 text-slate-600" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 shadow-inner">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-xl text-slate-900">{t('upload_media', 'Upload Kid Content')}</h3>
            <p className="text-xs text-slate-500 font-medium">
              Direct device upload with Bunny Stream CDN & Supabase moderation.
            </p>
          </div>
        </div>

        {/* Success View */}
        {submittedSuccess ? (
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 text-center space-y-3 animate-in fade-in zoom-in-95">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="font-extrabold text-lg text-emerald-900">Submitted for Moderation!</h4>
            <p className="text-xs text-emerald-800 font-medium leading-relaxed">
              Your video was uploaded to Bunny Stream CDN and sent to the VKid moderation queue. It will be published once approved.
            </p>
            <button
              onClick={() => {
                soundFx.playPop();
                onClose();
              }}
              className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow"
            >
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Content Format Selector */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                Select Content Format *
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleTypeSelect('video')}
                  className={`p-2.5 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all ${
                    mediaType === 'video'
                      ? 'bg-rose-500 text-white border-rose-600 shadow-md scale-105'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Film className="w-5 h-5" />
                  <span className="text-xs font-black">🎬 Video</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTypeSelect('audiobook')}
                  className={`p-2.5 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all ${
                    mediaType === 'audiobook'
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-md scale-105'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Headphones className="w-5 h-5" />
                  <span className="text-xs font-black">🎧 Audiobook</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTypeSelect('rhyme')}
                  className={`p-2.5 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all ${
                    mediaType === 'rhyme'
                      ? 'bg-purple-600 text-white border-purple-700 shadow-md scale-105'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Music className="w-5 h-5" />
                  <span className="text-xs font-black">🎵 Rhyme</span>
                </button>
              </div>
            </div>

            {/* Input Mode Toggle */}
            <div className="flex items-center justify-between bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  setInputMode('file');
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                  inputMode === 'file'
                    ? 'bg-amber-500 text-white shadow'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <HardDriveUpload className="w-3.5 h-3.5" />
                <span>Upload File from PC/Phone</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  setInputMode('url');
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                  inputMode === 'url'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Paste Stream Link</span>
              </button>
            </div>

            {/* File Dropzone */}
            {inputMode === 'file' ? (
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1 flex items-center justify-between">
                  <span>
                    {mediaType === 'audiobook'
                      ? 'Select Audio File (MP3 / WAV / M4A) *'
                      : 'Select Video File (MP4 / WebM / MOV) *'}
                  </span>
                  <span className="text-[10px] text-amber-600 font-bold">Bunny Stream CDN</span>
                </label>

                <input
                  ref={mediaFileInputRef}
                  type="file"
                  accept={mediaType === 'audiobook' ? 'audio/*' : 'video/*'}
                  onChange={handleMediaFileChange}
                  className="hidden"
                  id="media-file-upload-input"
                />

                <div
                  onClick={() => mediaFileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                    selectedMediaFile
                      ? 'border-emerald-400 bg-emerald-50/60'
                      : 'border-amber-300 hover:border-amber-500 bg-amber-50/40 hover:bg-amber-50'
                  }`}
                >
                  {selectedMediaFile ? (
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0 text-left">
                        <div className="w-10 h-10 rounded-xl bg-emerald-200 text-emerald-800 flex items-center justify-center shrink-0">
                          <FileVideo className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-extrabold text-xs text-slate-900 truncate">
                            {selectedMediaFile.name}
                          </p>
                          <p className="text-[10px] text-slate-500 font-semibold">
                            Size: {formatFileSize(selectedMediaFile.size)} • Type: {selectedMediaFile.type || 'Media File'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMediaFile(null);
                        }}
                        className="p-1 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1 py-1">
                      <UploadCloud className="w-8 h-8 text-amber-500 mx-auto" />
                      <p className="font-extrabold text-xs text-slate-800">
                        Click to browse local device or drag file here
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium">
                        Accepts {mediaType === 'audiobook' ? 'audio files (MP3, WAV, AAC)' : 'video files (MP4, WebM, MOV)'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Media Stream or Video Embed URL *
                </label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=... or MP4/MP3 stream link"
                  value={mediaUrlInput}
                  onChange={(e) => setMediaUrlInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs font-bold focus:outline-none focus:border-amber-500"
                />
              </div>
            )}

            {/* Thumbnail Upload */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1 flex items-center justify-between">
                <span>Thumbnail / Cover Image (PNG, JPG, WebP)</span>
                <span className="text-[10px] text-slate-400">accept="image/*"</span>
              </label>

              <input
                ref={thumbFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleThumbnailFileChange}
                className="hidden"
                id="thumbnail-file-upload-input"
              />

              <div className="flex items-center gap-3">
                <div
                  onClick={() => thumbFileInputRef.current?.click()}
                  className="flex-1 border border-slate-300 hover:border-amber-400 rounded-xl p-2.5 bg-slate-50 hover:bg-slate-100 cursor-pointer flex items-center gap-2 transition-all"
                >
                  <ImageIcon className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-700 truncate">
                    {selectedThumbnailFile ? selectedThumbnailFile.name : 'Choose Thumbnail Image...'}
                  </span>
                </div>

                {thumbnailPreviewUrl ? (
                  <div className="relative w-12 h-10 rounded-lg overflow-hidden border-2 border-amber-400 shrink-0">
                    <img src={thumbnailPreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-12 h-10 rounded-lg border border-dashed border-slate-300 bg-slate-100 flex items-center justify-center shrink-0">
                    <ImageIcon className="w-4 h-4 text-slate-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Learning Fun with Alphabet Kittens"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs font-bold focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">Category / Genre</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs font-bold focus:outline-none focus:border-amber-500"
              >
                <option value="Music & Movement">Music & Movement</option>
                <option value="Science & Discovery">Science & Discovery</option>
                <option value="Bedtime Stories">Bedtime Stories</option>
                <option value="Alphabet & Phonics">Alphabet & Phonics</option>
                <option value="Arts & Crafts">Arts & Crafts</option>
                <option value="Nature & Animals">Nature & Animals</option>
                <option value="Stories & Mysteries">Stories & Mysteries</option>
              </select>
            </div>

            {/* Age Group */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">Target Age Group</label>
              <div className="flex gap-2">
                {(['4-5', '6-7', '8-10'] as AgeGroup[]).map((age) => (
                  <button
                    type="button"
                    key={age}
                    onClick={() => handleAgeToggle(age)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                      targetAges.includes(age)
                        ? 'bg-amber-500 text-white shadow'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {age} yrs
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">Description *</label>
              <textarea
                rows={2}
                placeholder="Brief educational description for kids and parents..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs font-bold focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            {/* Progress Bar */}
            {isUploading && (
              <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3 space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-xs font-extrabold text-amber-900">
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                    <span>{uploadStatusText || 'Uploading to Bunny CDN...'}</span>
                  </span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-amber-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-[11px] text-slate-600 font-medium">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Uploader: <strong>{currentUserEmail}</strong></span>
              </span>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                Pending Moderation
              </span>
            </div>

            <button
              type="submit"
              disabled={isUploading}
              className="w-full bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-extrabold text-xs py-3 rounded-2xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading to Bunny CDN...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload & Submit for Admin Review</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
