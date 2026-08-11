import React, { useState } from 'react';
import { NARRATOR_VOICES } from '../data/voicesAndMoods';
import { NarratorVoice } from '../types';
import { generateTTSChunkAudio } from '../utils/geminiTTS';
import { createWavBlob } from '../utils/audioEncoder';
import { X, Play, Pause, Loader2, Volume2, Sparkles, UserCheck, Check } from 'lucide-react';

interface VoiceLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedVoiceId: string;
  onSelectVoice: (voiceId: string) => void;
  apiKey: string;
}

export const VoiceLibraryModal: React.FC<VoiceLibraryModalProps> = ({
  isOpen,
  onClose,
  selectedVoiceId,
  onSelectVoice,
  apiKey,
}) => {
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [loadingVoiceId, setLoadingVoiceId] = useState<string | null>(null);
  const [voiceAudioUrls, setVoiceAudioUrls] = useState<Record<string, string>>({});
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePreviewVoice = async (voice: NarratorVoice) => {
    setErrorMsg(null);

    // Stop currently playing audio
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
    }

    if (playingVoiceId === voice.id) {
      setPlayingVoiceId(null);
      return;
    }

    // Check if we already generated sample audio
    if (voiceAudioUrls[voice.id]) {
      playAudioUrl(voice.id, voiceAudioUrls[voice.id]);
      return;
    }

    if (!apiKey || apiKey.length < 5) {
      setErrorMsg('API Key is missing. Please configure GEMINI_API_KEY in AI Studio.');
      return;
    }

    setLoadingVoiceId(voice.id);

    try {
      const samplePrompt = voice.sampleText || `नमस्ते! मैं ${voice.name} हूँ। कहानीवर्श में आपका स्वागत है। [dramatic pause] सुनिए मेरी आवाज।`;
      const samples = await generateTTSChunkAudio(samplePrompt, voice.id, apiKey, 2);
      const wavBlob = createWavBlob(samples, 24000);
      const url = URL.createObjectURL(wavBlob);

      setVoiceAudioUrls((prev) => ({ ...prev, [voice.id]: url }));
      setLoadingVoiceId(null);
      playAudioUrl(voice.id, url);
    } catch (err: unknown) {
      setLoadingVoiceId(null);
      const msg = err instanceof Error ? err.message : 'Preview generation failed';
      setErrorMsg(`Failed to generate preview for ${voice.name}: ${msg}`);
    }
  };

  const playAudioUrl = (voiceId: string, url: string) => {
    const audio = new Audio(url);
    audio.play().catch(console.error);
    setPlayingVoiceId(voiceId);
    setCurrentAudio(audio);

    audio.onended = () => {
      setPlayingVoiceId(null);
      setCurrentAudio(null);
    };
  };

  const handleSelectAndClose = (voiceId: string) => {
    onSelectVoice(voiceId);
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-2xl bg-stone-900 border border-amber-500/30 rounded-3xl p-6 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-stone-100 font-serif">सूत्रधार आवाज लाइब्रेरी (Voice Library)</h3>
              <p className="text-xs text-stone-400">Gemini TTS 3.1 मॉडल के विभिन्न पात्रों के 10-सेकंड सैंपल सुनें</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Voices List */}
        <div className="space-y-3">
          {NARRATOR_VOICES.map((voice) => {
            const isSelected = voice.id === selectedVoiceId;
            const isLoading = loadingVoiceId === voice.id;
            const isPlaying = playingVoiceId === voice.id;

            return (
              <div
                key={voice.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-amber-950/40 border-amber-500/70 text-amber-200 ring-1 ring-amber-500/30'
                    : 'bg-stone-950/60 border-stone-800 text-stone-300 hover:border-stone-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handlePreviewVoice(voice)}
                    disabled={isLoading}
                    type="button"
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform active:scale-95 cursor-pointer ${
                      isPlaying
                        ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-stone-950 shadow-lg shadow-amber-500/30'
                        : 'bg-stone-800 hover:bg-stone-700 text-amber-400 border border-stone-700'
                    }`}
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : isPlaying ? (
                      <Pause className="w-5 h-5 fill-stone-950" />
                    ) : (
                      <Play className="w-5 h-5 fill-amber-400 ml-0.5" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-stone-100">{voice.hindiName}</h4>
                      <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-stone-800 text-amber-400 border border-stone-700">
                        {voice.gender === 'male' ? 'पुरुष (Male)' : 'महिला (Female)'}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 leading-relaxed">{voice.description}</p>
                    {voice.sampleText && (
                      <p className="text-[11px] text-amber-300/80 italic font-mono">
                        "{voice.sampleText.substring(0, 75)}..."
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleSelectAndClose(voice.id)}
                  type="button"
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                      : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-4 h-4" /> चयनित (Selected)
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" /> चुनें (Select)
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        <div className="text-center pt-2">
          <p className="text-xs text-stone-500 flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> सैंपल पहली बार प्ले करने पर लाइव Gemini API से तुरंत जनरेट होता है।
          </p>
        </div>
      </div>
    </div>
  );
};
