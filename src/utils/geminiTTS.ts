import { GoogleGenAI, Modality, Type } from '@google/genai';
import { StoryMood, StoryAIAnalysis, StoryMoodId, BackgroundAmbianceId } from '../types';
import { base64ToUint8Array, decodeAudioDataToSamples } from './audioEncoder';
import { detectStorySfxTriggers } from './ambianceSynthesizer';

/**
 * Analyzes story text using Gemini 3.6 Flash to automatically select
 * the optimal voice, mood, and background ambiance along with Hindi explanation.
 */
export async function analyzeStoryForAutoSetup(
  storyText: string,
  apiKey: string
): Promise<StoryAIAnalysis> {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('Gemini API key is missing.');
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `You are an expert audio drama director for Hindi audiobooks.
Analyze the following Hindi story and perform full automatic character cast detection (Narrator, Male/Boy, Female/Girl, Child, Animal/Monster, Bird/Creature, Elder).
Select the single BEST Narrator Voice, Story Mood, Background Ambiance, key emotional tags, and detected Character Roles with voice assignments.

Available Narrator Voices (voiceId):
  * "Charon": Deep, dramatic, suspenseful, horror (पुरुष - गंभीर व डरावना)
  * "Kore": Warm, expressive, emotional, female (महिला - भावुक व मधुर)
  * "Puck": Young, energetic, action, funny (युवा लड़का - जोशीला व एक्शन)
  * "Fenrir": Wise, authoritative, ancient history, elder (बुजुर्ग - गंभीर व रौबदार)
  * "Zephyr": Calm, gentle, peaceful, birds/nature (शांत कहानीकार)

Character Role Types & Suggested Voices:
  - "narrator": Main storyteller (Charon / Kore / Puck / Zephyr)
  - "male": Boy / Young Man / Hero / Villager (Puck / Charon)
  - "female": Girl / Woman / Heroine / Mother (Kore)
  - "child": Kid / Young child (Puck)
  - "animal": Monster / Beast / Lion / Serpent (Charon)
  - "bird": Bird / Parrot / Creature (Zephyr)
  - "elder": Old Sage / Grandpa / Teacher (Fenrir)

Story Text:
${storyText.substring(0, 1800)}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendedVoice: { type: Type.STRING },
            recommendedVoiceHindi: { type: Type.STRING },
            recommendedMood: { type: Type.STRING },
            recommendedMoodHindi: { type: Type.STRING },
            recommendedAmbiance: { type: Type.STRING },
            recommendedAmbianceHindi: { type: Type.STRING },
            explanationHindi: { type: Type.STRING },
            sampleEmotionTags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            characterCast: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  roleType: { type: Type.STRING },
                  voiceId: { type: Type.STRING },
                  iconEmoji: { type: Type.STRING },
                  descriptionHindi: { type: Type.STRING },
                },
                required: ['name', 'roleType', 'voiceId', 'iconEmoji', 'descriptionHindi'],
              },
            },
          },
          required: [
            'recommendedVoice',
            'recommendedVoiceHindi',
            'recommendedMood',
            'recommendedMoodHindi',
            'recommendedAmbiance',
            'recommendedAmbianceHindi',
            'explanationHindi',
            'sampleEmotionTags',
            'characterCast',
          ],
        },
      },
    });

    const jsonText = response.text?.trim();
    if (jsonText) {
      const parsed = JSON.parse(jsonText);
      return {
        recommendedVoice: parsed.recommendedVoice || 'Charon',
        recommendedVoiceHindi: parsed.recommendedVoiceHindi || 'चिरॉन (Deep Male)',
        recommendedMood: (parsed.recommendedMood as StoryMoodId) || 'suspenseful',
        recommendedMoodHindi: parsed.recommendedMoodHindi || 'सस्पेंस',
        recommendedAmbiance: (parsed.recommendedAmbiance as BackgroundAmbianceId) || 'eerie',
        recommendedAmbianceHindi: parsed.recommendedAmbianceHindi || 'डरावना सन्नाटा',
        explanationHindi: parsed.explanationHindi || 'कहानी का विश्लेषण करके पात्रों और आवाज़ों का ऑटो चयन किया गया।',
        sampleEmotionTags: parsed.sampleEmotionTags || ['[whispers] - फुसफुसाहट', '[dramatic pause] - सस्पेंस', '[sad] - भावुक संवाद'],
        characterCast: parsed.characterCast || [
          { name: 'सूत्रधार (Narrator)', roleType: 'narrator', voiceId: parsed.recommendedVoice || 'Charon', iconEmoji: '🎙️', descriptionHindi: 'मुख्य कहानीकार' },
          { name: 'नायक / लड़का (Boy)', roleType: 'male', voiceId: 'Puck', iconEmoji: '👦', descriptionHindi: 'युवा लड़का संवाद' },
          { name: 'नायिका / लड़की (Girl)', roleType: 'female', voiceId: 'Kore', iconEmoji: '👧', descriptionHindi: 'महिला पात्र संवाद' },
        ],
        sfxTriggers: detectStorySfxTriggers(storyText),
      };
    }
  } catch (err) {
    console.warn('AI story auto-analysis failed, falling back to defaults:', err);
  }

  // Fallback defaults if analysis fails or API unavailable
  return {
    recommendedVoice: 'Charon',
    recommendedVoiceHindi: 'चिरॉन (Deep male)',
    recommendedMood: 'suspenseful',
    recommendedMoodHindi: 'सस्पेंस व हॉरर',
    recommendedAmbiance: 'eerie',
    recommendedAmbianceHindi: 'डरावना सन्नाटा',
    explanationHindi: 'कहानी के प्लॉट के आधार पर पात्रों, भावों और आवाज़ का ऑटो-चयन किया गया।',
    sampleEmotionTags: ['[whispers] - रहस्यमयी बातचीत', '[dramatic pause] - सस्पेंस सीन', '[sad] - भावुक संवाद'],
    characterCast: [
      { name: 'सूत्रधार (Narrator)', roleType: 'narrator', voiceId: 'Charon', iconEmoji: '🎙️', descriptionHindi: 'मुख्य कथावाचक' },
      { name: 'अर्णव / लड़का (Boy)', roleType: 'male', voiceId: 'Puck', iconEmoji: '👦', descriptionHindi: 'जोशीला लड़का' },
      { name: 'मीरा / लड़की (Girl)', roleType: 'female', voiceId: 'Kore', iconEmoji: '👧', descriptionHindi: 'मृदुल लड़की' },
      { name: 'गुरु तेजस / बुजुर्ग (Elder)', roleType: 'elder', voiceId: 'Fenrir', iconEmoji: '👴', descriptionHindi: 'ज्ञानी शिक्षक' },
      { name: 'कालनाग / जानवर (Animal/Beast)', roleType: 'animal', voiceId: 'Charon', iconEmoji: '🐍', descriptionHindi: 'रहस्यमयी जानवर' },
    ],
    sfxTriggers: detectStorySfxTriggers(storyText),
  };
}

/**
 * Enhanced text with emotional markers using Gemini 3.6 Flash
 */
export async function enhanceTextWithEmotionTags(
  rawText: string,
  mood: StoryMood,
  apiKey: string
): Promise<string> {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('Gemini API key is missing. Please verify your environment configuration.');
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are an expert audio drama sound director for Hindi storytelling.
Analyze the following Hindi story chunk and insert emotional delivery direction tags and speaker role markers directly inside the text to guide multi-character audio dubbing.

Identify who is speaking (Narrator, Boy, Girl, Child, Animal/Monster, Bird/Creature, Elder) and insert emotion/delivery direction tags inside brackets:
- [whispers] (फिसफुसाते हुए / रहस्यमयी बात)
- [excited] (उत्साहित / जोश में लड़का या लड़की)
- [sad] (उदासीन / रोते हुए / भावुक संवाद)
- [laughs] (हँसते हुए)
- [dramatic pause] (गहरा नाटकीय ठहराव)
- [shouting] (चिल्लाते हुए / गर्जना)
- [trembling voice] (कांपती हुई आवाज / डर)
- [deep voice] (गंभीर बुजुर्ग या जानवर की दहाड़)
- [high pitch] (बच्चे या पक्षी की आवाज)

Context / Desired Mood: ${mood.name} (${mood.hindiName}). ${mood.tagPrompt}

CRITICAL RULES:
1. Do NOT change, rewrite, or summarize the Hindi story text. Keep every Hindi word exact.
2. Insert emotion & character delivery tags naturally before dialogue lines, animal sounds, or emotional revelations.
3. Do NOT over-saturate. Insert 3 to 7 strategic emotion/role tags per paragraph.
4. Output ONLY the resulting Hindi text with inline tags. Do NOT add markdown code blocks or explanations.

Story Chunk:
${rawText}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });

    const enhanced = response.text?.trim();
    if (enhanced && enhanced.length > 10) {
      // Strip any markdown code wrapper if model outputs it
      return enhanced.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim();
    }
    return rawText;
  } catch (error) {
    console.warn('Auto-emotion enhancement failed, using original text:', error);
    return rawText;
  }
}

/**
 * Generate TTS audio for a single chunk using gemini-3.1-flash-tts-preview
 * Implements automatic retry up to maxRetries (2 times)
 */
export async function generateTTSChunkAudio(
  textChunk: string,
  voiceName: string,
  apiKey: string,
  maxRetries: number = 2
): Promise<Float32Array> {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('Gemini API key is missing. Please check your AI Studio secrets or configuration.');
  }

  let attempt = 0;
  let lastError: Error | null = null;

  while (attempt <= maxRetries) {
    try {
      attempt++;
      const ai = new GoogleGenAI({ apiKey });

      // Call Gemini 3.1 Flash TTS model
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-tts-preview',
        contents: [{ parts: [{ text: textChunk }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      });

      const part = response.candidates?.[0]?.content?.parts?.[0];
      const inlineData = part?.inlineData;

      if (!inlineData || !inlineData.data) {
        throw new Error('No audio data received from Gemini TTS model response.');
      }

      const base64Audio = inlineData.data;
      const mimeType = inlineData.mimeType;

      // Decode base64 to uint8 bytes
      const uint8Bytes = base64ToUint8Array(base64Audio);

      // Convert uint8 bytes to normalized Float32Array audio samples
      const { samples } = await decodeAudioDataToSamples(uint8Bytes, mimeType);

      if (!samples || samples.length === 0) {
        throw new Error('Decoded audio samples are empty.');
      }

      return samples;
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`TTS generation attempt ${attempt} failed for chunk:`, lastError.message);

      if (attempt <= maxRetries) {
        // Wait 1 second before retrying
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  throw lastError || new Error('Failed to generate audio chunk after retries.');
}
