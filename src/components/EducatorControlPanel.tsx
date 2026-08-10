import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Classroom, SupportedLanguage } from '../types';
import { getTranslation } from '../data/translations';
import {
  GraduationCap,
  Building2,
  Users,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  KeyRound,
  Monitor,
  Tv,
  ListVideo,
  Play,
  Sparkles,
  ShieldCheck,
  Save,
  Camera,
} from 'lucide-react';
import { soundFx } from '../utils/soundAndTTS';
import { useTvNavigation } from '../hooks/useTvNavigation';
import { isImageUrl } from '../utils/avatarUtils';
import { AvatarUploadModal } from './AvatarUploadModal';

interface EducatorControlPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: SupportedLanguage;
  onSelectCategory?: (category: string) => void;
}

const AVAILABLE_PLAYLISTS = [
  'Orthodox Hymns',
  'Bible Animated Stories',
  'Moral Lessons',
  'Creation & Science',
  'Interactive Logic Games',
  'Coptic & Church History',
  'Bedtime Prayers & Lullabies',
];

export const EducatorControlPanel: React.FC<EducatorControlPanelProps> = ({
  isOpen,
  onClose,
  currentLanguage,
  onSelectCategory,
}) => {
  const {
    user,
    updateSchoolData,
    isPresentationMode,
    togglePresentationMode,
    activeClass,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'classes' | 'playlists' | 'presentation'>('classes');
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  // Local state for editing school name
  const [schoolNameInput, setSchoolNameInput] = useState<string>(
    user?.schoolName || 'St. Mark Orthodox Academy'
  );
  const [isEditingSchool, setIsEditingSchool] = useState<boolean>(false);

  // Local state for classes list
  const [classList, setClassList] = useState<Classroom[]>(
    user?.classes || [
      {
        id: 'class_1',
        name: 'Class 1A - Primary Bible & Morals',
        grade: '1st Grade',
        studentPin: '1234',
        assignedPlaylists: ['Orthodox Hymns', 'Bible Animated Stories', 'Moral Lessons'],
        studentCount: 18,
      },
      {
        id: 'class_2',
        name: 'Class 2B - Wonders of Creation & Science',
        grade: '2nd Grade',
        studentPin: '5678',
        assignedPlaylists: ['Creation & Science', 'Interactive Logic Games'],
        studentCount: 22,
      },
    ]
  );

  const [selectedClassId, setSelectedClassId] = useState<string>(
    activeClass?.id || classList[0]?.id || 'class_1'
  );

  // New class form state
  const [showAddClassModal, setShowAddClassModal] = useState<boolean>(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassGrade, setNewClassGrade] = useState('1st Grade');
  const [newClassPin, setNewClassPin] = useState('1234');
  const [newClassStudentCount, setNewClassStudentCount] = useState('20');

  // Smart TV Navigation support inside modal
  useTvNavigation({
    onBack: () => {
      if (isOpen) {
        soundFx.playPop();
        onClose();
      }
    },
    enabled: isOpen,
  });

  if (!isOpen) return null;

  const currentClass = classList.find((c) => c.id === selectedClassId) || classList[0];

  const handleSaveSchoolName = () => {
    soundFx.playSuccess();
    setIsEditingSchool(false);
    updateSchoolData(schoolNameInput, classList, selectedClassId);
  };

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    soundFx.playSuccess();
    const newClass: Classroom = {
      id: `class_${Date.now()}`,
      name: newClassName.trim(),
      grade: newClassGrade,
      studentPin: newClassPin || '1234',
      assignedPlaylists: ['Orthodox Hymns', 'Bible Animated Stories'],
      studentCount: parseInt(newClassStudentCount) || 20,
    };

    const updated = [...classList, newClass];
    setClassList(updated);
    setSelectedClassId(newClass.id);
    updateSchoolData(schoolNameInput, updated, newClass.id);

    setNewClassName('');
    setShowAddClassModal(false);
  };

  const handleDeleteClass = (id: string) => {
    if (classList.length <= 1) {
      alert('You must maintain at least one class in your school portal.');
      return;
    }
    soundFx.playPop();
    const updated = classList.filter((c) => c.id !== id);
    setClassList(updated);
    const nextSelected = updated[0]?.id || '';
    setSelectedClassId(nextSelected);
    updateSchoolData(schoolNameInput, updated, nextSelected);
  };

  const handleTogglePlaylistForClass = (playlistName: string) => {
    soundFx.playPop();
    const updated = classList.map((c) => {
      if (c.id === selectedClassId) {
        const exists = c.assignedPlaylists.includes(playlistName);
        const nextPlaylists = exists
          ? c.assignedPlaylists.filter((p) => p !== playlistName)
          : [...c.assignedPlaylists, playlistName];
        return { ...c, assignedPlaylists: nextPlaylists };
      }
      return c;
    });

    setClassList(updated);
    updateSchoolData(schoolNameInput, updated, selectedClassId);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[130] flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full border-4 border-indigo-300 shadow-2xl relative my-auto p-5 sm:p-7 text-slate-800">
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="relative group shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md overflow-hidden text-2xl border-2 border-indigo-300">
                {isImageUrl(user?.avatarUrl) ? (
                  <img src={user?.avatarUrl} alt={user?.fullName || 'Educator'} className="w-full h-full object-cover" />
                ) : (
                  <GraduationCap className="w-7 h-7" />
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  setIsAvatarModalOpen(true);
                }}
                className="absolute -bottom-1 -right-1 p-1 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow border border-white transition-transform active:scale-90 cursor-pointer"
                title="Update Educator / School Photo"
              >
                <Camera className="w-3 h-3" />
              </button>
            </div>
            <div>
              <div className="flex items-center gap-2">
                {isEditingSchool ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={schoolNameInput}
                      onChange={(e) => setSchoolNameInput(e.target.value)}
                      className="bg-slate-50 border border-indigo-300 rounded-lg px-2 py-1 text-sm font-black text-slate-900 focus:outline-none"
                    />
                    <button
                      onClick={handleSaveSchoolName}
                      className="p-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <h3 className="font-black text-xl text-slate-900 tracking-tight flex items-center gap-2">
                    <span>{schoolNameInput}</span>
                    <button
                      onClick={() => setIsEditingSchool(true)}
                      className="text-slate-400 hover:text-indigo-600 p-0.5"
                      title="Edit School Name"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </h3>
                )}
              </div>
              <p className="text-xs text-indigo-700 font-bold flex items-center gap-2 mt-0.5">
                <span>Educator Portal</span>
                <span>•</span>
                <span>{user?.fullName || 'Educator'}</span>
                <span>({user?.email})</span>
              </p>
            </div>
          </div>

          {/* Quick Presentation Mode Toggle */}
          <button
            onClick={() => {
              soundFx.playPop();
              togglePresentationMode();
            }}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black transition-all ${
              isPresentationMode
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>Presentation Mode: {isPresentationMode ? 'ACTIVE' : 'OFF'}</span>
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-100 p-1 rounded-2xl mb-5 border border-slate-200 gap-1">
          <button
            onClick={() => {
              soundFx.playPop();
              setActiveTab('classes');
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'classes'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Classroom Management ({classList.length})</span>
          </button>

          <button
            onClick={() => {
              soundFx.playPop();
              setActiveTab('playlists');
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'playlists'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ListVideo className="w-4 h-4" />
            <span>Curated Class Playlists</span>
          </button>

          <button
            onClick={() => {
              soundFx.playPop();
              setActiveTab('presentation');
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'presentation'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Tv className="w-4 h-4" />
            <span>Classroom TV Mode</span>
          </button>
        </div>

        {/* TAB 1: CLASSROOM MANAGEMENT */}
        {activeTab === 'classes' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">Your School Classes</h4>
                <p className="text-xs text-slate-500">Configure grade levels, student login PINs, and active classes.</p>
              </div>
              <button
                onClick={() => {
                  soundFx.playPop();
                  setShowAddClassModal(true);
                }}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black px-3 py-2 rounded-xl shadow-xs transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Class</span>
              </button>
            </div>

            {/* Class Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {classList.map((cls) => {
                const isSelected = cls.id === selectedClassId;
                return (
                  <div
                    key={cls.id}
                    onClick={() => {
                      soundFx.playPop();
                      setSelectedClassId(cls.id);
                      updateSchoolData(schoolNameInput, classList, cls.id);
                    }}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-300 shadow-md'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="bg-indigo-200 text-indigo-900 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                            {cls.grade}
                          </span>
                          {isSelected && (
                            <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              <span>Active</span>
                            </span>
                          )}
                        </div>
                        <h5 className="font-black text-slate-900 text-base mt-1.5">{cls.name}</h5>
                        <p className="text-xs text-slate-500 font-medium mt-1">
                          {cls.studentCount || 20} Students enrolled
                        </p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClass(cls.id);
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Delete Class"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-3 pt-3 border-t border-indigo-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                        <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Student PIN: <strong className="font-black text-indigo-700 tracking-wider bg-white px-1.5 py-0.5 rounded border border-indigo-200">{cls.studentPin}</strong></span>
                      </div>
                      <div className="text-indigo-800 font-extrabold text-[11px]">
                        {cls.assignedPlaylists.length} Playlists
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Class Form Modal */}
            {showAddClassModal && (
              <form onSubmit={handleCreateClass} className="p-4 bg-indigo-50 border-2 border-indigo-200 rounded-2xl space-y-3 animate-in fade-in">
                <h5 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <Plus className="w-4 h-4 text-indigo-600" />
                  <span>Create New Classroom</span>
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Classroom Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Class 3C - Church History & Hymns"
                      value={newClassName}
                      onChange={(e) => setNewClassName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Grade Level *</label>
                    <select
                      value={newClassGrade}
                      onChange={(e) => setNewClassGrade(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Kindergarten">Kindergarten</option>
                      <option value="1st Grade">1st Grade</option>
                      <option value="2nd Grade">2nd Grade</option>
                      <option value="3rd Grade">3rd Grade</option>
                      <option value="4th Grade">4th Grade</option>
                      <option value="5th Grade">5th Grade</option>
                      <option value="Sunday School">Sunday School</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Student Access PIN (4 Digits)</label>
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="1234"
                      value={newClassPin}
                      onChange={(e) => setNewClassPin(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Student Count</label>
                    <input
                      type="number"
                      placeholder="20"
                      value={newClassStudentCount}
                      onChange={(e) => setNewClassStudentCount(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddClassModal(false)}
                    className="px-3 py-1.5 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-sm"
                  >
                    Save Classroom
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: CURATED PLAYLISTS */}
        {activeTab === 'playlists' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-xs text-indigo-950 font-extrabold">
                  Assigning playlists for: <strong className="text-indigo-700">{currentClass?.name}</strong>
                </p>
                <p className="text-[11px] text-indigo-700">
                  Selected playlists will appear in high visibility on Smart TV & Presentation Mode.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {AVAILABLE_PLAYLISTS.map((pl) => {
                const isAssigned = currentClass?.assignedPlaylists.includes(pl);
                return (
                  <div
                    key={pl}
                    onClick={() => handleTogglePlaylistForClass(pl)}
                    className={`p-3 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                      isAssigned
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <ListVideo className={`w-4 h-4 ${isAssigned ? 'text-amber-300' : 'text-slate-400'}`} />
                      <span className="font-extrabold text-xs">{pl}</span>
                    </div>

                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                      isAssigned ? 'bg-white text-indigo-700' : 'bg-slate-200 text-slate-400'
                    }`}>
                      {isAssigned ? <Check className="w-4 h-4" /> : <Plus className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {onSelectCategory && (
              <div className="pt-2 text-center">
                <button
                  onClick={() => {
                    soundFx.playPop();
                    onClose();
                    onSelectCategory(currentClass?.assignedPlaylists[0] || 'All Videos');
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow transition-all active:scale-95 inline-flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  <span>Launch Playlist View for {currentClass?.name}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PRESENTATION MODE */}
        {activeTab === 'presentation' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="p-4 bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tv className="w-6 h-6 text-amber-400" />
                  <h4 className="font-black text-base">Classroom Presentation Mode</h4>
                </div>
                <span className={`text-xs font-black px-2.5 py-1 rounded-full uppercase ${
                  isPresentationMode ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'
                }`}>
                  {isPresentationMode ? 'ACTIVE' : 'DISABLED'}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Presentation mode removes distractive menus, enlarges TV remote control targets, forces high contrast, and presents safe content curated specifically for school smartboards and TV projectors.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
                <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Distraction-Free Focus</span>
                </div>
                <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center gap-2">
                  <Tv className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Smart TV D-Pad Friendly</span>
                </div>
                <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Classroom Pin Protected</span>
                </div>
              </div>

              <div className="pt-2 flex justify-center">
                <button
                  onClick={() => {
                    soundFx.playSuccess();
                    togglePresentationMode();
                  }}
                  className={`w-full sm:w-auto font-extrabold text-xs py-3 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                    isPresentationMode
                      ? 'bg-rose-600 hover:bg-rose-700 text-white'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                  <span>{isPresentationMode ? 'Exit Presentation Mode' : 'Enable Presentation Mode Now'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {isAvatarModalOpen && user && (
          <AvatarUploadModal
            currentAvatar={user.avatarUrl || '🎓'}
            title="Choose Educator Photo or School Logo"
            onSelectAvatar={(newAvatar) => {
              user.avatarUrl = newAvatar;
            }}
            onClose={() => setIsAvatarModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
};
