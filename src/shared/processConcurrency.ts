import os from 'node:os';

/**
 * Get the number of CPU cores available for processing
 */
export const getProcessConcurrency = (): number => {
  return os.cpus().length;
};

/**
 * Get the minimum and maximum number of threads for worker pools
 */
export const getWorkerThreadCount = (): { minThreads: number; maxThreads: number } => {
  const processConcurrency = getProcessConcurrency();
  return {
    minThreads: Math.max(1, Math.floor(processConcurrency / 2)),
    maxThreads: processConcurrency,
  };
};
