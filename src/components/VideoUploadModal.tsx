import React, { useState } from 'react';
import { MediaItem, AgeGroup, MediaType, SupportedLanguage } from '../types';
import { getTranslation } from '../data/translations';
import { UploadCloud, X, Film, Headphones, Music, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { soundFx } from '../utils/soundAndTTS';

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
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Music & Movement');
  const [mediaUrl, setMediaUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [description, setDescription] = useState('');
  const [targetAges, setTargetAges] = useState<AgeGroup[]>(['4-5']);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const t = (key: string, fallback?: string) => getTranslation(currentLanguage, key, fallback);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playPop();

    if (!title.trim() || !mediaUrl.trim() || !description.trim()) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    // Embed URL formatting helper (if youtube link)
    let formattedUrl = mediaUrl.trim();
    if (formattedUrl.includes('youtube.com/watch?v=')) {
      const videoId = formattedUrl.split('v=')[1]?.split('&')[0];
      if (videoId) formattedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (formattedUrl.includes('youtu.be/')) {
      const videoId = formattedUrl.split('youtu.be/')[1]?.split('?')[0];
      if (videoId) formattedUrl = `https://www.youtube.com/embed/${videoId}`;
    }

    const defaultThumbs: Record<MediaType, string> = {
      video: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
      audiobook: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80',
      rhyme: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=600&q=80',
    };

    const newMedia: MediaItem = {
      id: `m_user_${Date.now()}`,
      title: title.trim(),
      type: mediaType,
      category,
      duration: mediaType === 'audiobook' ? '10:00' : '4:30',
      thumbnailUrl: thumbnailUrl.trim() || defaultThumbs[mediaType],
      mediaUrl: formattedUrl,
      targetAgeGroup: targetAges,
      description: description.trim(),
      isPopular: false,
      status: 'pending_approval',
      uploadedBy: currentUserEmail || 'parent@vkid.app',
      createdAt: new Date().toISOString(),
    };

    soundFx.playSuccess();
    onUploadSubmit(newMedia);
    setSubmittedSuccess(true);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full border-4 border-amber-300 shadow-2xl relative my-auto p-5 sm:p-6 text-slate-800">
        <button
          onClick={() => {
            soundFx.playPop();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          <X className="w-5 h-5 text-slate-600" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-xl text-slate-900">{t('upload_media', 'Upload Kid Content')}</h3>
            <p className="text-xs text-slate-500 font-medium">
              Submit Videos, Audiobooks, or Rhymes for Admin Moderation review.
            </p>
          </div>
        </div>

        {submittedSuccess ? (
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 text-center space-y-3 animate-in fade-in zoom-in-95">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="font-extrabold text-lg text-emerald-900">Submitted for Moderation!</h4>
            <p className="text-xs text-emerald-800 font-medium leading-relaxed">
              Thank you! Your content was sent to the VKid admin moderation queue and will be published once approved.
            </p>
            <button
              onClick={() => {
                soundFx.playPop();
                onClose();
              }}
              className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow"
            >
              Close
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

            {/* 1. Content Type Selector Cards */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                Select Content Format *
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleTypeSelect('video')}
                  className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all ${
                    mediaType === 'video'
                      ? 'bg-rose-500 text-white border-rose-600 shadow-md scale-105'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Film className="w-6 h-6" />
                  <span className="text-xs font-black">🎬 Video</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTypeSelect('audiobook')}
                  className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all ${
                    mediaType === 'audiobook'
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-md scale-105'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Headphones className="w-6 h-6" />
                  <span className="text-xs font-black">🎧 Audiobook</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTypeSelect('rhyme')}
                  className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all ${
                    mediaType === 'rhyme'
                      ? 'bg-purple-600 text-white border-purple-700 shadow-md scale-105'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Music className="w-6 h-6" />
                  <span className="text-xs font-black">🎵 Rhyme</span>
                </button>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">
                {mediaType === 'video' && 'Video Title *'}
                {mediaType === 'audiobook' && 'Audiobook / Story Title *'}
                {mediaType === 'rhyme' && 'Song / Nursery Rhyme Title *'}
              </label>
              <input
                type="text"
                placeholder={
                  mediaType === 'video'
                    ? 'e.g. Solar System Rocket Exploration'
                    : mediaType === 'audiobook'
                    ? 'e.g. The Enchanted Forest Bedtime Tale'
                    : 'e.g. Counting ABC Animals Song'
                }
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

            {/* Media URL */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">
                {mediaType === 'video' && 'Video Stream or Embed Link (YouTube / MP4 / BunnyStream) *'}
                {mediaType === 'audiobook' && 'Audio File / Stream URL (MP3 / SoundHelix / Podcast Link) *'}
                {mediaType === 'rhyme' && 'Rhyme Video/Song Stream URL *'}
              </label>
              <input
                type="url"
                placeholder={
                  mediaType === 'audiobook'
                    ? 'https://www.soundhelix.com/examples/mp3/Song.mp3'
                    : 'https://www.youtube.com/watch?v=...'
                }
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs font-bold focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            {/* Thumbnail/Cover Image */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">
                {mediaType === 'audiobook' ? 'Cover Art Image URL (Optional)' : 'Thumbnail / Animated Cover Image URL (Optional)'}
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/... or custom cover"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs font-bold focus:outline-none focus:border-amber-500"
              />
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

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-[11px] text-amber-900 font-medium">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Uploading as <strong>{currentUserEmail}</strong> (Status: Pending Moderation)</span>
            </div>

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs py-3 rounded-xl shadow-md transition-all active:scale-95"
            >
              Submit Content for Admin Review
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

