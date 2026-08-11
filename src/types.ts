export interface NarratorVoice {
  id: string;
  name: string;
  hindiName: string;
  gender: 'male' | 'female';
  character: string;
  description: string;
  iconName: string;
  sampleText?: string;
}

export type StoryMoodId = 'suspenseful' | 'emotional' | 'action' | 'calm' | 'happy';

export interface StoryMood {
  id: StoryMoodId;
  name: string;
  hindiName: string;
  description: string;
  tagPrompt: string;
  color: string;
}

export type BackgroundAmbianceId = 'none' | 'rain' | 'fireside' | 'eerie' | 'forest' | 'market';

export interface BackgroundAmbiance {
  id: BackgroundAmbianceId;
  name: string;
  hindiName: string;
  description: string;
  iconName: string;
}

export type ChunkStatus = 'pending' | 'enhancing' | 'generating' | 'completed' | 'failed';

export interface AudioChunkItem {
  id: string;
  chunkIndex: number;
  totalChunks: number;
  rawText: string;
  enhancedText: string;
  status: ChunkStatus;
  retries: number;
  errorMsg?: string;
  audioBuffer?: Float32Array;
}

export interface PresetStory {
  id: string;
  title: string;
  hindiTitle: string;
  mood: StoryMoodId;
  summary: string;
  text: string;
}

export type AutoOrVoiceId = 'auto' | string;
export type AutoOrMoodId = 'auto' | StoryMoodId;
export type AutoOrAmbianceId = 'auto' | BackgroundAmbianceId;

export interface CharacterRole {
  name: string;
  roleType: 'narrator' | 'male' | 'female' | 'child' | 'animal' | 'bird' | 'elder';
  voiceId: string;
  iconEmoji: string;
  descriptionHindi: string;
}

export type SfxType =
  | 'thunder'
  | 'explosion'
  | 'birds'
  | 'rain_storm'
  | 'beast_roar'
  | 'door_knock'
  | 'river_stream'
  | 'fire_crackle'
  | 'footsteps'
  | 'wind_gust';

export interface SfxTrigger {
  type: SfxType;
  hindiName: string;
  iconEmoji: string;
  keywordMatched: string;
  positionPercent: number;
}

export interface StoryAIAnalysis {
  recommendedVoice: string;
  recommendedVoiceHindi: string;
  recommendedMood: StoryMoodId;
  recommendedMoodHindi: string;
  recommendedAmbiance: BackgroundAmbianceId;
  recommendedAmbianceHindi: string;
  explanationHindi: string;
  sampleEmotionTags?: string[];
  characterCast?: CharacterRole[];
  sfxTriggers?: SfxTrigger[];
}

export interface SavedStoryProject {
  id: string;
  title: string;
  hindiTitle: string;
  storyTextSnippet: string;
  voiceId: string;
  voiceHindiName: string;
  moodId: StoryMoodId;
  moodHindiName: string;
  ambianceId: BackgroundAmbianceId;
  ambianceHindiName: string;
  createdAt: number;
  audioBlob: Blob;
  audioUrl?: string;
  wordCount: number;
  chunkCount: number;
}

