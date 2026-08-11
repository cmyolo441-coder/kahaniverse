import { BackgroundAmbianceId, SfxTrigger, SfxType } from '../types';

/**
 * Scans Hindi/English story text for sound-effect keywords and identifies relative trigger positions.
 */
export function detectStorySfxTriggers(storyText: string): SfxTrigger[] {
  if (!storyText || storyText.trim().length === 0) return [];

  const text = storyText.toLowerCase();
  const textLength = text.length;

  const rules: {
    type: SfxType;
    hindiName: string;
    iconEmoji: string;
    keywords: string[];
  }[] = [
    {
      type: 'thunder',
      hindiName: 'बिजली की कड़क (Thunder Strike)',
      iconEmoji: '⚡',
      keywords: ['बिजली', 'कड़क', 'कड़ाका', 'गड़गड़ाहट', 'आकाशीय', 'thunder', 'lightning'],
    },
    {
      type: 'explosion',
      hindiName: 'बम/विस्फोट धमाका (Explosion/Blast)',
      iconEmoji: '💣',
      keywords: ['बम', 'विस्फोट', 'धमाका', 'ब्लास्ट', 'गूंज', 'explosion', 'bomb', 'blast'],
    },
    {
      type: 'birds',
      hindiName: 'पक्षियों की चहचहाहट (Birds Chirping)',
      iconEmoji: '🐦',
      keywords: ['पक्षी', 'चिड़िया', 'कोयल', 'चहचहाहट', 'कबूतर', 'मोर', 'bird', 'chirp'],
    },
    {
      type: 'rain_storm',
      hindiName: 'तेज बारिश व आंधी (Rain & Storm)',
      iconEmoji: '🌧️',
      keywords: ['बारिश', 'तूफान', 'वर्षा', 'बूंदें', 'रिमझिम', 'rain', 'storm'],
    },
    {
      type: 'beast_roar',
      hindiName: 'दैत्य/शेर की दहाड़ (Beast Roar)',
      iconEmoji: '🦁',
      keywords: ['दहाड़', 'शेर', 'राक्षस', 'दानव', 'गरज', 'दहाड़ा', 'सांप', 'furious roar', 'monster'],
    },
    {
      type: 'door_knock',
      hindiName: 'दरवाजे की दस्तक (Door Knock)',
      iconEmoji: '🚪',
      keywords: ['दरवाजा', 'खटखटा', 'आहट', 'दस्तक', 'door', 'knock'],
    },
    {
      type: 'river_stream',
      hindiName: 'नदी/झरने की कलकल (River Stream)',
      iconEmoji: '🌊',
      keywords: ['नदी', 'झरना', 'लहरें', 'पानी', 'समुद्र', 'river', 'water', 'stream'],
    },
    {
      type: 'fire_crackle',
      hindiName: 'आग/अलाव की चटचट (Fire Crackle)',
      iconEmoji: '🔥',
      keywords: ['आग', 'अलाव', 'लपटें', 'चटचट', 'fire', 'flames'],
    },
    {
      type: 'footsteps',
      hindiName: 'कदमो की आवाज (Footsteps)',
      iconEmoji: '👣',
      keywords: ['कदम', 'पदचाप', 'भागने', 'footsteps'],
    },
    {
      type: 'wind_gust',
      hindiName: 'हवा की सनसनाहट (Wind Gust)',
      iconEmoji: '💨',
      keywords: ['हवा', 'सनसनाहट', 'wind', 'breeze'],
    },
  ];

  const triggers: SfxTrigger[] = [];

  for (const rule of rules) {
    for (const kw of rule.keywords) {
      const idx = text.indexOf(kw);
      if (idx !== -1) {
        const positionPercent = Math.min(95, Math.max(5, Math.round((idx / textLength) * 100)));
        // Avoid duplicate triggers of same type
        if (!triggers.some((t) => t.type === rule.type)) {
          triggers.push({
            type: rule.type,
            hindiName: rule.hindiName,
            iconEmoji: rule.iconEmoji,
            keywordMatched: kw,
            positionPercent,
          });
        }
        break; // Match once per category
      }
    }
  }

  return triggers;
}

/**
 * Generates dynamic audio SFX buffer for specific events using Web Audio synthesis
 */
