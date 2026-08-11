import React from 'react';
import { Flame, Key, Settings, Sparkles, Volume2 } from 'lucide-react';

interface HeaderProps {
  hasApiKey: boolean;
  isCustomKeyActive: boolean;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  hasApiKey,
  isCustomKeyActive,
  onOpenSettings,
}) => {
  return (
    <header className="w-full border-b border-amber-900/30 bg-stone-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Logo & Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 p-0.5 shadow-lg shadow-orange-950/40">
            <div className="w-full h-full bg-stone-950 rounded-[10px] flex items-center justify-center">
              <Flame className="w-6 h-6 text-amber-500 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-amber-200 via-orange-400 to-amber-500 bg-clip-text text-transparent font-serif">
                KahaniVerse
              </h1>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> AI Audio Drama
              </span>
            </div>
            <p className="text-xs text-amber-200/70 font-medium">
              अपनी कहानी को आवाज दो <span className="text-amber-500/40">•</span> Apni Kahani Ko Awaaz Do
            </p>
          </div>
        </div>

        {/* Status badges & Settings */}
        <div className="flex items-center gap-2 text-xs">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 border border-amber-900/40 text-stone-300">
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Gemini 3.1 Flash TTS</span>
          </div>

          <button
            onClick={onOpenSettings}
            type="button"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
              isCustomKeyActive
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200 hover:bg-emerald-900/80'
                : hasApiKey
                ? 'bg-stone-900 border-amber-500/40 text-amber-300 hover:bg-stone-800'
                : 'bg-rose-950/80 border-rose-800/80 text-rose-300 hover:bg-rose-900/80'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>
              {isCustomKeyActive
                ? 'Custom Key'
                : hasApiKey
                ? 'System Key'
                : 'Key जोड़ें'}
            </span>
            <Settings className="w-3.5 h-3.5 ml-0.5 opacity-70" />
          </button>
        </div>
      </div>
    </header>
  );
};

