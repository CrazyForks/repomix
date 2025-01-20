import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Piscina } from 'piscina';
import type { TiktokenEncoding } from 'tiktoken';
import { logger } from '../../shared/logger.js';
import { getWorkerThreadCount } from '../../shared/processConcurrency.js';

// Worker pool singleton
let workerPool: Piscina | null = null;

/**
 * Initialize the worker pool
 */
const initializeWorkerPool = (): Piscina => {
  if (workerPool) {
    return workerPool;
  }

  const { minThreads, maxThreads } = getWorkerThreadCount(1);
  logger.trace(`Initializing token count worker pool with min=${minThreads}, max=${maxThreads} threads`);

  workerPool = new Piscina({
    filename: path.resolve(path.dirname(fileURLToPath(import.meta.url)), './workers/tokenCountWorker.js'),
    minThreads,
    maxThreads,
    idleTimeout: 5000,
  });

  return workerPool;
};

/**
 * Cleanup worker pool resources
 */
export const cleanupWorkerPool = async (): Promise<void> => {
  if (workerPool) {
    logger.trace('Cleaning up token count worker pool');
    await workerPool.destroy();
    workerPool = null;
  }
};

/**
 * Count tokens in parallel using a worker thread
 */
export const countTokensParallel = async (
  content: string,
  encoding: TiktokenEncoding,
  path?: string,
): Promise<number> => {
  const pool = initializeWorkerPool();

  try {
    logger.trace(`Starting token count for ${path || 'output'}`);
    const startTime = process.hrtime.bigint();

    const result = await pool.run({ content, encoding, path });

    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1e6;
    logger.trace(`Token count completed in ${duration.toFixed(2)}ms`);

    return result;
  } catch (error) {
    logger.error('Error during token count:', error);
    throw error;
  }
};
