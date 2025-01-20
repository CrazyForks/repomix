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
export const getWorkerThreadCount = (numOfTasks: number): { minThreads: number; maxThreads: number } => {
  const processConcurrency = getProcessConcurrency();

  const minThreads = 1;

  // Limit max threads based on number of tasks
  const maxThreads = Math.max(minThreads, Math.min(processConcurrency, Math.floor(numOfTasks / 100)));

  return {
    minThreads,
    maxThreads: 1,
  };
};
