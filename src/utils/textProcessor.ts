export function countWordsAndChars(text: string): { words: number; chars: number; estimatedMinutes: number } {
  const trimmed = text.trim();
  if (!trimmed) {
    return { words: 0, chars: 0, estimatedMinutes: 0 };
  }
  // Count words by splitting on whitespace
  const words = trimmed.split(/\s+/).filter(Boolean).length;
  const chars = text.length;
  // Hindi speech rate is approx 120-140 words per minute
  const estimatedMinutes = Math.ceil((words / 130) * 10) / 10;
  return { words, chars, estimatedMinutes };
}

/**
 * Split text into chunks targeting ~300 to 500 words each.
 * Splitting strictly respects paragraph boundaries (\n\n) or sentence boundaries (।, ?, !, .).
 */
export function chunkStoryText(text: string, targetWordsPerChunk: number = 350): string[] {
  const cleaned = text.trim();
  if (!cleaned) return [];

  // Split by double line breaks first (paragraphs)
  const paragraphs = cleaned.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  
  const chunks: string[] = [];
  let currentChunkParagraphs: string[] = [];
  let currentChunkWordCount = 0;

  for (const paragraph of paragraphs) {
    const paraWords = paragraph.split(/\s+/).filter(Boolean).length;

    // If single paragraph is extremely long (e.g. > 600 words without double linebreaks),
    // split paragraph by Hindi sentence markers (।, ?, !, .)
    if (paraWords > 550) {
      if (currentChunkParagraphs.length > 0) {
        chunks.push(currentChunkParagraphs.join('\n\n'));
        currentChunkParagraphs = [];
        currentChunkWordCount = 0;
      }

      // Sentence splitting
      const sentences = paragraph.split(/(?<=[।?!.\n])\s+/).filter(Boolean);
      let subChunkSentences: string[] = [];
      let subChunkWords = 0;

      for (const sentence of sentences) {
        const sWords = sentence.split(/\s+/).filter(Boolean).length;
        if (subChunkWords + sWords > targetWordsPerChunk && subChunkWords > 100) {
          chunks.push(subChunkSentences.join(' '));
          subChunkSentences = [sentence];
          subChunkWords = sWords;
        } else {
          subChunkSentences.push(sentence);
          subChunkWords += sWords;
        }
      }
      if (subChunkSentences.length > 0) {
        chunks.push(subChunkSentences.join(' '));
      }
      continue;
    }

    // Normal paragraph accumulation
    if (currentChunkWordCount + paraWords > targetWordsPerChunk && currentChunkWordCount >= 150) {
      chunks.push(currentChunkParagraphs.join('\n\n'));
      currentChunkParagraphs = [paragraph];
      currentChunkWordCount = paraWords;
    } else {
      currentChunkParagraphs.push(paragraph);
      currentChunkWordCount += paraWords;
    }
  }

  if (currentChunkParagraphs.length > 0) {
    chunks.push(currentChunkParagraphs.join('\n\n'));
  }

  return chunks;
}
