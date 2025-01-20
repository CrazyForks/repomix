import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Piscina } from 'piscina';
import { logger } from '../../shared/logger.js';
import { getWorkerThreadCount } from '../../shared/processConcurrency.js';
import type { RawFile } from './fileTypes.js';
import type { WorkerPoolConfig } from './workers/types.js';

// Worker pool singleton
let workerPool: Piscina | null = null;

/**
 * Initialize the worker pool with the given configuration
 */
const initializeWorkerPool = (numOfTasks: number): Piscina => {
  if (workerPool) {
    return workerPool;
  }

  const { minThreads, maxThreads } = getWorkerThreadCount( numOfTasks);
  logger.trace(`Initializing worker pool with min=${minThreads}, max=${maxThreads} threads`);

  workerPool = new Piscina({
    filename: path.resolve(path.dirname(fileURLToPath(import.meta.url)), './workers/fileCollectWorker.js'),
    minThreads,
    maxThreads,
    idleTimeout: 5000
  });

  return workerPool;
};

/**
 * Process files in chunks to maintain progress visibility and prevent memory issues
 */
async function processFileChunks(
  pool: Piscina,
  tasks: Array<{ filePath: string; rootDir: string }>,
  chunkSize = 100,
): Promise<RawFile[]> {
  const results: RawFile[] = [];
  let completedTasks = 0;
  const totalTasks = tasks.length;

  // Process files in chunks
  for (let i = 0; i < tasks.length; i += chunkSize) {
    const chunk = tasks.slice(i, i + chunkSize);
    const chunkPromises = chunk.map((task) => {
      return pool.run(task).then((result) => {
        completedTasks++;
        const percent = ((completedTasks / totalTasks) * 100).toFixed(1);
        logger.trace(`Processing files... (${completedTasks}/${totalTasks}) ${percent}% ${task.filePath}`);
        return result;
      });
    });

    const chunkResults = await Promise.all(chunkPromises);
    results.push(...chunkResults.filter((file): file is RawFile => file !== null));

    // Allow event loop to process other tasks
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  return results;
}

/**
 * Collects and reads files using a worker thread pool
 */
export const collectFiles = async (
  filePaths: string[],
  rootDir: string,
): Promise<RawFile[]> => {
  const pool = initializeWorkerPool(filePaths.length);
  const tasks = filePaths.map((filePath) => ({
    filePath,
    rootDir,
  }));

  try {
    const startTime = process.hrtime.bigint();
    logger.trace(`Starting file collection for ${filePaths.length} files using worker pool`);

    // Process files in chunks
    const results = await processFileChunks(pool, tasks);

    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1e6; // Convert to milliseconds
    logger.trace(`File collection completed in ${duration.toFixed(2)}ms`);

    return results;
  } catch (error) {
    logger.error('Error during file collection:', error);
    throw error;
  }
};

/**
 * Cleanup worker pool resources
 */
export const cleanupWorkerPool = async (): Promise<void> => {
  if (workerPool) {
    logger.trace('Cleaning up worker pool');
    await workerPool.destroy();
    workerPool = null;
  }
};
