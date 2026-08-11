import React, { useState } from 'react';
import { X, Key, Check, Eye, EyeOff, ExternalLink, ShieldCheck, Trash2, Sparkles } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customApiKey: string;
  onSaveApiKey: (key: string) => void;
  onClearApiKey: () => void;
  hasSystemApiKey: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  customApiKey,
  onSaveApiKey,
  onClearApiKey,
  hasSystemApiKey,
}) => {
  const [inputKey, setInputKey] = useState<string>(customApiKey);
  const [showKey, setShowKey] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveApiKey(inputKey.trim());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleClear = () => {
    setInputKey('');
    onClearApiKey();
    setSavedSuccess(false);
  };

  const isCustomActive = Boolean(customApiKey && customApiKey.length > 5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-lg bg-stone-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-amber-200">API Key एवं सेटिंग्स (Settings)</h2>
              <p className="text-xs text-stone-400">अपनी निजी Gemini API Key जोड़ें</p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Active status banner */}
          <div className="p-3.5 rounded-xl border text-xs flex items-start gap-3 bg-stone-950/70">
            {isCustomActive ? (
              <>
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-emerald-300 block text-sm">
                    आपकी कस्टम API Key सक्रिय है (Custom Key Active)
                  </span>
                  <p className="text-stone-300 text-xs mt-0.5">
                    KahaniVerse अब आपकी व्यक्तिगत Google Gemini API Key से ऑडियो ड्रामा जनरेट करेगा।
                  </p>
                </div>
              </>
            ) : hasSystemApiKey ? (
              <>
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-300 block text-sm">
                    डिफ़ॉल्ट सिस्टम Key सक्रिय है (Default Key Active)
                  </span>
                  <p className="text-stone-400 text-xs mt-0.5">
                    अगर आप अपनी स्वयं की API Key जोड़ना चाहते हैं, तो नीचे दर्ज करें।
                  </p>
                </div>
              </>
            ) : (
              <>
                <Key className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <span className="font-bold text-rose-300 block text-sm">
                    कोई API Key उपलब्ध नहीं है (No API Key)
                  </span>
                  <p className="text-stone-300 text-xs mt-0.5">
                    ऑडियो जनरेट करने के लिए अपनी Gemini API Key दर्ज करके सेव करें।
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-amber-200 block">
                Google Gemini API Key
              </label>

              <div className="relative flex items-center">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-stone-950 border border-stone-700 focus:border-amber-500 text-amber-100 placeholder-stone-600 rounded-xl px-3.5 py-2.5 text-sm pr-20 outline-none transition-colors font-mono"
                />

                <div className="absolute right-2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="p-1.5 text-stone-400 hover:text-amber-300 transition-colors"
                    title={showKey ? 'की छिपाएं' : 'की देखें'}
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-stone-400 leading-relaxed pt-1">
                आपकी API Key केवल आपके ब्राउज़र (Local Storage) में सुरक्षित रखी जाती है।
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 hover:underline shrink-0"
              >
                मुफ्त API Key प्राप्त करें (Get Free Key) <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {isCustomActive && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" /> हटाएँ (Remove)
                  </button>
                )}

                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 text-xs font-black transition-all flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
                >
                  {savedSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-stone-950" /> सेव हो गया!
                    </>
                  ) : (
                    'सेव करें (Save Key)'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
