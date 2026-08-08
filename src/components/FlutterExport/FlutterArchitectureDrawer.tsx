import React, { useState } from 'react';
import {
  FLUTTER_DART_MAIN_CODE,
  SUPABASE_POSTGRES_SCHEMA_SQL,
  SUPABASE_FLUTTER_SERVICE_DART,
  BUNNYSTREAM_SECURE_TOKEN_DART,
  FIRESTORE_SECURITY_RULES_CODE,
  FIREBASE_BLUEPRINT_SCHEMA_JSON,
} from '../../data/mockData';
import { X, Copy, Check, Code2, ShieldAlert, Database, FolderTree, Play, Server } from 'lucide-react';
import { soundFx } from '../../utils/soundAndTTS';

interface FlutterArchitectureDrawerProps {
  onClose: () => void;
}

export const FlutterArchitectureDrawer: React.FC<FlutterArchitectureDrawerProps> = ({ onClose }) => {
  const [activeCodeTab, setActiveCodeTab] = useState<
    'supabase' | 'supabase_flutter' | 'bunnystream' | 'flutter' | 'rules' | 'blueprint' | 'structure'
  >('supabase');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const handleCopy = (text: string, tabName: string) => {
    soundFx.playPop();
    navigator.clipboard.writeText(text);
    setCopiedTab(tabName);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const folderStructureText = `
vkid_flutter_app/
├── android/
├── ios/
├── lib/
│   ├── main.dart
│   ├── features/
│   │   ├── auth/
│   │   │   └── parent_pin_screen.dart
│   │   ├── kid_home/
│   │   │   ├── kid_home_screen.dart
│   │   │   ├── media_library_view.dart
│   │   │   └── games_portal_view.dart
│   │   ├── mini_games/
│   │   │   ├── math_game.dart
│   │   │   ├── spelling_game.dart
│   │   │   └── memory_game.dart
│   │   └── parent_dashboard/
│   │       ├── parent_dashboard_screen.dart
│   │       ├── screen_time_manager.dart
│   │       └── usage_reports_chart.dart
│   ├── models/
│   │   ├── child_profile.dart
│   │   └── media_item.dart
│   ├── providers/
│   │   ├── screen_time_provider.dart
│   │   └── child_profile_provider.dart
│   └── services/
│       ├── supabase_vkid_service.dart
│       ├── bunnystream_security_service.dart
│       └── tts_audio_service.dart
├── supabase/
│   └── schema.sql
├── firestore.rules
└── pubspec.yaml
`;

  const getCodeForTab = () => {
    switch (activeCodeTab) {
      case 'supabase':
        return SUPABASE_POSTGRES_SCHEMA_SQL;
      case 'supabase_flutter':
        return SUPABASE_FLUTTER_SERVICE_DART;
      case 'bunnystream':
        return BUNNYSTREAM_SECURE_TOKEN_DART;
      case 'flutter':
        return FLUTTER_DART_MAIN_CODE;
      case 'rules':
        return FIRESTORE_SECURITY_RULES_CODE;
      case 'blueprint':
        return FIREBASE_BLUEPRINT_SCHEMA_JSON;
      case 'structure':
        return folderStructureText;
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-slate-900 text-slate-100 rounded-3xl max-w-5xl w-full border-2 border-slate-700 shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="font-bold text-base text-white">
                VKid Production Code Export (Supabase, Flutter, BunnyStream)
              </h3>
              <p className="text-[11px] text-slate-400">
                Postgres RLS Schema, Flutter Services, Signed Video Token Utilities, & App Shell
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundFx.playPop();
              onClose();
            }}
            className="p-1.5 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Code Tabs */}
        <div className="flex items-center justify-between bg-slate-950 px-4 py-2 border-b border-slate-800 overflow-x-auto shrink-0">
          <div className="flex items-center gap-1.5 min-w-max">
            <button
              onClick={() => setActiveCodeTab('supabase')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeCodeTab === 'supabase' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>1. Supabase SQL & RLS</span>
            </button>

            <button
              onClick={() => setActiveCodeTab('supabase_flutter')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeCodeTab === 'supabase_flutter'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>2. Flutter Supabase Service</span>
            </button>

            <button
              onClick={() => setActiveCodeTab('bunnystream')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeCodeTab === 'bunnystream' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>3. BunnyStream Signed Token</span>
            </button>

            <button
              onClick={() => setActiveCodeTab('flutter')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeCodeTab === 'flutter' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>lib/main.dart</span>
            </button>

            <button
              onClick={() => setActiveCodeTab('rules')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeCodeTab === 'rules' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>firestore.rules</span>
            </button>

            <button
              onClick={() => setActiveCodeTab('structure')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeCodeTab === 'structure' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span>Project Tree</span>
            </button>
          </div>

          <button
            onClick={() => handleCopy(getCodeForTab(), activeCodeTab)}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors ml-2 shrink-0"
          >
            {copiedTab === activeCodeTab ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        {/* Code Content Window */}
        <div className="p-4 overflow-y-auto flex-1 font-mono text-xs bg-slate-950 text-slate-300 leading-relaxed">
          <pre className="whitespace-pre-wrap">{getCodeForTab()}</pre>
        </div>
      </div>
    </div>
  );
};

