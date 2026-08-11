import React from 'react';
import { AudioChunkItem } from '../types';
import { RefreshCw, AlertCircle, Loader2, Sparkles, Volume2, Music, CheckCircle2 } from 'lucide-react';

interface ProgressIndicatorProps {
  chunks: AudioChunkItem[];
  activeChunkIndex: number;
  overallStatusText: string;
  onRetryChunk: (chunkIndex: number) => void;
  onRetryAllFailed: () => void;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  chunks,
  activeChunkIndex,
  overallStatusText,
  onRetryAllFailed,
}) => {
  const [displayPercent, setDisplayPercent] = React.useState<number>(1);

  const total = chunks.length;
  const completedCount = chunks.filter((c) => c.status === 'completed').length;
  const failedCount = chunks.filter((c) => c.status === 'failed').length;

  React.useEffect(() => {
    if (total === 0) {
      setDisplayPercent(1);
      return;
    }

    if (completedCount === total) {
      setDisplayPercent(100);
      return;
    }

    // Calculate dynamic target percentage based on chunk states
    const chunkWeight = 75 / total; // 75% allocated for TTS chunk generation
    const completedProgress = 15 + completedCount * chunkWeight;
    const activeChunk = chunks[activeChunkIndex];

    let activeProgressOffset = 0;
    if (activeChunk) {
      if (activeChunk.status === 'enhancing') {
        activeProgressOffset = chunkWeight * 0.25;
      } else if (activeChunk.status === 'generating') {
        activeProgressOffset = chunkWeight * 0.65;
      }
    }

    const targetPercent = Math.min(98, Math.max(1, Math.round(completedProgress + activeProgressOffset)));

    // Smooth real-time timer ticking towards target
    const timer = setInterval(() => {
      setDisplayPercent((prev) => {
        if (prev < targetPercent) {
          return prev + 1;
        } else if (prev < 98 && targetPercent < 100) {
          // Slow continuous creeping while waiting for network API response
          return prev + (Math.random() < 0.35 ? 1 : 0);
        } else if (targetPercent === 100) {
          return 100;
        }
        return prev;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [chunks, activeChunkIndex, completedCount, total]);

  if (chunks.length === 0) return null;

  // Determine active step
  const isTaggingStep = displayPercent < 15;
  const isTtsStep = displayPercent >= 15 && displayPercent < 90;
  const isMasteringStep = displayPercent >= 90;

  return (
    <div className="w-full bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-6 animate-fadeIn relative overflow-hidden">
      {/* Background Subtle Glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Single Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0 mt-0.5">
            <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-amber-200">
                {overallStatusText || 'ऑडियो ड्रामा जनरेट हो रहा है...'}
              </h3>
              <span className="text-[10px] bg-amber-500 text-stone-950 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-950 animate-ping" />
                लाइव काउंटिंग (1-100%)
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-1">
              Gemini 3.1 Flash TTS मॉडल पूरी कहानी को रियल-टाइम में प्रोसेस कर रहा है (हिस्सा {completedCount + 1} / {total})
            </p>
          </div>
        </div>

        {/* Big Percentage Display */}
        <div className="flex items-center justify-between sm:justify-end gap-3 bg-stone-950/80 px-4 py-2.5 rounded-xl border border-stone-800">
          <div className="text-right">
            <div className="text-3xl font-black text-amber-400 font-mono leading-none flex items-baseline justify-end gap-0.5">
              <span>{displayPercent}</span>
              <span className="text-lg text-amber-500/70">%</span>
            </div>
            <span className="text-[10px] text-stone-400 uppercase font-semibold tracking-wider block mt-0.5">
              रियल-टाइम प्रोग्रेस
            </span>
          </div>

          {/* Animated Equalizer Wave */}
          <div className="flex items-end gap-1 h-7 px-2 border-l border-stone-800">
            <div className="w-1 bg-amber-500 rounded-full animate-bounce h-3" style={{ animationDelay: '0ms' }} />
            <div className="w-1 bg-amber-400 rounded-full animate-bounce h-6" style={{ animationDelay: '150ms' }} />
            <div className="w-1 bg-orange-500 rounded-full animate-bounce h-4" style={{ animationDelay: '300ms' }} />
            <div className="w-1 bg-amber-300 rounded-full animate-bounce h-5" style={{ animationDelay: '450ms' }} />
          </div>
        </div>
      </div>

      {/* Smooth Real-Time Progress Bar */}
      <div className="space-y-1.5">
        <div className="w-full bg-stone-950 rounded-full h-4 p-0.5 overflow-hidden border border-stone-800 shadow-inner">
          <div
            className="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-400 h-full rounded-full transition-all duration-300 shadow-md shadow-amber-500/40 relative overflow-hidden"
            style={{ width: `${Math.max(displayPercent, 3)}%` }}
          >
            <div className="absolute inset-0 bg-white/25 animate-pulse" />
          </div>
        </div>
        <div className="flex justify-between items-center text-[11px] text-stone-400 font-mono px-1">
          <span>0%</span>
          <span className="text-amber-400 font-bold">{displayPercent}% तैयार</span>
          <span>100%</span>
        </div>
      </div>

      {/* Unified 3-Step Process Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-stone-800/80">
        {/* Step 1 */}
        <div
          className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 transition-all ${
            displayPercent >= 15
              ? 'bg-stone-950/80 border-emerald-900/50 text-emerald-300'
              : isTaggingStep
              ? 'bg-amber-950/40 border-amber-500/60 text-amber-200 ring-1 ring-amber-500/30'
              : 'bg-stone-950/40 border-stone-800/60 text-stone-500'
          }`}
        >
          {displayPercent >= 15 ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
          )}
          <div>
            <div className="font-bold text-[12px]">1. एआई इमोशन टैगिंग</div>
            <div className="text-[10px] text-stone-400">संवादों में भाव पहचानना</div>
          </div>
        </div>

        {/* Step 2 */}
        <div
          className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 transition-all ${
            displayPercent >= 90
              ? 'bg-stone-950/80 border-emerald-900/50 text-emerald-300'
              : isTtsStep
              ? 'bg-amber-950/40 border-amber-500/60 text-amber-200 ring-1 ring-amber-500/30'
              : 'bg-stone-950/40 border-stone-800/60 text-stone-500'
          }`}
        >
          {displayPercent >= 90 ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : isTtsStep ? (
            <Volume2 className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
          ) : (
            <Volume2 className="w-4 h-4 text-stone-600 shrink-0" />
          )}
          <div>
            <div className="font-bold text-[12px]">2. एआई आवाज संश्लेषण</div>
            <div className="text-[10px] text-stone-400">Gemini 3.1 TTS वॉस डबिंग</div>
          </div>
        </div>

        {/* Step 3 */}
        <div
          className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 transition-all ${
            displayPercent === 100
              ? 'bg-stone-950/80 border-emerald-900/50 text-emerald-300'
              : isMasteringStep
              ? 'bg-amber-950/40 border-amber-500/60 text-amber-200 ring-1 ring-amber-500/30'
              : 'bg-stone-950/40 border-stone-800/60 text-stone-500'
          }`}
        >
          {displayPercent === 100 ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : isMasteringStep ? (
            <Music className="w-4 h-4 text-amber-400 animate-bounce shrink-0" />
          ) : (
            <Music className="w-4 h-4 text-stone-600 shrink-0" />
          )}
          <div>
            <div className="font-bold text-[12px]">3. बैकग्राउंड संगीत मिक्स</div>
            <div className="text-[10px] text-stone-400">अंतिम ऑडियो ड्रामा मास्टरिंग</div>
          </div>
        </div>
      </div>

      {/* Error & Retry Banner if any issues */}
      {failedCount > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-rose-950/60 p-3.5 rounded-xl border border-rose-800/80 text-xs text-rose-200 gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>ऑडियो जनरेट करने में कुछ रुकावट आई है। कृपया पुनः प्रयास करें।</span>
          </div>
          <button
            onClick={onRetryAllFailed}
            type="button"
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-800 hover:bg-rose-700 text-white font-bold transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> दोबारा प्रयास करें (Retry)
          </button>
        </div>
      )}
    </div>
  );
};

