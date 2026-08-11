import React from 'react';
import { countWordsAndChars } from '../utils/textProcessor';
import { PRESET_STORIES } from '../data/voicesAndMoods';
import { PresetStory, StoryMoodId } from '../types';
import { BookOpen, Sparkles, Trash2, AlertTriangle, Clock, FileText } from 'lucide-react';

interface StoryInputProps {
  text: string;
  onChangeText: (newText: string) => void;
  onSelectPreset: (preset: PresetStory) => void;
  selectedMood: StoryMoodId;
  disabled?: boolean;
}

export const StoryInput: React.FC<StoryInputProps> = ({
  text,
  onChangeText,
  onSelectPreset,
  disabled = false,
}) => {
  const { words, chars, estimatedMinutes } = countWordsAndChars(text);
  const isOverLimit = words > 5000;

  const insertTagAtCursor = (tag: string) => {
    const textarea = document.getElementById('story-textarea') as HTMLTextAreaElement;
    if (!textarea) {
      onChangeText(text + ` ${tag} `);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = text.substring(0, start) + ` ${tag} ` + text.substring(end);
    onChangeText(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length + 2, start + tag.length + 2);
    }, 50);
  };

  const emotionTags = [
    { tag: '[whispers]', label: 'फुसफुसाते हुए (Whispers)' },
    { tag: '[excited]', label: 'उत्साहित (Excited)' },
    { tag: '[sad]', label: 'उदासीन (Sad)' },
    { tag: '[laughs]', label: 'हँसते हुए (Laughs)' },
    { tag: '[dramatic pause]', label: 'ठहराव (Pause)' },
    { tag: '[shouting]', label: 'चिल्लाते हुए (Shouting)' },
    { tag: '[trembling voice]', label: 'कांपती आवाज (Trembling)' },
  ];

  return (
    <div className="w-full bg-stone-900/60 border border-amber-900/30 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
      {/* Header & Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-800">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-bold text-stone-100">कहानी दर्ज करें (Paste Your Story)</h2>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-stone-400 font-medium flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> नमूना कहानियाँ:
          </span>
          {PRESET_STORIES.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              disabled={disabled}
              type="button"
              className="text-xs px-2.5 py-1 rounded-md bg-stone-800 hover:bg-amber-950/60 border border-amber-900/40 text-amber-200/90 hover:text-amber-300 transition-colors cursor-pointer disabled:opacity-50"
            >
              {preset.hindiTitle}
            </button>
          ))}
        </div>
      </div>

      {/* Main Textarea */}
      <div className="relative">
        <textarea
          id="story-textarea"
          value={text}
          onChange={(e) => onChangeText(e.target.value)}
          disabled={disabled}
          rows={10}
          placeholder="यहाँ अपनी कहानी या नाटक का संवाद हिंदी में पेस्ट करें (उदा: हिंदी गद्य, संवाद, नाटक या कहानी)..."
          className="w-full bg-stone-950/90 text-stone-100 placeholder-stone-600 p-4 rounded-xl border border-stone-800 focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all font-sans text-sm sm:text-base leading-relaxed resize-y min-h-[220px]"
        />

        {text.length > 0 && (
          <button
            onClick={() => onChangeText('')}
            disabled={disabled}
            title="Clear text"
            className="absolute top-3 right-3 p-1.5 rounded-lg bg-stone-900/80 hover:bg-stone-800 text-stone-400 hover:text-rose-400 transition-colors border border-stone-800"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Quick Tag Insertion Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-xs font-semibold text-stone-400 mr-1 flex items-center gap-1">
          इमोशन टैग जोड़ें:
        </span>
        {emotionTags.map((t) => (
          <button
            key={t.tag}
            type="button"
            onClick={() => insertTagAtCursor(t.tag)}
            disabled={disabled}
            className="text-[11px] px-2 py-0.5 rounded-full bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/40 text-amber-300 transition-all font-mono hover:scale-105 cursor-pointer disabled:opacity-50"
          >
            + {t.tag}
          </button>
        ))}
      </div>

      {/* Word Counter & Limits */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-stone-400 pt-2 border-t border-stone-800/80">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium text-stone-300">
            <FileText className="w-3.5 h-3.5 text-amber-500" />
            <strong className="text-amber-400">{words}</strong> शब्द (Words)
          </span>
          <span className="text-stone-600">•</span>
          <span className="font-medium">
            <strong className="text-stone-200">{chars}</strong> अक्षर (Chars)
          </span>
          <span className="text-stone-600">•</span>
          <span className="flex items-center gap-1 text-stone-300">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            अनुमानित समय: ~<strong className="text-amber-400">{estimatedMinutes}</strong> मिनट
          </span>
        </div>

        {/* Warning if over 5000 words limit */}
        {isOverLimit && (
          <div className="flex items-center gap-1.5 text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2.5 py-1 rounded-md font-medium animate-pulse">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            शब्द सीमा 5000 से अधिक है! प्रक्रिया में अधिक समय लग सकता है।
          </div>
        )}
      </div>
    </div>
  );
};
