import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Download, Volume2, VolumeX, RotateCcw, Sparkles, FileText, Check } from 'lucide-react';
import { AudioChunkItem, NarratorVoice, StoryMood } from '../types';

interface AudioPlayerSectionProps {
  audioUrl: string;
  voiceObj: NarratorVoice;
  moodObj: StoryMood;
  chunks: AudioChunkItem[];
  storyTitle?: string;
  onReset: () => void;
}

export const AudioPlayerSection: React.FC<AudioPlayerSectionProps> = ({
  audioUrl,
  voiceObj,
  moodObj,
  chunks,
  storyTitle = 'KahaniVerse Audio Drama',
  onReset,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showScriptModal, setShowScriptModal] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);
    const handleEnded = () => setIsPlaying(false);
    const handleError = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [audioUrl]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.warn('Playback error:', err);
          setIsPlaying(false);
        });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    setCurrentTime(targetTime);
    if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
      setIsMuted(newVol === 0);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume || 1;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const handleSpeedChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `${storyTitle.replace(/\s+/g, '_')}_KahaniVerse.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Combine full script with emotion tags for review
  const fullEnhancedScript = chunks.map((c) => c.enhancedText || c.rawText).join('\n\n');

  return (
    <div className="w-full bg-gradient-to-b from-stone-900 via-stone-900/95 to-stone-950 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fadeIn relative overflow-hidden">
      {/* Background glow decoration */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Hidden HTML5 Audio Element */}
      <audio ref={audioRef} src={audioUrl} preload="auto" />

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-800 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs uppercase tracking-wider font-bold text-emerald-400">
              ऑडियो तैयार है (Audio Generation Complete)
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-amber-100 font-serif mt-1">
            {storyTitle}
          </h2>
          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-stone-300">
            <span className="bg-amber-950/60 border border-amber-900/40 text-amber-300 px-2.5 py-1 rounded-md font-medium">
              वाचक: {voiceObj.hindiName}
            </span>
            <span className="bg-stone-800 border border-stone-700 text-stone-300 px-2.5 py-1 rounded-md font-medium">
              भाव: {moodObj.hindiName}
            </span>
            <span className="bg-stone-800 border border-stone-700 text-stone-300 px-2.5 py-1 rounded-md font-medium">
              कुल हिस्से: {chunks.length} Chunks
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowScriptModal(!showScriptModal)}
            type="button"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>इमोशन स्क्रिप्ट देखें</span>
          </button>

          <button
            onClick={onReset}
            type="button"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-800 hover:bg-amber-950 text-stone-300 hover:text-amber-300 border border-stone-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>नई कहानी</span>
          </button>
        </div>
      </div>

      {/* Main Player Visualizer & Controls */}
      <div className="space-y-6 relative z-10">
        {/* Animated Waveform Visualizer */}
        <div className="w-full bg-stone-950/90 rounded-2xl p-6 border border-stone-800 flex flex-col items-center justify-center gap-3 relative">
          <div className="flex items-end justify-center gap-1.5 h-16 w-full max-w-md px-4">
            {[40, 70, 30, 85, 50, 95, 60, 40, 80, 100, 65, 45, 90, 75, 55, 80, 35, 90, 60, 40, 75, 95, 50, 30].map(
              (height, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 rounded-full transition-all duration-150 ${
                    isPlaying
                      ? 'bg-gradient-to-t from-amber-500 to-orange-400 animate-pulse'
                      : 'bg-stone-800'
                  }`}
                  style={{
                    height: isPlaying ? `${Math.max(15, (height * (idx % 3 + 1)) % 100)}%` : '20%',
                    animationDelay: `${(idx % 5) * 0.1}s`,
                  }}
                />
              )
            )}
          </div>

          <div className="text-xs text-stone-400 font-mono">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        {/* Timeline Seek Slider */}
        <div className="space-y-1">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full accent-amber-500 h-2 bg-stone-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-stone-500 font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Main Controls Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-stone-950/60 p-4 rounded-2xl border border-stone-800/80">
          {/* Play/Pause Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlayPause}
              type="button"
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 hover:from-amber-300 hover:to-orange-400 text-stone-950 font-black flex items-center justify-center shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              {isPlaying ? <Pause className="w-7 h-7 fill-stone-950" /> : <Play className="w-7 h-7 fill-stone-950 ml-0.5" />}
            </button>

            <div>
              <p className="text-sm font-bold text-stone-200">
                {isPlaying ? 'ऑडियो प्ले हो रहा है...' : 'सुनने के लिए प्ले बटन दबाएं'}
              </p>
              <p className="text-xs text-stone-400">Gemini 3.1 TTS Speech Synthesis</p>
            </div>
          </div>

          {/* Volume & Speed */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Speed Selector */}
            <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-lg border border-stone-800 text-xs">
              {[0.8, 1.0, 1.25, 1.5].map((rate) => (
                <button
                  key={rate}
                  onClick={() => handleSpeedChange(rate)}
                  type="button"
                  className={`px-2 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                    playbackRate === rate
                      ? 'bg-amber-500 text-stone-950'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                type="button"
                className="text-stone-400 hover:text-amber-400 transition-colors"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            type="button"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            {downloaded ? (
              <>
                <Check className="w-5 h-5 text-stone-950" />
                <span>डाउनलोड हो गया!</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5 text-stone-950" />
                <span>WAV फ़ाइल डाउनलोड करें</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Emotion Script Review Modal / Drawer */}
      {showScriptModal && (
        <div className="mt-4 p-5 rounded-2xl bg-stone-950 border border-amber-900/50 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-stone-800">
            <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" /> AI द्वारा जोड़े गए इमोशन टैग्स वाली कहानी (Enhanced Script)
            </h3>
            <button
              onClick={() => setShowScriptModal(false)}
              className="text-xs text-stone-400 hover:text-stone-200"
            >
              बंद करें
            </button>
          </div>
          <div className="max-h-60 overflow-y-auto p-3 bg-stone-900/60 rounded-xl text-xs sm:text-sm text-stone-300 leading-relaxed font-sans whitespace-pre-wrap border border-stone-800">
            {fullEnhancedScript.split(/(\[[a-z\s]+\])/gi).map((part, index) => {
              if (part.startsWith('[') && part.endsWith(']')) {
                return (
                  <span
                    key={index}
                    className="inline-block px-1.5 py-0.5 mx-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-[11px] font-bold"
                  >
                    {part}
                  </span>
                );
              }
              return part;
            })}
          </div>
        </div>
      )}
    </div>
  );
};
