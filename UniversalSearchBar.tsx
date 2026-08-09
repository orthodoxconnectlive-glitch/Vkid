import React from 'react';
import { Wifi, Battery, Signal, Monitor, Smartphone, X } from 'lucide-react';

interface DeviceFrameProps {
  isMobileFrame: boolean;
  onExitMobileFrame?: () => void;
  children: React.ReactNode;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({ isMobileFrame, onExitMobileFrame, children }) => {
  if (!isMobileFrame) {
    return <div className="w-full min-h-screen bg-amber-50/40">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-start p-2 sm:p-4 transition-all duration-300">
      {/* Top Floating Normal Mode Exit Control */}
      {onExitMobileFrame && (
        <div className="flex items-center justify-between gap-3 bg-slate-800/90 backdrop-blur-md border border-slate-700 text-slate-100 px-4 py-2 rounded-full shadow-2xl my-2 z-50 animate-in fade-in slide-in-from-top duration-300 max-w-md w-full">
          <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-amber-400" />
            <span>Mobile Simulator Mode</span>
          </span>
          <button
            onClick={onExitMobileFrame}
            className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-extrabold text-xs px-3 py-1.5 rounded-full shadow-md transition-all active:scale-95"
            title="Switch back to full-screen desktop view"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Exit to Normal Mode</span>
          </button>
        </div>
      )}

      {/* Mobile Device Frame Container */}
      <div className="w-full max-w-sm sm:max-w-md bg-slate-950 rounded-[48px] border-[10px] border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden relative flex flex-col h-[840px] max-h-[92vh]">
        {/* Top Phone Notch / Dynamic Island & Status Bar */}
        <div className="bg-white/95 backdrop-blur-md px-6 pt-3 pb-1 flex items-center justify-between text-slate-800 shrink-0 z-40 border-b border-amber-100">
          <span className="text-xs font-black">9:41</span>

          {/* Camera Notch */}
          <div className="w-20 h-4 bg-slate-950 rounded-full flex items-center justify-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-slate-800" />
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-900" />
          </div>

          <div className="flex items-center gap-1.5">
            <Signal className="w-3 h-3 text-slate-700" />
            <Wifi className="w-3 h-3 text-slate-700" />
            <Battery className="w-4 h-4 text-emerald-600 fill-emerald-600" />
          </div>
        </div>

        {/* App Content Body Inside Frame */}
        <div className="flex-1 overflow-y-auto bg-amber-50/40 relative">{children}</div>

        {/* Bottom Home Indicator Bar */}
        <div className="bg-white/90 backdrop-blur-md py-2 flex items-center justify-center shrink-0 border-t border-amber-100">
          <div className="w-32 h-1 bg-slate-400 rounded-full" />
        </div>
      </div>
    </div>
  );
};
