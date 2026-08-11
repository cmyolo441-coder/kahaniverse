import React from 'react';
import { NARRATOR_VOICES, STORY_MOODS, BACKGROUND_AMBIANCES } from '../data/voicesAndMoods';
import { StoryMoodId, BackgroundAmbianceId, StoryAIAnalysis } from '../types';
import { UserCheck, Sparkles, Play, ShieldAlert, Heart, Zap, BookOpen, Feather, Volume2, Music, CloudRain, Flame, Ghost, Trees, Users, VolumeX, Bot, Loader2, Wand2 } from 'lucide-react';

interface ConfigurationControlsProps {
  selectedVoice: string;
  onSelectVoice: (voiceId: string) => void;
  selectedMood: string;
  onSelectMood: (moodId: string) => void;
  selectedAmbiance: string;
  onSelectAmbiance: (ambianceId: string) => void;
  autoEnhance: boolean;
  onToggleAutoEnhance: (val: boolean) => void;
  onOpenVoiceLibrary: () => void;
  onRunAutoAnalysis: () => void;
  isAnalyzing: boolean;
  aiAnalysis: StoryAIAnalysis | null;
  onGenerate: () => void;
  isGenerating: boolean;
  canGenerate: boolean;
}

export const ConfigurationControls: React.FC<ConfigurationControlsProps> = ({
  selectedVoice,
  onSelectVoice,
  selectedMood,
  onSelectMood,
  selectedAmbiance,
  onSelectAmbiance,
  autoEnhance,
  onToggleAutoEnhance,
  onOpenVoiceLibrary,
  onRunAutoAnalysis,
  isAnalyzing,
  aiAnalysis,
  onGenerate,
  isGenerating,
  canGenerate,
}) => {
  const getVoiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldAlert': return <ShieldAlert className="w-4 h-4 text-amber-400" />;
      case 'Heart': return <Heart className="w-4 h-4 text-rose-400" />;
      case 'Zap': return <Zap className="w-4 h-4 text-orange-400" />;
      case 'BookOpen': return <BookOpen className="w-4 h-4 text-amber-500" />;
      case 'Feather': return <Feather className="w-4 h-4 text-emerald-400" />;
      default: return <UserCheck className="w-4 h-4 text-amber-400" />;
    }
  };

  const getAmbianceIcon = (iconName: string) => {
    switch (iconName) {
      case 'CloudRain': return <CloudRain className="w-4 h-4 text-blue-400" />;
      case 'Flame': return <Flame className="w-4 h-4 text-orange-400" />;
      case 'Ghost': return <Ghost className="w-4 h-4 text-purple-400" />;
      case 'Trees': return <Trees className="w-4 h-4 text-emerald-400" />;
      case 'Users': return <Users className="w-4 h-4 text-amber-400" />;
      default: return <VolumeX className="w-4 h-4 text-stone-500" />;
    }
  };

  const currentVoiceObj = NARRATOR_VOICES.find((v) => v.id === selectedVoice);
  const currentMoodObj = STORY_MOODS.find((m) => m.id === selectedMood);
  const currentAmbianceObj = BACKGROUND_AMBIANCES.find((a) => a.id === selectedAmbiance);

  return (
    <div className="w-full bg-stone-900/60 border border-amber-900/30 rounded-2xl p-4 sm:p-6 shadow-xl space-y-6">
      {/* Quick AI Director Analysis Trigger Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-stone-950/80 border border-amber-500/30">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-100 flex items-center gap-2">
              ऑटो एआई मोड (Automatic AI Story Director)
              <span className="text-[10px] bg-amber-500 text-stone-950 px-2 py-0.2 font-extrabold rounded-full uppercase">
                स्मार्ट मोड
              </span>
            </h3>
            <p className="text-xs text-stone-400">
              कहानी के मुताबिक आवाज, भाव और बैकग्राउंड खुद-ब-खुद तय होंगे।
            </p>
          </div>
        </div>

        <button
          onClick={onRunAutoAnalysis}
          disabled={isAnalyzing || !canGenerate}
          type="button"
          className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-stone-950 border border-amber-500/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              <span>कहानी का विश्लेषण हो रहा है...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              <span>कहानी से ऑटो-डिटेक्ट करें (AI Auto Setup)</span>
            </>
          )}
        </button>
      </div>

      {/* AI Analysis Result Card */}
      {aiAnalysis && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/60 via-stone-900 to-orange-950/40 border border-amber-500/50 text-amber-200 text-xs sm:text-sm space-y-2.5 animate-fadeIn shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-amber-400">
              <Sparkles className="w-4 h-4 text-amber-400" /> कहानी का AI निदेशक विश्लेषण (AI Story Setup Reason)
            </div>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 font-semibold">
              100% ऑटो-कॉन्फ़िगर
            </span>
          </div>
          <p className="text-stone-300 text-xs leading-relaxed">{aiAnalysis.explanationHindi}</p>
          
          <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px]">
            <span className="bg-amber-500/20 px-2.5 py-1 rounded text-amber-300 border border-amber-500/30 font-semibold">
              🎙️ आवाज: {aiAnalysis.recommendedVoiceHindi}
            </span>
            <span className="bg-amber-500/20 px-2.5 py-1 rounded text-amber-300 border border-amber-500/30 font-semibold">
              🎭 भाव: {aiAnalysis.recommendedMoodHindi}
            </span>
            <span className="bg-amber-500/20 px-2.5 py-1 rounded text-amber-300 border border-amber-500/30 font-semibold">
              🌧️ माहौल: {aiAnalysis.recommendedAmbianceHindi}
            </span>
          </div>

          {/* Auto-detected Character Role Cast */}
          {aiAnalysis.characterCast && aiAnalysis.characterCast.length > 0 && (
            <div className="pt-2 border-t border-amber-900/40 space-y-1.5">
              <span className="text-[11px] font-bold text-amber-400 flex items-center justify-between">
                <span>🎭 कहानी के ऑटो-डिटेक्टेड पात्र व आवाज़ें (Auto Character & Voice Cast):</span>
                <span className="text-[10px] text-amber-300/80 font-normal">मल्टी-कैरेक्टर रोल प्ले</span>
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {aiAnalysis.characterCast.map((char, idx) => (
                  <div
                    key={idx}
                    className="bg-stone-950/90 p-1.5 px-2.5 rounded-lg border border-amber-500/20 flex items-center justify-between gap-2 text-[11px]"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-sm">{char.iconEmoji || '👤'}</span>
                      <span className="font-semibold text-stone-200 truncate">{char.name}</span>
                    </div>
                    <span className="bg-amber-500/10 text-amber-300 px-1.5 py-0.5 rounded text-[10px] font-mono shrink-0 border border-amber-500/20">
                      {char.voiceId}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Auto-detected Sound Effects (SFX) */}
          {aiAnalysis.sfxTriggers && aiAnalysis.sfxTriggers.length > 0 && (
            <div className="pt-2 border-t border-amber-900/40 space-y-1.5">
              <span className="text-[11px] font-bold text-amber-400 flex items-center justify-between">
                <span>🔊 ऑटो-डिटेक्टेड साउंड इफेक्ट्स (Auto Dynamic SFX):</span>
                <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                  ऑटोमिक मिक्सिंग ऑन
                </span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {aiAnalysis.sfxTriggers.map((sfx, idx) => (
                  <div
                    key={idx}
                    className="bg-stone-950/90 px-2.5 py-1 rounded-lg border border-amber-500/30 flex items-center gap-1.5 text-[11px] text-amber-200"
                  >
                    <span className="text-sm">{sfx.iconEmoji}</span>
                    <span className="font-medium">{sfx.hindiName}</span>
                    <span className="text-[10px] bg-amber-500/10 text-amber-400 px-1 rounded font-mono">
                      ~{sfx.positionPercent}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {aiAnalysis.sampleEmotionTags && aiAnalysis.sampleEmotionTags.length > 0 && (
            <div className="pt-1.5 border-t border-amber-900/40">
              <span className="text-[11px] font-bold text-amber-400 block mb-1">
                ✨ संवादों में एआई इमोशन टैग्स (Automatically Identified Dialogue Emotions):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {aiAnalysis.sampleEmotionTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-stone-950/80 text-amber-200 px-2 py-0.5 rounded text-[11px] border border-amber-500/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Narrator Voice Dropdown */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-stone-200 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-amber-500" /> सूत्रधार की आवाज (Voice)
            </label>

            <button
              onClick={onOpenVoiceLibrary}
              type="button"
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-950/80 border border-amber-800/50 px-2 py-0.5 rounded cursor-pointer transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5" /> लाइब्रेरी (Preview)
            </button>
          </div>

          <div className="relative">
            <select
              value={selectedVoice}
              onChange={(e) => onSelectVoice(e.target.value)}
              disabled={isGenerating}
              className="w-full bg-stone-950 text-stone-100 p-3.5 pl-10 rounded-xl border border-stone-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none text-xs sm:text-sm font-medium cursor-pointer appearance-none transition-all"
            >
              <option value="auto" className="bg-amber-950 text-amber-300 font-bold">
                ✨ ऑटो (AI कहानी के अनुसार चुनेगा)
              </option>
              {NARRATOR_VOICES.map((voice) => (
                <option key={voice.id} value={voice.id} className="bg-stone-900 text-stone-100 py-2">
                  {voice.hindiName}
                </option>
              ))}
            </select>
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
              {selectedVoice === 'auto' ? (
                <Wand2 className="w-4 h-4 text-amber-400 animate-pulse" />
              ) : (
                getVoiceIcon(currentVoiceObj?.iconName || '')
              )}
            </div>
          </div>
          <p className="text-xs text-stone-400 italic px-1 line-clamp-1">
            {selectedVoice === 'auto'
              ? 'AI कहानी पढ़कर खुद पात्र के अनुकूल आवाज तय करेगा'
              : currentVoiceObj?.description}
          </p>
        </div>

        {/* Overall Mood Dropdown */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-stone-200 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" /> कहानी का भाव (Overall Mood)
            </span>
          </label>

          <div className="relative">
            <select
              value={selectedMood}
              onChange={(e) => onSelectMood(e.target.value)}
              disabled={isGenerating}
              className="w-full bg-stone-950 text-stone-100 p-3.5 pl-10 rounded-xl border border-stone-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none text-xs sm:text-sm font-medium cursor-pointer appearance-none transition-all"
            >
              <option value="auto" className="bg-amber-950 text-amber-300 font-bold">
                ✨ ऑटो (AI कहानी से भाव पहचानेगा)
              </option>
              {STORY_MOODS.map((mood) => (
                <option key={mood.id} value={mood.id} className="bg-stone-900 text-stone-100 py-2">
                  {mood.hindiName}
                </option>
              ))}
            </select>
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <p className="text-xs text-stone-400 italic px-1 line-clamp-1">
            {selectedMood === 'auto'
              ? 'AI सस्पेंस, ड्रामा या शांति का भाव अपने आप तय करेगा'
              : currentMoodObj?.description}
          </p>
        </div>

        {/* Background Ambiance Dropdown */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-stone-200 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Music className="w-4 h-4 text-amber-500" /> बैकग्राउंड माहौल (Background Ambiance)
            </span>
          </label>

          <div className="relative">
            <select
              value={selectedAmbiance}
              onChange={(e) => onSelectAmbiance(e.target.value)}
              disabled={isGenerating}
              className="w-full bg-stone-950 text-stone-100 p-3.5 pl-10 rounded-xl border border-stone-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none text-xs sm:text-sm font-medium cursor-pointer appearance-none transition-all"
            >
              <option value="auto" className="bg-amber-950 text-amber-300 font-bold">
                ✨ ऑटो (AI माहौल के अनुसार ध्वनि चुनेगा)
              </option>
              {BACKGROUND_AMBIANCES.map((amb) => (
                <option key={amb.id} value={amb.id} className="bg-stone-900 text-stone-100 py-2">
                  {amb.hindiName}
                </option>
              ))}
            </select>
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
              {selectedAmbiance === 'auto' ? (
                <Wand2 className="w-4 h-4 text-amber-400 animate-pulse" />
              ) : (
                getAmbianceIcon(currentAmbianceObj?.iconName || '')
              )}
            </div>
          </div>
          <p className="text-xs text-stone-400 italic px-1 line-clamp-1">
            {selectedAmbiance === 'auto'
              ? 'बारिश, जंगल या सन्नाटा ऑटो-मिक्स होगा'
              : currentAmbianceObj?.description}
          </p>
        </div>
      </div>

      {/* Auto Emotion Tagging Switch */}
      <div className="flex items-center justify-between bg-stone-950/60 p-3.5 rounded-xl border border-stone-800">
        <div className="flex items-center gap-2.5">
          <input
            type="checkbox"
            id="auto-enhance-toggle"
            checked={autoEnhance}
            onChange={(e) => onToggleAutoEnhance(e.target.checked)}
            disabled={isGenerating}
            className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-stone-900 border-stone-700 cursor-pointer"
          />
          <label htmlFor="auto-enhance-toggle" className="text-xs sm:text-sm font-medium text-stone-200 cursor-pointer">
            स्वचालित इमोशन टैग्स जोड़ें (Auto AI Pre-processing for Expressive Narration)
          </label>
        </div>
        <span className="text-[11px] text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/40 hidden sm:inline">
          [whispers], [sad], [excited] auto-injected
        </span>
      </div>

      {/* Action Button */}
      <div className="pt-2">
        <button
          onClick={onGenerate}
          disabled={!canGenerate || isGenerating}
          type="button"
          className={`w-full py-4 px-6 rounded-xl font-bold text-base sm:text-lg flex items-center justify-center gap-3 transition-all duration-200 shadow-xl cursor-pointer ${
            !canGenerate || isGenerating
              ? 'bg-stone-800 text-stone-500 border border-stone-700 cursor-not-allowed opacity-60 shadow-none'
              : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:via-orange-400 hover:to-amber-500 text-stone-950 font-black shadow-orange-950/50 hover:shadow-amber-500/20 hover:scale-[1.005] active:scale-[0.99]'
          }`}
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
              <span>ऑडियो ड्रामा तैयार हो रहा है... (Generating Audio...)</span>
            </>
          ) : (
            <>
              <Play className="w-6 h-6 fill-stone-950 text-stone-950" />
              <span>ऑडियो जनरेट करें (Generate Audio Drama)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

