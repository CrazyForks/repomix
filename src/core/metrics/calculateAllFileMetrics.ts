import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pc from 'picocolors';
import { Piscina } from 'piscina';
import type { TiktokenEncoding } from 'tiktoken';
import { logger } from '../../shared/logger.js';
import { getWorkerThreadCount } from '../../shared/processConcurrency.js';
import type { RepomixProgressCallback } from '../../shared/types.js';
import type { ProcessedFile } from '../file/fileTypes.js';
import type { TokenCounter } from '../tokenCount/tokenCount.js';
import type { FileMetrics } from './calculateIndividualFileMetrics.js';

// Worker pool singleton
let workerPool: Piscina | null = null;

/**
 * Initialize the worker pool
 */
const initializeWorkerPool = (): Piscina => {
  if (workerPool) {
    return workerPool;
  }

  const { minThreads, maxThreads } = getWorkerThreadCount();
  logger.trace(`Initializing metrics worker pool with min=${minThreads}, max=${maxThreads} threads`);

  workerPool = new Piscina({
    filename: path.resolve(path.dirname(fileURLToPath(import.meta.url)), './workers/metricsWorker.js'),
    minThreads,
    maxThreads,
    idleTimeout: 5000,
  });

  return workerPool;
};

/**
 * Process files in chunks to maintain progress visibility and prevent memory issues
 */
async function processFileChunks(
  pool: Piscina,
  tasks: Array<{ file: ProcessedFile; index: number; totalFiles: number; encoding: TiktokenEncoding }>,
  progressCallback: RepomixProgressCallback,
  chunkSize = 100,
): Promise<FileMetrics[]> {
  const results: FileMetrics[] = [];
  let completedTasks = 0;
  const totalTasks = tasks.length;

  // Process files in chunks
  for (let i = 0; i < tasks.length; i += chunkSize) {
    const chunk = tasks.slice(i, i + chunkSize);
    const chunkPromises = chunk.map((task) => {
      return pool.run(task).then((result) => {
        completedTasks++;
        progressCallback(`Calculating metrics... (${completedTasks}/${totalTasks}) ${pc.dim(task.file.path)}`);
        return result;
      });
    });

    const chunkResults = await Promise.all(chunkPromises);
    results.push(...chunkResults);

    // Allow event loop to process other tasks
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  return results;
}

/**
 * Calculate metrics for all files using a worker thread pool
 */
export const calculateAllFileMetrics = async (
  processedFiles: ProcessedFile[],
  tokenCounterEncoding: TiktokenEncoding,
  progressCallback: RepomixProgressCallback,
): Promise<FileMetrics[]> => {
  const pool = initializeWorkerPool();
  const tasks = processedFiles.map((file, index) => ({
    file,
    index,
    totalFiles: processedFiles.length,
    encoding: tokenCounterEncoding,
  }));

  try {
    const startTime = process.hrtime.bigint();
    logger.trace(`Starting metrics calculation for ${processedFiles.length} files using worker pool`);

    // Process files in chunks
    const results = await processFileChunks(pool, tasks, progressCallback);

    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1e6; // Convert to milliseconds
    logger.trace(`Metrics calculation completed in ${duration.toFixed(2)}ms`);

    return results;
  } catch (error) {
    logger.error('Error during metrics calculation:', error);
    throw error;
  }
};

/**
 * Cleanup worker pool resources
 */
export const cleanupWorkerPool = async (): Promise<void> => {
  if (workerPool) {
    logger.trace('Cleaning up metrics worker pool');
    await workerPool.destroy();
    workerPool = null;
  }
};
