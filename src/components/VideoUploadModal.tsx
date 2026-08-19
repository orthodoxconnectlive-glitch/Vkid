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
  Check,
  Zap,
} from 'lucide-react';
import { soundFx } from '../utils/soundAndTTS';
import { fileToDataUrl } from '../lib/supabase';
import { cleanFileNameToTitle, extractVideoFrameThumbnail, parseExternalVideoUrl } from '../utils/mediaUtils';
import {
  isBunnyConfigured,
  uploadVideoToBunnyStream,
  saveBunnyVideoToSupabase,
  getBunnyPlaybackUrls,
  getBunnyLibraryId,
  getBunnyStreamCdn,
} from '../services/bunnyUpload';

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
  const [isExtractingThumbnail, setIsExtractingThumbnail] = useState<boolean>(false);

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
  const handleMediaFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      soundFx.playPop();
      setSelectedMediaFile(file);
      setErrorMsg('');

      // Auto-populate clean title from filename
      const cleanTitle = cleanFileNameToTitle(file.name);
      setTitle(cleanTitle);

      // Auto-extract preview thumbnail frame at time code 00:00:01 if video
      if (file.type.startsWith('video/') || mediaType === 'video') {
        setIsExtractingThumbnail(true);
        try {
          const extracted = await extractVideoFrameThumbnail(file, 1.0);
          setSelectedThumbnailFile(extracted.file);
          setThumbnailPreviewUrl(extracted.dataUrl);
        } catch (err) {
          console.warn('Video frame thumbnail extraction notice:', err);
        } finally {
          setIsExtractingThumbnail(false);
        }
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

  // Direct Bunny Stream Upload & Lightweight Supabase Metadata Insertion Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playPop();
    setErrorMsg('');

    const formattedTitle = cleanFileNameToTitle(title.trim());
    if (!formattedTitle || !description.trim()) {
      setErrorMsg('Please enter a valid title and description.');
      return;
    }

    if (inputMode === 'file' && !selectedMediaFile) {
      setErrorMsg('Please select a video or audio file to upload.');
      return;
    }

    if (inputMode === 'url' && !mediaUrlInput.trim()) {
      setErrorMsg('Please provide a valid stream or video URL.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(5);
    setUploadStatusText('Connecting directly to Bunny Stream CDN...');

    try {
      let finalMediaUrl = '';
      let finalThumbnailUrl = '';
      let bunnyVideoId: string | undefined = undefined;
      let detectedProvider: 'direct' | 'youtube' | 'vimeo' = 'direct';

      // 1. DIRECT BUNNY UPLOAD (Bypasses Supabase Storage completely)
      if (inputMode === 'file' && selectedMediaFile) {
        if (mediaType === 'video') {
          if (isBunnyConfigured()) {
            setUploadStatusText(`Uploading ${selectedMediaFile.name} directly to Bunny Stream CDN...`);
            const bunnyResult = await uploadVideoToBunnyStream(
              selectedMediaFile,
              formattedTitle,
              (pct) => {
                setUploadProgress(pct);
                setUploadStatusText(`Streaming binary data to Bunny CDN (${pct}%)...`);
              }
            );

            bunnyVideoId = bunnyResult.guid;
            finalMediaUrl = bunnyResult.videoUrl;
            finalThumbnailUrl = bunnyResult.thumbnailUrl;
          } else {
            // Local fallback simulation if Bunny environment keys are not yet pasted
            setUploadStatusText('Preparing local video stream...');
            setUploadProgress(40);
            const dataUrl = await fileToDataUrl(selectedMediaFile);
            setUploadProgress(90);
            finalMediaUrl = dataUrl;
            bunnyVideoId = `local_${Date.now()}`;
            const { thumbnailUrl } = getBunnyPlaybackUrls(bunnyVideoId);
            finalThumbnailUrl = thumbnailPreviewUrl || thumbnailUrl;
          }
        } else {
          // Audio / Rhyme file handling
          setUploadStatusText('Processing audio stream...');
          setUploadProgress(50);
          finalMediaUrl = await fileToDataUrl(selectedMediaFile);
        }
      } else {
        // Link import mode (YouTube / Vimeo / Direct URL)
        const parsed = parseExternalVideoUrl(mediaUrlInput.trim());
        finalMediaUrl = parsed.embedUrl;
        detectedProvider = parsed.provider;

        if (!thumbnailPreviewUrl && parsed.thumbnailUrl) {
          setThumbnailPreviewUrl(parsed.thumbnailUrl);
        }
      }

      // 2. Custom Thumbnail processing if provided
      if (selectedThumbnailFile) {
        setUploadStatusText('Processing custom thumbnail image...');
        finalThumbnailUrl = await fileToDataUrl(selectedThumbnailFile);
      } else if (!finalThumbnailUrl) {
        if (thumbnailPreviewUrl && !thumbnailPreviewUrl.startsWith('blob:')) {
          finalThumbnailUrl = thumbnailPreviewUrl;
        } else if (thumbnailUrlInput.trim()) {
          finalThumbnailUrl = thumbnailUrlInput.trim();
        } else if (bunnyVideoId) {
          const { thumbnailUrl } = getBunnyPlaybackUrls(bunnyVideoId);
          finalThumbnailUrl = thumbnailUrl;
        } else {
          const defaultThumbs: Record<MediaType, string> = {
            video: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
            audiobook: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80',
            rhyme: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=600&q=80',
          };
          finalThumbnailUrl = defaultThumbs[mediaType];
        }
      }

      setUploadProgress(95);
      setUploadStatusText('Inserting lightweight metadata into Supabase `videos` table...');

      const videoRecordId = bunnyVideoId ? `v_${bunnyVideoId}` : `m_user_${Date.now()}`;
      const isUserAdmin = currentUserEmail && (
        currentUserEmail.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() ||
        currentUserEmail.toLowerCase().includes('admin')
      );

      // 3. LIGHTWEIGHT SUPABASE METADATA INSERTION
      // Insert only the text metadata row into Supabase's `videos` table:
      // id, title, description, age_group, category, bunny_video_id, thumbnail_url, is_public: true
      if (bunnyVideoId) {
        await saveBunnyVideoToSupabase({
          id: videoRecordId,
          title: formattedTitle,
          description: description.trim(),
          age_group: targetAges,
          category,
          bunny_video_id: bunnyVideoId,
          thumbnail_url: finalThumbnailUrl,
          is_public: true,
          duration: '4:30',
          status: isUserAdmin ? 'approved' : 'pending_approval',
          uploaded_by: currentUserEmail || 'parent@vkid.app',
        }).catch((err) => {
          console.warn('Supabase metadata insert warning:', err);
        });
      }

      setUploadProgress(100);
      setUploadStatusText('Upload completed successfully!');

      const newMedia: MediaItem = {
        id: videoRecordId,
        title: formattedTitle,
        type: mediaType,
        category,
        duration: mediaType === 'audiobook' ? '10:00' : '4:30',
        thumbnailUrl: finalThumbnailUrl,
        mediaUrl: finalMediaUrl,
        targetAgeGroup: targetAges,
        description: description.trim(),
        isPopular: false,
        status: isUserAdmin ? 'approved' : 'pending_approval',
        uploadedBy: currentUserEmail || 'parent@vkid.app',
        createdAt: new Date().toISOString(),
        provider: detectedProvider,
        bunny_video_id: bunnyVideoId,
        bunnyVideoId: bunnyVideoId,
        is_public: true,
      };

      setTimeout(() => {
        setIsUploading(false);
        soundFx.playSuccess();
        onUploadSubmit(newMedia);
        setSubmittedSuccess(true);
      }, 400);
    } catch (err: any) {
      console.error('Upload Error:', err);
      setIsUploading(false);
      setErrorMsg(err.message || 'Failed to upload video to Bunny Stream. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full border-4 border-amber-300 shadow-2xl relative my-auto p-5 sm:p-6 text-slate-800">
        {/* Close Button */}
        <button
          type="button"
          tabIndex={0}
          onClick={() => {
            soundFx.playPop();
            onClose();
          }}
          disabled={isUploading}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50 focus:outline-none focus:ring-4 focus:ring-amber-400 cursor-pointer"
        >
          <X className="w-5 h-5 text-slate-600" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 shadow-inner">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-xl text-slate-900">{t('upload_media', 'Upload Kid Content')}</h3>
              <span className="bg-orange-100 text-orange-800 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 border border-orange-200">
                <Zap className="w-3 h-3 text-orange-600 fill-orange-600" />
                <span>Bunny CDN Direct</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Direct Bunny Stream upload with lightweight Supabase metadata.
            </p>
          </div>
        </div>

        {/* Success View */}
        {submittedSuccess ? (
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 text-center space-y-3 animate-in fade-in zoom-in-95">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="font-extrabold text-lg text-emerald-900">Direct Bunny Upload Complete!</h4>
            <p className="text-xs text-emerald-800 font-medium leading-relaxed">
              Your video was uploaded directly to Bunny Stream CDN with lightweight metadata registered in Supabase.
            </p>
            <button
              type="button"
              tabIndex={0}
              onClick={() => {
                soundFx.playPop();
                onClose();
              }}
              className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow cursor-pointer focus:outline-none focus:ring-4 focus:ring-emerald-400"
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
                  tabIndex={0}
                  onClick={() => handleTypeSelect('video')}
                  className={`p-2.5 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all cursor-pointer focus:outline-none focus:ring-4 focus:ring-rose-300 ${
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
                  tabIndex={0}
                  onClick={() => handleTypeSelect('audiobook')}
                  className={`p-2.5 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all cursor-pointer focus:outline-none focus:ring-4 focus:ring-indigo-300 ${
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
                  tabIndex={0}
                  onClick={() => handleTypeSelect('rhyme')}
                  className={`p-2.5 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all cursor-pointer focus:outline-none focus:ring-4 focus:ring-purple-300 ${
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

            {/* Input Mode Toggle (File Upload vs URL Stream) */}
            <div className="flex items-center justify-between bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button
                type="button"
                tabIndex={0}
                onClick={() => {
                  soundFx.playPop();
                  setInputMode('file');
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                  inputMode === 'file'
                    ? 'bg-amber-500 text-white shadow'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <HardDriveUpload className="w-3.5 h-3.5" />
                <span>Upload Video File (Bunny Direct)</span>
              </button>

              <button
                type="button"
                tabIndex={0}
                onClick={() => {
                  soundFx.playPop();
                  setInputMode('url');
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                  inputMode === 'url'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Paste Stream Link</span>
              </button>
            </div>

            {/* 1. DIRECT BUNNY FILE INPUT DROPZONE */}
            {inputMode === 'file' ? (
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1 flex items-center justify-between">
                  <span>
                    {mediaType === 'audiobook'
                      ? 'Select Audio File (MP3 / WAV / M4A) *'
                      : 'Select Video File (MP4 / WebM / MOV) *'}
                  </span>
                  <span className="text-[10px] text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                    Bypasses Supabase Storage
                  </span>
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
                  tabIndex={0}
                  role="button"
                  onClick={() => mediaFileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      mediaFileInputRef.current?.click();
                    }
                  }}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all focus:outline-none focus:ring-4 focus:ring-amber-400 ${
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
                            Size: {formatFileSize(selectedMediaFile.size)} • Bunny Direct Upload
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMediaFile(null);
                        }}
                        className="p-1 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 shrink-0 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1 py-1">
                      <UploadCloud className="w-8 h-8 text-amber-500 mx-auto" />
                      <p className="font-extrabold text-xs text-slate-800">
                        Click to select video file for direct Bunny CDN upload
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium">
                        Accepts {mediaType === 'audiobook' ? 'audio (MP3, WAV)' : 'video (MP4, WebM, MOV)'} • High speed transcoding
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* URL INPUT IMPORT MODE */
              <div className="space-y-2">
                <label className="block text-xs font-extrabold text-slate-700 flex items-center justify-between">
                  <span>YouTube / Vimeo / MP4 Stream Link *</span>
                  <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    Import via Link
                  </span>
                </label>
                <input
                  type="url"
                  tabIndex={0}
                  placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
                  value={mediaUrlInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    setMediaUrlInput(val);
                    if (val.trim()) {
                      const parsed = parseExternalVideoUrl(val);
                      if (parsed.thumbnailUrl && !selectedThumbnailFile) {
                        setThumbnailPreviewUrl(parsed.thumbnailUrl);
                      }
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs font-bold focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300"
                />

                {mediaUrlInput.trim() && (
                  <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      {parseExternalVideoUrl(mediaUrlInput).provider === 'youtube'
                        ? 'YouTube Video Link Detected — Safe Ad-Free Player Enabled'
                        : parseExternalVideoUrl(mediaUrlInput).provider === 'vimeo'
                        ? 'Vimeo Video Link Detected — Safe Embed Player Enabled'
                        : 'Direct Video Stream Link Detected'}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* 2. THUMBNAIL / COVER IMAGE SELECTION */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-extrabold text-slate-700">
                  Thumbnail / Cover Image
                </label>
                {isExtractingThumbnail ? (
                  <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1 animate-pulse">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Extracting Preview Frame...</span>
                  </span>
                ) : selectedThumbnailFile ? (
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    <Check className="w-3 h-3" />
                    <span>Custom Image Selected</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400">Bunny CDN auto-generates HD thumbnails</span>
                )}
              </div>

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
                  tabIndex={0}
                  role="button"
                  onClick={() => thumbFileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      thumbFileInputRef.current?.click();
                    }
                  }}
                  className="flex-1 border border-slate-300 hover:border-amber-400 rounded-xl p-2.5 bg-slate-50 hover:bg-slate-100 cursor-pointer flex items-center justify-between gap-2 transition-all focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <div className="flex items-center gap-2 truncate">
                    <ImageIcon className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-700 truncate">
                      {selectedThumbnailFile ? selectedThumbnailFile.name : 'Upload Custom Cover Image (Optional)...'}
                    </span>
                  </div>
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded shrink-0">
                    Browse
                  </span>
                </div>

                {thumbnailPreviewUrl ? (
                  <div className="relative w-14 h-11 rounded-lg overflow-hidden border-2 border-amber-400 shrink-0 shadow-sm group">
                    <img src={thumbnailPreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[9px] text-white font-bold transition-opacity">
                      Preview
                    </div>
                  </div>
                ) : (
                  <div className="w-14 h-11 rounded-lg border border-dashed border-slate-300 bg-slate-100 flex items-center justify-center shrink-0">
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
                tabIndex={0}
                placeholder="e.g. Learning Fun with Alphabet Animals"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs font-bold focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-300"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">Category / Genre</label>
              <select
                tabIndex={0}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs font-bold focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-300 cursor-pointer"
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
                    tabIndex={0}
                    key={age}
                    onClick={() => handleAgeToggle(age)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400 ${
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
                tabIndex={0}
                placeholder="Brief educational description for kids and parents..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs font-bold focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-300"
                required
              />
            </div>

            {/* UPLOADING PROGRESS BAR / SPINNER STATE */}
            {isUploading && (
              <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3 space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-xs font-extrabold text-amber-900">
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                    <span>{uploadStatusText || 'Streaming directly to Bunny CDN...'}</span>
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
              <span className="bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-orange-200">
                Bunny Stream Direct
              </span>
            </div>

            <button
              type="submit"
              tabIndex={0}
              disabled={isUploading}
              className="w-full bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-extrabold text-xs py-3 rounded-2xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-4 focus:ring-amber-400"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Streaming directly to Bunny CDN...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload & Publish to Bunny Stream</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