export function generateSfxBuffer(type: SfxType, sampleRate: number = 24000): Float32Array {
  if (type === 'thunder') {
    // Sharp thunder clap followed by decaying low frequency rumble (2.2 seconds)
    const totalSamples = Math.floor(sampleRate * 2.2);
    const buffer = new Float32Array(totalSamples);
    let b0 = 0, b1 = 0, b2 = 0;

    for (let i = 0; i < totalSamples; i++) {
      const t = i / sampleRate;
      const white = Math.random() * 2 - 1;
      // Low pass filter
      b0 = b0 + 0.05 * (white - b0);
      b1 = b1 + 0.02 * (b0 - b1);

      // Initial sharp explosion burst envelope
      const burst = t < 0.2 ? (1 - t / 0.2) * (Math.random() * 0.4) : 0;
      // Low frequency rumble (45Hz)
      const rumble = Math.sin(2 * Math.PI * 45 * t) * Math.exp(-t * 1.5) * 0.2;

      buffer[i] = (b1 * 0.25 * Math.exp(-t * 1.2)) + burst + rumble;
    }
    return buffer;
  }

  if (type === 'explosion') {
    // Bomb blast: Heavy sub boom + white noise blast (2.0 seconds)
    const totalSamples = Math.floor(sampleRate * 2.0);
    const buffer = new Float32Array(totalSamples);

    for (let i = 0; i < totalSamples; i++) {
      const t = i / sampleRate;
      const white = Math.random() * 2 - 1;
      const env = Math.exp(-t * 2.5);

      // Sub-bass sine boom (35Hz dropping to 20Hz)
      const pitch = 35 * Math.exp(-t * 3.0);
      const boom = Math.sin(2 * Math.PI * pitch * t) * Math.exp(-t * 1.8) * 0.35;

      buffer[i] = (white * 0.25 * env) + boom;
    }
    return buffer;
  }

  if (type === 'birds') {
    // Birds chirping: FM modulated high frequency sweeps (1.8 seconds)
    const totalSamples = Math.floor(sampleRate * 1.8);
    const buffer = new Float32Array(totalSamples);

    for (let i = 0; i < totalSamples; i++) {
      const t = i / sampleRate;
      let chirp = 0;

      // 3 chirps across 1.8s
      const burstPhase = (t % 0.6) / 0.6;
      if (burstPhase < 0.35) {
        const chirpT = burstPhase * 0.6;
        const freq = 2200 + Math.sin(2 * Math.PI * 22 * chirpT) * 700;
        chirp = Math.sin(2 * Math.PI * freq * chirpT) * 0.08 * Math.sin(Math.PI * (burstPhase / 0.35));
      }

      buffer[i] = chirp;
    }
    return buffer;
  }

  if (type === 'beast_roar') {
    // Beast / Monster growl: FM pitch drop growl (2.0 seconds)
    const totalSamples = Math.floor(sampleRate * 2.0);
    const buffer = new Float32Array(totalSamples);

    for (let i = 0; i < totalSamples; i++) {
      const t = i / sampleRate;
      const env = Math.sin(Math.PI * (t / 2.0));
      const freq = 120 + Math.sin(2 * Math.PI * 15 * t) * 40;
      const saw = (2 * ((t * freq) % 1)) - 1;
      const sub = Math.sin(2 * Math.PI * (freq / 2) * t);

      buffer[i] = (saw * 0.12 + sub * 0.15) * env;
    }
    return buffer;
  }

  if (type === 'door_knock') {
    // Resonant door knock impulses (1.0 second)
    const totalSamples = Math.floor(sampleRate * 1.0);
    const buffer = new Float32Array(totalSamples);

    for (let i = 0; i < totalSamples; i++) {
      const t = i / sampleRate;
      let knock = 0;
      // 3 knocks at 0.1s, 0.3s, 0.5s
      [0.1, 0.28, 0.46].forEach((kt) => {
        if (t >= kt && t < kt + 0.08) {
          const dt = t - kt;
          const tone = Math.sin(2 * Math.PI * 180 * dt) * Math.exp(-dt * 45);
          knock += tone * 0.2;
        }
      });
      buffer[i] = knock;
    }
    return buffer;
  }

  if (type === 'rain_storm') {
    // Heavy rain burst (2.5 seconds)
    const totalSamples = Math.floor(sampleRate * 2.5);
    const buffer = new Float32Array(totalSamples);
    let b = 0;
    for (let i = 0; i < totalSamples; i++) {
      const white = Math.random() * 2 - 1;
      b += (white - b) * 0.2;
      buffer[i] = b * 0.06;
    }
    return buffer;
  }

  if (type === 'fire_crackle') {
    // Fire crackle pops (2.0 seconds)
    const totalSamples = Math.floor(sampleRate * 2.0);
    const buffer = new Float32Array(totalSamples);
    let lastOut = 0;
    for (let i = 0; i < totalSamples; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.02 * white) / 1.02;
      const crackle = Math.random() > 0.9985 ? (Math.random() * 0.25 * (Math.random() > 0.5 ? 1 : -1)) : 0;
      buffer[i] = lastOut * 0.04 + crackle;
    }
    return buffer;
  }

  // Default wind / footstep fallback
  const defaultSamples = Math.floor(sampleRate * 1.5);
  const buf = new Float32Array(defaultSamples);
  for (let i = 0; i < defaultSamples; i++) {
    const t = i / sampleRate;
    buf[i] = Math.sin(2 * Math.PI * 120 * t) * Math.exp(-t * 2.0) * 0.05;
  }
  return buf;
}

