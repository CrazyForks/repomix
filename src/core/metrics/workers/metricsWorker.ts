import type { TiktokenEncoding } from 'tiktoken';
import { logger } from '../../../shared/logger.js';
import type { ProcessedFile } from '../../file/fileTypes.js';
import { TokenCounter } from '../../tokenCount/tokenCount.js';
import type { FileMetrics } from '../calculateIndividualFileMetrics.js';

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

  const counter = getTokenCounter(encoding);
  const charCount = file.content.length;
  const tokenCount = counter.countTokens(file.content, file.path);

  const processEndAt = process.hrtime.bigint();
  logger.trace(
    `Calculated metrics for ${file.path}. Took: ${(Number(processEndAt - processStartAt) / 1e6).toFixed(2)}ms`,
  );

  return { path: file.path, charCount, tokenCount };
};

// Cleanup when worker is terminated
process.on('exit', () => {
  if (tokenCounter) {
    tokenCounter.free();
    tokenCounter = null;
  }
});
