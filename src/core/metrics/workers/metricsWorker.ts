import type { TiktokenEncoding } from 'tiktoken';
import { logger } from '../../../shared/logger.js';
import type { ProcessedFile } from '../../file/fileTypes.js';
import { TokenCounter } from '../../tokenCount/tokenCount.js';
import type { FileMetrics } from './types.js';

interface MetricsWorkerInput {
  file: ProcessedFile;
  index: number;
  totalFiles: number;
  encoding: TiktokenEncoding;
}

// Worker-level singleton for TokenCounter
let tokenCounter: TokenCounter | null = null;

/**
 * Get or create TokenCounter instance
 */
const getTokenCounter = (encoding: TiktokenEncoding): TokenCounter => {
  if (!tokenCounter) {
    tokenCounter = new TokenCounter(encoding);
  }
  return tokenCounter;
};

/**
 * Worker thread function that calculates metrics for a single file
 */
export default async ({ file, index, totalFiles, encoding }: MetricsWorkerInput): Promise<FileMetrics> => {
  const processStartAt = process.hrtime.bigint();

  const processEndAt = process.hrtime.bigint();
  logger.trace(
    `Calculated metrics for ${file.path}. Took: ${(Number(processEndAt - processStartAt) / 1e6).toFixed(2)}ms`,
  );

  return calculateIndividualFileMetrics(file, encoding);
};

export const calculateIndividualFileMetrics = async (
  file: ProcessedFile,
  encoding: TiktokenEncoding,
): Promise<FileMetrics> => {
  const charCount = file.content.length;
  const tokenCounter = getTokenCounter(encoding);
  const tokenCount = tokenCounter.countTokens(file.content, file.path);

  return { path: file.path, charCount, tokenCount };
};

// Cleanup when worker is terminated
process.on('exit', () => {
  if (tokenCounter) {
    tokenCounter.free();
    tokenCounter = null;
  }
});
