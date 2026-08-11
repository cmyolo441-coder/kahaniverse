import { BackgroundAmbianceId } from '../types';

/**
 * Generates an ambient background Float32Array audio buffer for the given duration and sample rate.
 * Uses procedural Web Audio synthesis algorithms (pink noise, brown noise, low-frequency drones, crackles, filter emulation).
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
    // Pink noise + low frequency thunder rumbles
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

      // Thunder rumble modulation (low frequency sine)
      const t = i / sampleRate;
      const rumble = Math.sin(2 * Math.PI * 0.5 * t) * Math.sin(2 * Math.PI * 0.12 * t);

      // Rain drop pops
      const drop = Math.random() > 0.9992 ? (Math.random() * 0.3) : 0;

      buffer[i] = (pink * 0.012) + (rumble * 0.015) + drop;
    }
  } else if (ambianceId === 'fireside') {
    // Soft brown noise + random wood crackles
    let lastOut = 0.0;
    for (let i = 0; i < totalSamples; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.02 * white) / 1.02;

      // Wood crackle pop
      const crackle = Math.random() > 0.9996 ? (Math.random() * 0.3 * (Math.random() > 0.5 ? 1 : -1)) : 0;

      buffer[i] = (lastOut * 0.035) + crackle;
    }
  } else if (ambianceId === 'eerie') {
    // Low frequency detuned sine drone + subtle wind hiss
    for (let i = 0; i < totalSamples; i++) {
      const t = i / sampleRate;
      const freq1 = 55 + Math.sin(2 * Math.PI * 0.05 * t) * 3; // 55Hz A1 note
      const freq2 = 58 + Math.cos(2 * Math.PI * 0.04 * t) * 2; // slightly detuned 58Hz
      const sine1 = Math.sin(2 * Math.PI * freq1 * t);
      const sine2 = Math.sin(2 * Math.PI * freq2 * t);

      // Eerie resonance sweep
      const sweep = Math.sin(2 * Math.PI * 0.02 * t);
      const windHiss = (Math.random() * 2 - 1) * 0.005 * (0.5 + 0.5 * sweep);

      buffer[i] = (sine1 * 0.02) + (sine2 * 0.02) + windHiss;
    }
  } else if (ambianceId === 'forest') {
    // Soft wind noise + periodic bird chirps
    let lastOut = 0.0;
    for (let i = 0; i < totalSamples; i++) {
      const t = i / sampleRate;
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.015 * white) / 1.015;

      // Gentle breeze modulation
      const breeze = 0.5 + 0.5 * Math.sin(2 * Math.PI * 0.08 * t);

      // Bird chirp simulation (FM sine burst every ~4 seconds)
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
    // Filtered chatter noise + low crowd rumble
    let filterState = 0;
    for (let i = 0; i < totalSamples; i++) {
      const t = i / sampleRate;
      const white = Math.random() * 2 - 1;
      filterState += (white - filterState) * 0.12;

      // Crowd murmur swell
      const swell = 0.5 + 0.5 * Math.sin(2 * Math.PI * 0.15 * t);

      buffer[i] = filterState * 0.025 * swell;
    }
  }

  return buffer;
}

/**
 * Mixes narrator voice audio samples with an ambiance background buffer.
 */
export function mixVoiceAndAmbiance(
  voiceSamples: Float32Array,
  ambianceId: BackgroundAmbianceId,
  sampleRate: number = 24000
): Float32Array {
  if (ambianceId === 'none' || !voiceSamples || voiceSamples.length === 0) {
    return voiceSamples;
  }

  const totalLength = voiceSamples.length;
  const ambientBuffer = generateAmbientBuffer(ambianceId, totalLength, sampleRate);
  if (ambientBuffer.length === 0) return voiceSamples;

  const mixed = new Float32Array(totalLength);
  for (let i = 0; i < totalLength; i++) {
    // Sum voice and ambiance, clamp between -1.0 and 1.0
    const sum = voiceSamples[i] + ambientBuffer[i];
    mixed[i] = Math.max(-1.0, Math.min(1.0, sum));
  }

  return mixed;
}
