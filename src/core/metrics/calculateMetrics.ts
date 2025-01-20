import type { RepomixConfigMerged } from '../../config/configSchema.js';
import type { RepomixProgressCallback } from '../../shared/types.js';
import type { ProcessedFile } from '../file/fileTypes.js';
import { calculateAllFileMetrics } from './calculateAllFileMetrics.js';
import { countTokensParallel, cleanupWorkerPool } from './countTokenParallel.js';

export interface CalculateMetricsResult {
  totalFiles: number;
  totalCharacters: number;
  totalTokens: number;
  fileCharCounts: Record<string, number>;
  fileTokenCounts: Record<string, number>;
}

export const calculateMetrics = async (
  processedFiles: ProcessedFile[],
  output: string,
  progressCallback: RepomixProgressCallback,
  config: RepomixConfigMerged,
): Promise<CalculateMetricsResult> => {
  progressCallback('Calculating metrics...');

  const [fileMetrics, totalTokens] = await Promise.all([
    calculateAllFileMetrics(processedFiles, config.tokenCount.encoding, progressCallback),
    countTokensParallel(output, config.tokenCount.encoding),
  ]);

  const totalFiles = processedFiles.length;
  const totalCharacters = output.length;

  const fileCharCounts: Record<string, number> = {};
  const fileTokenCounts: Record<string, number> = {};
  for (const file of fileMetrics) {
    fileCharCounts[file.path] = file.charCount;
    fileTokenCounts[file.path] = file.tokenCount;
  }

  cleanupWorkerPool();

  return {
    totalFiles,
    totalCharacters,
    totalTokens,
    fileCharCounts,
    fileTokenCounts,
  };
};
