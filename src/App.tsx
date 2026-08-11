import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StoryInput } from './components/StoryInput';
import { ConfigurationControls } from './components/ConfigurationControls';
import { ProgressIndicator } from './components/ProgressIndicator';
import { AudioPlayerSection } from './components/AudioPlayerSection';
import { VoiceLibraryModal } from './components/VoiceLibraryModal';
import { SettingsModal } from './components/SettingsModal';
import { HistorySection } from './components/HistorySection';
import { PRESET_STORIES, NARRATOR_VOICES, STORY_MOODS, BACKGROUND_AMBIANCES } from './data/voicesAndMoods';
import { AudioChunkItem, PresetStory, StoryMoodId, BackgroundAmbianceId, SavedStoryProject, StoryAIAnalysis } from './types';
import { chunkStoryText } from './utils/textProcessor';
import { enhanceTextWithEmotionTags, generateTTSChunkAudio, analyzeStoryForAutoSetup } from './utils/geminiTTS';
import { mergeAudioBuffers, createWavBlob } from './utils/audioEncoder';
import { mixVoiceAndAmbiance } from './utils/ambianceSynthesizer';
import { saveProjectToHistory, getAllHistoryProjects, deleteProjectFromHistory } from './utils/storage';
import { AlertCircle, Flame, Headphones, Radio, Sparkles } from 'lucide-react';

