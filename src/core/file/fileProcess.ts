import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pc from 'picocolors';
import { Piscina } from 'piscina';
import type { RepomixConfigMerged } from '../../config/configSchema.js';
import { logger } from '../../shared/logger.js';
import { getWorkerThreadCount } from '../../shared/processConcurrency.js';
import type { RepomixProgressCallback } from '../../shared/types.js';
import { getFileManipulator } from './fileManipulate.js';
import type { ProcessedFile, RawFile } from './fileTypes.js';

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
  logger.trace(`Initializing file process worker pool with min=${minThreads}, max=${maxThreads} threads`);

  workerPool = new Piscina({
    filename: path.resolve(path.dirname(fileURLToPath(import.meta.url)), './workers/fileProcessWorker.js'),
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
  tasks: Array<{ rawFile: RawFile; index: number; totalFiles: number; config: RepomixConfigMerged }>,
  progressCallback: RepomixProgressCallback,
  chunkSize = 100,
): Promise<ProcessedFile[]> {
  const results: ProcessedFile[] = [];
  let completedTasks = 0;
  const totalTasks = tasks.length;

  // Process files in chunks
  for (let i = 0; i < tasks.length; i += chunkSize) {
    const chunk = tasks.slice(i, i + chunkSize);
    const chunkPromises = chunk.map((task) => {
      return pool.run(task).then((result) => {
        completedTasks++;
        progressCallback(`Processing file... (${completedTasks}/${totalTasks}) ${pc.dim(task.rawFile.path)}`);
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
 * Process files using a worker thread pool
 */
export const processFiles = async (
  rawFiles: RawFile[],
  config: RepomixConfigMerged,
  progressCallback: RepomixProgressCallback,
): Promise<ProcessedFile[]> => {
  const pool = initializeWorkerPool();
  const tasks = rawFiles.map((rawFile, index) => ({
    rawFile,
    index,
    totalFiles: rawFiles.length,
    config,
  }));

  try {
    const startTime = process.hrtime.bigint();
    logger.trace(`Starting file processing for ${rawFiles.length} files using worker pool`);

    // Process files in chunks
    const results = await processFileChunks(pool, tasks, progressCallback);

    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1e6; // Convert to milliseconds
    logger.trace(`File processing completed in ${duration.toFixed(2)}ms`);

    return results;
  } catch (error) {
    logger.error('Error during file processing:', error);
    throw error;
  }
};

/**
 * Cleanup worker pool resources
 */
export const cleanupWorkerPool = async (): Promise<void> => {
  if (workerPool) {
    logger.trace('Cleaning up file process worker pool');
    await workerPool.destroy();
    workerPool = null;
  }
};

export const processContent = async (
  content: string,
  filePath: string,
  config: RepomixConfigMerged,
): Promise<string> => {
  let processedContent = content;
  const manipulator = getFileManipulator(filePath);

  logger.trace(`Processing file: ${filePath}`);

  const processStartAt = process.hrtime.bigint();

  if (config.output.removeComments && manipulator) {
    processedContent = manipulator.removeComments(processedContent);
  }

  if (config.output.removeEmptyLines && manipulator) {
    processedContent = manipulator.removeEmptyLines(processedContent);
  }

  processedContent = processedContent.trim();

  if (config.output.showLineNumbers) {
    const lines = processedContent.split('\n');
    const padding = lines.length.toString().length;
    const numberedLines = lines.map((line, index) => `${(index + 1).toString().padStart(padding)}: ${line}`);
    processedContent = numberedLines.join('\n');
  }

  const processEndAt = process.hrtime.bigint();

  logger.trace(`Processed file: ${filePath}. Took: ${(Number(processEndAt - processStartAt) / 1e6).toFixed(2)}ms`);

  return processedContent;
};
