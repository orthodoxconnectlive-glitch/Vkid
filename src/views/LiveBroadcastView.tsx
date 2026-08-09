import React, { useState } from 'react';
import { Radio, Eye, Users, Heart, Send, Sparkles, PlusCircle } from 'lucide-react';
import { BunnyPlayer } from '../components/BunnyPlayer';
import { GoLiveModal } from '../components/GoLiveModal';
import { SEED_VIDEOS } from '../utils/posts';

interface LiveStreamItem {
  id: string;
  title: string;
  parish: string;
  priestName: string;
  viewers: number;
  videoUrl: string;
  isLive: boolean;
}

const INITIAL_STREAMS: LiveStreamItem[] = [
  {
    id: 'stream-1',
    title: 'Divine Liturgy of St. John Chrysostom & Homily',
    parish: 'Holy Trinity Cathedral, Boston',
    priestName: 'Fr. Nicholas Vasileiou',
    viewers: 284,
    videoUrl: SEED_VIDEOS[0],
    isLive: true,
  },
  {
    id: 'stream-2',
    title: 'Great Vespers & Litya for the Holy Transfiguration',
    parish: 'St. George Antiochian Cathedral, Damascus',
    priestName: 'Fr. Gabriel Haddad',
    viewers: 195,
    videoUrl: SEED_VIDEOS[1],
    isLive: true,
  },
];

export const LiveBroadcastView: React.FC = () => {
  const [streams, setStreams] = useState<LiveStreamItem[]>(INITIAL_STREAMS);
  const [activeStreamId, setActiveStreamId] = useState<string>(INITIAL_STREAMS[0].id);
  const [isGoLiveOpen, setIsGoLiveOpen] = useState(false);

  const activeStream = streams.find((s) => s.id === activeStreamId) || streams[0];

  const handleStartStream = (data: { title: string; parish: string; videoUrl: string }) => {
    const newStream: LiveStreamItem = {
      id: 'stream-' + Date.now(),
      title: data.title,
      parish: data.parish,
      priestName: 'You (Priest / Host)',
      viewers: 1,
      videoUrl: data.videoUrl,
      isLive: true,
    };
    setStreams([newStream, ...streams]);
    setActiveStreamId(newStream.id);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Go Live Trigger */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-red-950/60 via-stone-950 to-amber-950/50 border border-red-500/30 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 animate-pulse">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-xl text-amber-100">
              Parish Live Broadcasts
            </h2>
            <p className="text-xs text-stone-400">
              Watch Divine Liturgy and Church Services live via Bunny Stream CDN
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsGoLiveOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all transform hover:scale-105 cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Go Live (Priest / Host)</span>
        </button>
      </div>

      {/* Main Active Stream Player Stage */}
      <div className="space-y-4">
        <BunnyPlayer
          videoUrl={activeStream.videoUrl}
          title={activeStream.title}
          isLive={activeStream.isLive}
          viewerCount={activeStream.viewers}
          autoplay={true}
        />

        <div className="p-4 rounded-2xl bg-stone-950 border border-amber-900/30 flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-lg text-amber-100">
              {activeStream.title}
            </h3>
            <p className="text-xs text-amber-400 font-medium">
              {activeStream.priestName} • {activeStream.parish}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 text-xs font-bold flex items-center gap-1.5 animate-pulse">
              <Eye className="w-3.5 h-3.5" /> {activeStream.viewers} Watching
            </span>
          </div>
        </div>
      </div>

      {/* Other Live Streams Grid */}
      <div className="space-y-3">
        <h3 className="font-serif font-bold text-sm text-amber-300">
          More Parish Broadcasts
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {streams.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveStreamId(s.id)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                s.id === activeStreamId
                  ? 'bg-amber-950/40 border-amber-500 shadow-xl'
                  : 'bg-stone-950 border-amber-900/30 hover:border-amber-500/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider">
                  LIVE
                </span>
                <span className="text-[11px] text-amber-400 flex items-center gap-1">
                  <Eye className="w-3 h-3" /> {s.viewers}
                </span>
              </div>
              <h4 className="font-serif font-bold text-xs text-amber-100 mb-1">
                {s.title}
              </h4>
              <p className="text-[11px] text-stone-400">{s.parish}</p>
            </button>
          ))}
        </div>
      </div>

      <GoLiveModal
        isOpen={isGoLiveOpen}
        onClose={() => setIsGoLiveOpen(false)}
        onStartStream={handleStartStream}
      />
    </div>
  );
};
