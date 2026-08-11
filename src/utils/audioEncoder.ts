/**
 * Converts Base64 string to Uint8Array
 */
export function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Parses Gemini TTS output bytes into normalized Float32Array audio samples (-1.0 to 1.0).
 * Gemini TTS output is typically 24000Hz 16-bit mono PCM, either raw or in a WAV container.
 */
export async function decodeAudioDataToSamples(
  uint8Array: Uint8Array,
  mimeType?: string
): Promise<{ samples: Float32Array; sampleRate: number }> {
  const DEFAULT_SAMPLE_RATE = 24000;

  // Check if it's a RIFF WAV container
  const isWavHeader =
    uint8Array.length >= 12 &&
    uint8Array[0] === 0x52 && // R
    uint8Array[1] === 0x49 && // I
    uint8Array[2] === 0x46 && // F
    uint8Array[3] === 0x46;   // F

  if (isWavHeader) {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const audioBuffer = await audioCtx.decodeAudioData(uint8Array.buffer.slice(0));
      const samples = audioBuffer.getChannelData(0);
      const sampleRate = audioBuffer.sampleRate;
      await audioCtx.close();
      return { samples, sampleRate };
    } catch (e) {
      console.warn('Web Audio API decode error, falling back to manual WAV header strip:', e);
      // Fallback: Skip 44-byte WAV header manually if decodeAudioData fails
      const pcmData = uint8Array.subarray(44);
      return {
        samples: pcm16ToFloat32(pcmData),
        sampleRate: DEFAULT_SAMPLE_RATE,
      };
    }
  }

  // Raw 16-bit PCM LE
  return {
    samples: pcm16ToFloat32(uint8Array),
    sampleRate: DEFAULT_SAMPLE_RATE,
  };
}

/**
 * Converts 16-bit Little Endian PCM bytes to Float32Array (-1.0 to 1.0)
 */
function pcm16ToFloat32(uint8Array: Uint8Array): Float32Array {
  const numSamples = Math.floor(uint8Array.length / 2);
  const float32 = new Float32Array(numSamples);
  const dataView = new DataView(uint8Array.buffer, uint8Array.byteOffset, uint8Array.byteLength);

  for (let i = 0; i < numSamples; i++) {
    const int16 = dataView.getInt16(i * 2, true);
    // Normalize Int16 range [-32768, 32767] to [-1.0, 1.0]
    float32[i] = int16 < 0 ? int16 / 32768 : int16 / 32767;
  }

  return float32;
}

/**
 * Concatenates multiple Float32Array sample buffers into one seamless audio buffer.
 * Applies minor micro-crossfade (5ms) at chunk junctions to eliminate clicks or pops.
 */
export function mergeAudioBuffers(buffers: Float32Array[], sampleRate: number = 24000): Float32Array {
  if (buffers.length === 0) return new Float32Array(0);
  if (buffers.length === 1) return buffers[0];

  const fadeSamples = Math.floor(sampleRate * 0.005); // 5ms fade
  let totalLength = 0;

  for (let i = 0; i < buffers.length; i++) {
    totalLength += buffers[i].length;
    if (i > 0) {
      totalLength -= fadeSamples; // overlap duration
    }
  }

  const merged = new Float32Array(totalLength);
  let offset = 0;

  for (let i = 0; i < buffers.length; i++) {
    const chunk = buffers[i];
    if (i === 0) {
      merged.set(chunk, 0);
      offset += chunk.length;
    } else {
      offset -= fadeSamples; // rewind by fade amount
      // Apply linear crossfade at junction
      for (let f = 0; f < fadeSamples && f < chunk.length; f++) {
        const alpha = f / fadeSamples;
        const prevIndex = offset + f;
        if (prevIndex < merged.length) {
          merged[prevIndex] = merged[prevIndex] * (1 - alpha) + chunk[f] * alpha;
        }
      }
      // Copy rest of chunk after fade
      if (chunk.length > fadeSamples) {
        merged.set(chunk.subarray(fadeSamples), offset + fadeSamples);
      }
      offset += chunk.length;
    }
  }

  return merged;
}

/**
 * Converts Float32Array audio samples into a high-quality 16-bit PCM RIFF WAV Blob
 */
export function createWavBlob(samples: Float32Array, sampleRate: number = 24000): Blob {
  const numChannels = 1; // Mono
  const bytesPerSample = 2; // 16-bit
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = samples.length * bytesPerSample;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);

  // Helper to write ASCII strings into DataView
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // RIFF header
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true); // File size minus 8 bytes
  writeString(8, 'WAVE');

  // FMT subchunk
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true);  // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // Bits per sample

  // DATA subchunk
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  // Write Float32 samples converted to Int16
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    const int16 = s < 0 ? s * 0x8000 : s * 0x7fff;
    view.setInt16(offset, int16, true);
    offset += 2;
  }

  return new Blob([buffer], { type: 'audio/wav' });
}