/**
 * Generates an ambient background Float32Array audio buffer for the given duration and sample rate.
 */
export function generateAmbientBuffer(
  ambianceId: BackgroundAmbianceId,
  totalSamples: number,
  sampleRate: number = 24000
): Float32Array {
  if (ambianceId === 'none' || totalSamples <= 0) {
    return new Float32Array(0);
  }

  const buffer = new Float32Array(totalSamples);

  if (ambianceId === 'rain') {
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < totalSamples; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      b6 = white * 0.115926;

      const t = i / sampleRate;
      const rumble = Math.sin(2 * Math.PI * 0.5 * t) * Math.sin(2 * Math.PI * 0.12 * t);
      const drop = Math.random() > 0.9992 ? (Math.random() * 0.25) : 0;

      buffer[i] = (pink * 0.012) + (rumble * 0.015) + drop;
    }
  } else if (ambianceId === 'fireside') {
    let lastOut = 0.0;
    for (let i = 0; i < totalSamples; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.02 * white) / 1.02;
      const crackle = Math.random() > 0.9996 ? (Math.random() * 0.25 * (Math.random() > 0.5 ? 1 : -1)) : 0;

      buffer[i] = (lastOut * 0.035) + crackle;
    }
  } else if (ambianceId === 'eerie') {
    for (let i = 0; i < totalSamples; i++) {
      const t = i / sampleRate;
      const freq1 = 55 + Math.sin(2 * Math.PI * 0.05 * t) * 3;
      const freq2 = 58 + Math.cos(2 * Math.PI * 0.04 * t) * 2;
      const sine1 = Math.sin(2 * Math.PI * freq1 * t);
      const sine2 = Math.sin(2 * Math.PI * freq2 * t);

      const sweep = Math.sin(2 * Math.PI * 0.02 * t);
      const windHiss = (Math.random() * 2 - 1) * 0.005 * (0.5 + 0.5 * sweep);

      buffer[i] = (sine1 * 0.02) + (sine2 * 0.02) + windHiss;
    }
  } else if (ambianceId === 'forest') {
    let lastOut = 0.0;
    for (let i = 0; i < totalSamples; i++) {
      const t = i / sampleRate;
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.015 * white) / 1.015;

      const breeze = 0.5 + 0.5 * Math.sin(2 * Math.PI * 0.08 * t);
      let chirp = 0;
      const cycleTime = t % 4.5;
      if (cycleTime > 1.0 && cycleTime < 1.25) {
        const chirpT = cycleTime - 1.0;
        const chirpFreq = 2200 + Math.sin(2 * Math.PI * 18 * chirpT) * 600;
        chirp = Math.sin(2 * Math.PI * chirpFreq * chirpT) * 0.015 * Math.sin(Math.PI * (chirpT / 0.25));
      }

      buffer[i] = (lastOut * 0.02 * breeze) + chirp;
    }
  } else if (ambianceId === 'market') {
    let filterState = 0;
    for (let i = 0; i < totalSamples; i++) {
      const t = i / sampleRate;
      const white = Math.random() * 2 - 1;
      filterState += (white - filterState) * 0.12;

      const swell = 0.5 + 0.5 * Math.sin(2 * Math.PI * 0.15 * t);
      buffer[i] = filterState * 0.025 * swell;
    }
  }

  return buffer;
}

/**
 * Mixes narrator voice audio samples with background ambiance sound layer & dynamic story SFX!
 */
export function mixVoiceAndAmbiance(
  voiceSamples: Float32Array,
  storyText: string,
  ambianceId: BackgroundAmbianceId,
  sampleRate: number = 24000
): Float32Array {
  if (!voiceSamples || voiceSamples.length === 0) {
    return voiceSamples;
  }

  const totalLength = voiceSamples.length;
  const ambientBuffer = generateAmbientBuffer(ambianceId, totalLength, sampleRate);
  const mixed = new Float32Array(totalLength);

  // 1. Copy voice and layer background ambiance
  for (let i = 0; i < totalLength; i++) {
    const ambVal = ambientBuffer.length > 0 ? ambientBuffer[i] : 0;
    mixed[i] = voiceSamples[i] + ambVal;
  }

  // 2. Automatically detect and dynamically overlay story-triggered SFX!
  const sfxTriggers = detectStorySfxTriggers(storyText);
  for (const trigger of sfxTriggers) {
    const startIdx = Math.floor(totalLength * (trigger.positionPercent / 100));
    const sfxBuffer = generateSfxBuffer(trigger.type, sampleRate);

    // Overlay SFX into mixed audio
    for (let j = 0; j < sfxBuffer.length && startIdx + j < totalLength; j++) {
      mixed[startIdx + j] += sfxBuffer[j];
    }
  }

  // 3. Clamp final waveform to prevent clipping
  for (let i = 0; i < totalLength; i++) {
    mixed[i] = Math.max(-1.0, Math.min(1.0, mixed[i]));
  }

  return mixed;
}