export default function App() {
  const [storyText, setStoryText] = useState<string>(PRESET_STORIES[0].text);
  const [selectedVoice, setSelectedVoice] = useState<string>('auto');
  const [selectedMood, setSelectedMood] = useState<string>('auto');
  const [selectedAmbiance, setSelectedAmbiance] = useState<string>('auto');
  const [autoEnhance, setAutoEnhance] = useState<boolean>(true);

  const [aiAnalysis, setAiAnalysis] = useState<StoryAIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [chunks, setChunks] = useState<AudioChunkItem[]>([]);
  const [activeChunkIndex, setActiveChunkIndex] = useState<number>(0);
  const [overallStatusText, setOverallStatusText] = useState<string>('');
  const [mergedAudioUrl, setMergedAudioUrl] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Modals and History
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [customApiKey, setCustomApiKey] = useState<string>(
    () => localStorage.getItem('custom_gemini_api_key') || ''
  );

  const [historyProjects, setHistoryProjects] = useState<SavedStoryProject[]>([]);
  const [currentLoadedProject, setCurrentLoadedProject] = useState<SavedStoryProject | null>(null);

  // Calculate effective API key (user custom key takes precedence, falls back to system key)
  const systemApiKey = (process.env.GEMINI_API_KEY || '').trim();
  const apiKey = (customApiKey.trim() || systemApiKey).trim();
  const hasApiKey = Boolean(apiKey && apiKey.length > 5);
  const isCustomKeyActive = Boolean(customApiKey.trim().length > 5);

  const handleSaveCustomApiKey = (key: string) => {
    setCustomApiKey(key);
    if (key) {
      localStorage.setItem('custom_gemini_api_key', key);
    } else {
      localStorage.removeItem('custom_gemini_api_key');
    }
  };

  const handleClearCustomApiKey = () => {
    setCustomApiKey('');
    localStorage.removeItem('custom_gemini_api_key');
  };


  const activeVoiceId = selectedVoice === 'auto' ? (aiAnalysis?.recommendedVoice || 'Charon') : selectedVoice;
  const activeMoodId = (selectedMood === 'auto' ? (aiAnalysis?.recommendedMood || 'suspenseful') : selectedMood) as StoryMoodId;
  const activeAmbianceId = (selectedAmbiance === 'auto' ? (aiAnalysis?.recommendedAmbiance || 'eerie') : selectedAmbiance) as BackgroundAmbianceId;

  const voiceObj = NARRATOR_VOICES.find((v) => v.id === activeVoiceId) || NARRATOR_VOICES[0];
  const moodObj = STORY_MOODS.find((m) => m.id === activeMoodId) || STORY_MOODS[0];
  const ambianceObj = BACKGROUND_AMBIANCES.find((a) => a.id === activeAmbianceId) || BACKGROUND_AMBIANCES[0];

  // Load history from IndexedDB on startup
  useEffect(() => {
    getAllHistoryProjects()
      .then(setHistoryProjects)
      .catch((err) => console.error('Failed to load project history:', err));
  }, []);

  const handleRunAutoAnalysis = async (customText?: string): Promise<StoryAIAnalysis | null> => {
    const textToAnalyze = customText || storyText;
    if (!textToAnalyze.trim() || !hasApiKey) return null;

    setIsAnalyzing(true);
    try {
      const analysis = await analyzeStoryForAutoSetup(textToAnalyze, apiKey);
      setAiAnalysis(analysis);
      setIsAnalyzing(false);
      return analysis;
    } catch (err) {
      console.warn('Auto analysis error:', err);
      setIsAnalyzing(false);
      return null;
    }
  };

  const handleSelectPreset = (preset: PresetStory) => {
    setStoryText(preset.text);
    setGlobalError(null);
    setAiAnalysis(null);

    if (hasApiKey) {
      handleRunAutoAnalysis(preset.text);
    }
  };

  const handleStartGeneration = async () => {
    if (!storyText.trim()) return;

    if (!hasApiKey) {
      setGlobalError('Gemini API Key is missing. Please make sure GEMINI_API_KEY is configured in AI Studio Secrets.');
      return;
    }

    setGlobalError(null);
    setIsGenerating(true);

    // Run AI Story Auto Analysis if any setting is in 'auto' mode
    let currentAnalysis = aiAnalysis;
    if (selectedVoice === 'auto' || selectedMood === 'auto' || selectedAmbiance === 'auto') {
      setOverallStatusText('AI निदेशक कहानी का विश्लेषण कर रहा है (Analyzing story mood & voice)...');
      currentAnalysis = await handleRunAutoAnalysis(storyText);
    }

    const effVoiceId = selectedVoice === 'auto' ? (currentAnalysis?.recommendedVoice || 'Charon') : selectedVoice;
    const effMoodId = (selectedMood === 'auto' ? (currentAnalysis?.recommendedMood || 'suspenseful') : selectedMood) as StoryMoodId;
    const effAmbianceId = (selectedAmbiance === 'auto' ? (currentAnalysis?.recommendedAmbiance || 'eerie') : selectedAmbiance) as BackgroundAmbianceId;

    const effMoodObj = STORY_MOODS.find((m) => m.id === effMoodId) || STORY_MOODS[0];

    // 1. Chunking text
    const textChunks = chunkStoryText(storyText, 350);
    if (textChunks.length === 0) {
      setGlobalError('Please enter a valid story text.');
      setIsGenerating(false);
      return;
    }

    const initialChunkItems: AudioChunkItem[] = textChunks.map((txt, index) => ({
      id: `chunk-${index}-${Date.now()}`,
      chunkIndex: index,
      totalChunks: textChunks.length,
      rawText: txt,
      enhancedText: txt,
      status: 'pending',
      retries: 0,
    }));

    setChunks(initialChunkItems);
    const updatedChunks = [...initialChunkItems];

    // 2. Sequential processing
    for (let i = 0; i < textChunks.length; i++) {
      setActiveChunkIndex(i);

      // A. Emotion enhancement step
      let currentEnhanced = updatedChunks[i].rawText;
      if (autoEnhance) {
        setOverallStatusText(`Chunk ${i + 1} of ${textChunks.length} के लिए इमोशन टैग्स विश्लेषण हो रहा है...`);
        updatedChunks[i] = { ...updatedChunks[i], status: 'enhancing' };
        setChunks([...updatedChunks]);

        try {
          currentEnhanced = await enhanceTextWithEmotionTags(updatedChunks[i].rawText, effMoodObj, apiKey);
          updatedChunks[i] = { ...updatedChunks[i], enhancedText: currentEnhanced };
          setChunks([...updatedChunks]);
        } catch (err) {
          console.warn('Enhancement failed, using original text:', err);
        }
      }

      // B. TTS Audio Generation step
      setOverallStatusText(`Chunk ${i + 1} of ${textChunks.length} बन रही है...`);
      updatedChunks[i] = { ...updatedChunks[i], status: 'generating' };
      setChunks([...updatedChunks]);

      try {
        const audioSamples = await generateTTSChunkAudio(currentEnhanced, effVoiceId, apiKey, 2);
        updatedChunks[i] = {
          ...updatedChunks[i],
          status: 'completed',
          audioBuffer: audioSamples,
        };
        setChunks([...updatedChunks]);
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : 'Chunk generation failed';
        updatedChunks[i] = {
          ...updatedChunks[i],
          status: 'failed',
          errorMsg: errMsg,
        };
        setChunks([...updatedChunks]);
      }
    }

    // 3. Concatenate and mix with background ambiance
    await assembleFinalAudio(updatedChunks, effVoiceId, effMoodId, effAmbianceId);
    setIsGenerating(false);
  };

  const handleRetrySingleChunk = async (chunkIndex: number) => {
    if (!hasApiKey || chunkIndex < 0 || chunkIndex >= chunks.length) return;

    const updatedChunks = [...chunks];
    const chunkToRetry = updatedChunks[chunkIndex];

    updatedChunks[chunkIndex] = { ...chunkToRetry, status: 'generating', errorMsg: undefined };
    setChunks([...updatedChunks]);

    try {
      let textToUse = chunkToRetry.enhancedText;
      if (autoEnhance && textToUse === chunkToRetry.rawText) {
        textToUse = await enhanceTextWithEmotionTags(chunkToRetry.rawText, moodObj, apiKey);
      }

      const audioSamples = await generateTTSChunkAudio(textToUse, selectedVoice, apiKey, 2);
      updatedChunks[chunkIndex] = {
        ...updatedChunks[chunkIndex],
        enhancedText: textToUse,
        status: 'completed',
        audioBuffer: audioSamples,
      };
      setChunks([...updatedChunks]);

      // Re-assemble audio
      await assembleFinalAudio(updatedChunks);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Retry failed';
      updatedChunks[chunkIndex] = {
        ...updatedChunks[chunkIndex],
        status: 'failed',
        errorMsg: errMsg,
      };
      setChunks([...updatedChunks]);
    }
  };

  const handleRetryAllFailed = async () => {
    const failedIndices = chunks.map((c, idx) => (c.status === 'failed' ? idx : -1)).filter((idx) => idx !== -1);
    for (const idx of failedIndices) {
      await handleRetrySingleChunk(idx);
    }
  };

  const assembleFinalAudio = async (
    currentChunks: AudioChunkItem[],
    overrideVoiceId?: string,
    overrideMoodId?: StoryMoodId,
    overrideAmbianceId?: BackgroundAmbianceId
  ) => {
    const completedBuffers = currentChunks
      .filter((c) => c.status === 'completed' && c.audioBuffer && c.audioBuffer.length > 0)
      .map((c) => c.audioBuffer as Float32Array);

    if (completedBuffers.length === 0) {
      setGlobalError('No chunks were successfully generated into audio.');
      return;
    }

    const targetVoiceId = overrideVoiceId || activeVoiceId;
    const targetMoodId = overrideMoodId || activeMoodId;
    const targetAmbianceId = overrideAmbianceId || activeAmbianceId;

    const targetVoiceObj = NARRATOR_VOICES.find((v) => v.id === targetVoiceId) || NARRATOR_VOICES[0];
    const targetMoodObj = STORY_MOODS.find((m) => m.id === targetMoodId) || STORY_MOODS[0];
    const targetAmbianceObj = BACKGROUND_AMBIANCES.find((a) => a.id === targetAmbianceId) || BACKGROUND_AMBIANCES[0];

    try {
      // 1. Merge voice chunks
      const mergedVoice = mergeAudioBuffers(completedBuffers, 24000);

      // 2. Mix with selected background ambiance sound layer & dynamic story SFX
      const finalMixed = mixVoiceAndAmbiance(mergedVoice, storyText, targetAmbianceId, 24000);

      // 3. Encode to WAV
      const wavBlob = createWavBlob(finalMixed, 24000);
      const url = URL.createObjectURL(wavBlob);
      setMergedAudioUrl(url);

      // 4. Save project to history (IndexedDB)
      const firstPreset = PRESET_STORIES.find((p) => p.text === storyText);
      const projTitle = firstPreset ? firstPreset.title : storyText.substring(0, 30);
      const projHindiTitle = firstPreset ? firstPreset.hindiTitle : storyText.substring(0, 35);

      const newProject: SavedStoryProject = {
        id: `project-${Date.now()}`,
        title: projTitle,
        hindiTitle: projHindiTitle,
        storyTextSnippet: storyText.substring(0, 100),
        voiceId: targetVoiceId,
        voiceHindiName: targetVoiceObj.hindiName,
        moodId: targetMoodId,
        moodHindiName: targetMoodObj.hindiName,
        ambianceId: targetAmbianceId,
        ambianceHindiName: targetAmbianceObj.hindiName,
        createdAt: Date.now(),
        audioBlob: wavBlob,
        audioUrl: url,
        wordCount: storyText.trim().split(/\s+/).length,
        chunkCount: currentChunks.length,
      };

      const updatedHistory = await saveProjectToHistory(newProject);
      setHistoryProjects(updatedHistory);
      setCurrentLoadedProject(newProject);
    } catch (err) {
      console.error('Failed to concatenate audio buffers:', err);
      setGlobalError('Error merging generated audio chunks.');
    }
  };

  const handleLoadHistoryProject = (project: SavedStoryProject) => {
    let url = project.audioUrl;
    if (project.audioBlob) {
      try {
        const freshBlob = new Blob([project.audioBlob], { type: 'audio/wav' });
        url = URL.createObjectURL(freshBlob);
      } catch {
        // Fallback to project.audioUrl
      }
    }
    if (url) {
      setMergedAudioUrl(url);
      setSelectedVoice(project.voiceId);
      setSelectedMood(project.moodId);
      setSelectedAmbiance(project.ambianceId);
      setCurrentLoadedProject({ ...project, audioUrl: url });
      setGlobalError(null);
    }
  };

  const handleDeleteHistoryProject = async (id: string) => {
    const updated = await deleteProjectFromHistory(id);
    setHistoryProjects(updated);
  };

  const handleResetAll = () => {
    setMergedAudioUrl(null);
    setChunks([]);
    setGlobalError(null);
    setIsGenerating(false);
    setCurrentLoadedProject(null);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-500 selection:text-stone-950">
      {/* Top Navigation / Brand Bar */}
      <Header
        hasApiKey={hasApiKey}
        isCustomKeyActive={isCustomKeyActive}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 space-y-8">
        {/* Hero Welcome Box */}
        <div className="relative rounded-3xl bg-gradient-to-r from-stone-900 via-amber-950/30 to-stone-900 border border-amber-900/40 p-6 sm:p-8 shadow-2xl overflow-hidden">
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
              <Flame className="w-3.5 h-3.5 text-amber-400" /> हिंदी ऑडियो ड्रामा और कहानी वाचक
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-100 tracking-tight font-serif">
              अपनी कहानी लिखें, इंसानी जज्बातों और बैकग्राउंड संगीत के साथ सुनें
            </h2>
            <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              लंबी कहानियाँ पेस्ट करें — <strong className="text-amber-400">Gemini 3.1 TTS</strong> ऑटो-डिटेक्ट से कहानी का भाव, आवाज और बैकग्राउंड माहौल अपने आप चुनता है।
            </p>
          </div>
        </div>

        {/* Global Error Banner */}
        {globalError && (
          <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-800/80 text-rose-200 text-sm flex items-start gap-3 shadow-lg animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong className="font-bold block">त्रुटि (Error):</strong>
              <span>{globalError}</span>
            </div>
          </div>
        )}

        {/* Step 1: Input Text */}
        <StoryInput
          text={storyText}
          onChangeText={setStoryText}
          onSelectPreset={handleSelectPreset}
          selectedMood={selectedMood}
          disabled={isGenerating}
        />

        {/* Step 2: Configuration & Generation Button */}
        <ConfigurationControls
          selectedVoice={selectedVoice}
          onSelectVoice={setSelectedVoice}
          selectedMood={selectedMood}
          onSelectMood={setSelectedMood}
          selectedAmbiance={selectedAmbiance}
          onSelectAmbiance={setSelectedAmbiance}
          autoEnhance={autoEnhance}
          onToggleAutoEnhance={setAutoEnhance}
          onOpenVoiceLibrary={() => setIsVoiceModalOpen(true)}
          onRunAutoAnalysis={() => handleRunAutoAnalysis()}
          isAnalyzing={isAnalyzing}
          aiAnalysis={aiAnalysis}
          onGenerate={handleStartGeneration}
          isGenerating={isGenerating}
          canGenerate={storyText.trim().length > 0}
        />

        {/* History Section (Saved Projects) */}
        <HistorySection
          historyProjects={historyProjects}
          onLoadProject={handleLoadHistoryProject}
          onDeleteProject={handleDeleteHistoryProject}
        />

        {/* Step 3: Generation Progress (While Processing) */}
        {isGenerating && (
          <ProgressIndicator
            chunks={chunks}
            activeChunkIndex={activeChunkIndex}
            overallStatusText={overallStatusText}
            onRetryChunk={handleRetrySingleChunk}
            onRetryAllFailed={handleRetryAllFailed}
          />
        )}

        {/* Step 4: Active Audio Player */}
        {mergedAudioUrl && (
          <AudioPlayerSection
            audioUrl={mergedAudioUrl}
            voiceObj={voiceObj}
            moodObj={moodObj}
            chunks={chunks}
            storyTitle={currentLoadedProject ? currentLoadedProject.hindiTitle : 'KahaniVerse Hindi Drama'}
            onReset={handleResetAll}
          />
        )}
      </main>

      {/* Voice Library Modal */}
      <VoiceLibraryModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        selectedVoiceId={selectedVoice}
        onSelectVoice={setSelectedVoice}
        apiKey={apiKey}
      />

      {/* Settings / Custom API Key Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        customApiKey={customApiKey}
        onSaveApiKey={handleSaveCustomApiKey}
        onClearApiKey={handleClearCustomApiKey}
        hasSystemApiKey={Boolean(systemApiKey && systemApiKey.length > 5)}
      />

      {/* Footer */}
      <footer className="w-full border-t border-stone-900 bg-stone-950 py-6 mt-12 text-center text-xs text-stone-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-amber-500" /> KahaniVerse — Apni Kahani Ko Awaaz Do
          </p>
          <p className="flex items-center gap-1">
            Powered by <Sparkles className="w-3 h-3 text-amber-400" /> Gemini 3.1 Flash TTS Model
          </p>
        </div>
      </footer>
    </div>
  );
}

