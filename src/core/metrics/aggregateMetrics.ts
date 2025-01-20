import { TiktokenEncoding } from 'tiktoken';
import type { ProcessedFile } from '../file/fileTypes.js';
import { TokenCounter } from '../tokenCount/tokenCount.js';
import type { FileMetrics } from './calculateIndividualFileMetrics.js';

export const aggregateMetrics = (
  fileMetrics: FileMetrics[],
  processedFiles: ProcessedFile[],
  output: string,
  tokenCounterEncoding: TiktokenEncoding,
) => {
  const totalFiles = processedFiles.length;
  const totalCharacters = output.length;
  const tokenCounter = new TokenCounter(tokenCounterEncoding);
  const totalTokens = tokenCounter.countTokens(output);

  tokenCounter.free();

  const fileCharCounts: Record<string, number> = {};
  const fileTokenCounts: Record<string, number> = {};
  for (const file of fileMetrics) {
    fileCharCounts[file.path] = file.charCount;
    fileTokenCounts[file.path] = file.tokenCount;
  }

  return {
    totalFiles,
    totalCharacters,
    totalTokens,
    fileCharCounts,
    fileTokenCounts,
  };
};
